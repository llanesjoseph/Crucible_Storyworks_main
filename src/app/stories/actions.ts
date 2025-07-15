
'use server';

import { z } from 'zod';
import { regenerateChapterOutline } from '@/ai/flows/regenerate-chapter-outline';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { GenerateStoryFrameworkInputSchema } from '@/lib/story-framework-schema';
import { provideWritingFeedback, type ProvideWritingFeedbackInput } from "@/ai/flows/provide-writing-feedback";
import { polishWriting } from "@/ai/flows/polish-writing";
import { logAuditEvent } from '@/lib/audit-logging';


// For Outline Regeneration
const RegenerateSchema = z.object({
    storyId: z.string(),
    numChapters: z.coerce.number().min(1, "Must have at least 1 chapter.").max(50, "Cannot generate more than 50 chapters."),
    title: z.string(),
    logline: z.string().optional(),
    centralConflict: z.string(),
    characters: z.string().transform((val) => JSON.parse(val)),
});

export type RegenerateOutlineFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    numChapters?: string[];
  };
};

export async function regenerateOutlineAction(prevState: RegenerateOutlineFormState, formData: FormData): Promise<RegenerateOutlineFormState> {
    const validatedFields = RegenerateSchema.safeParse({
        storyId: formData.get('storyId'),
        numChapters: formData.get('numChapters'),
        title: formData.get('title'),
        logline: formData.get('logline'),
        centralConflict: formData.get('centralConflict'),
        characters: formData.get('characters'),
    });

    if (!validatedFields.success) {
        return {
            error: "Invalid input.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { storyId, numChapters, title, logline, centralConflict, characters } = validatedFields.data;

    try {
        const { chapterBreakdown } = await regenerateChapterOutline({ 
            title,
            logline,
            centralConflict,
            characters: characters as z.infer<typeof GenerateStoryFrameworkInputSchema.shape.characters>,
            numChapters,
        });
        
        const storyRef = doc(db, 'stories', storyId);

        await updateDoc(storyRef, {
            'generatedContent.chapterBreakdown': chapterBreakdown,
            'chapters': chapterBreakdown.length,
            'structure.numChapters': numChapters,
            'lastUpdated': new Date().toISOString(),
            'status': 'complete',
        });

        revalidatePath(`/stories/${storyId}/outline`);
        return { success: true };

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
        return { error: `Failed to regenerate outline: ${errorMessage}` };
    }
}


const UpdateModeSchema = z.object({
    storyId: z.string(),
    mode: z.enum(['solo', 'group']),
});

export async function updateCollaborationMode(storyId: string, mode: 'solo' | 'group'): Promise<{ success?: boolean; error?: string; }> {
    const validatedFields = UpdateModeSchema.safeParse({ storyId, mode });

    if (!validatedFields.success) {
        return { error: 'Invalid input provided.' };
    }

    try {
        const storyRef = doc(db, 'stories', storyId);
        await updateDoc(storyRef, {
            'concept.collaborationMode': mode,
            'lastUpdated': new Date().toISOString(),
        });

        revalidatePath(`/stories/${storyId}/outline`);
        return { success: true };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
        return { error: `Failed to update mode: ${errorMessage}` };
    }
}


// For Chapter Writing Feedback
const ProvideFeedbackSchema = z.object({
  studentWriting: z.string().min(10, "Please enter some writing to get feedback."),
  educatorPrompt: z.string().min(10, "Please provide your initial thoughts (at least 10 characters) to guide the AI."),
  gradeLevel: z.string().optional(),
  wasPolished: z.string().transform(val => val === 'true').optional(),
});

export type WritingFeedbackFormState = {
  feedback?: string;
  error?: string;
  fieldErrors?: {
    studentWriting?: string[];
    educatorPrompt?: string[];
    gradeLevel?: string[];
  };
};

export async function getWritingFeedback(
  prevState: WritingFeedbackFormState,
  formData: FormData
): Promise<WritingFeedbackFormState> {
  const validatedFields = ProvideFeedbackSchema.safeParse({
    studentWriting: formData.get("studentWriting"),
    educatorPrompt: formData.get("educatorPrompt"),
    gradeLevel: formData.get("gradeLevel"),
    wasPolished: formData.get("wasPolished"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid input.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { studentWriting, educatorPrompt, gradeLevel, wasPolished } = validatedFields.data;

  try {
    const input: ProvideWritingFeedbackInput = {
      studentWriting,
      ...(educatorPrompt && { educatorPrompt }),
      ...(gradeLevel && { gradeLevel }),
      ...(wasPolished && { wasPolished }),
    };

    const result = await provideWritingFeedback(input);
    return { feedback: result.feedback };
  } catch (e) {
    console.error(e);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

const PolishDraftSchema = z.object({
  draftContent: z.string().min(1, "Draft cannot be empty."),
});

export async function polishDraftAction(draftContent: string): Promise<{ polishedDraft?: string; error?: string; }> {
  const validatedFields = PolishDraftSchema.safeParse({ draftContent });

  if (!validatedFields.success) {
    return {
      error: "Invalid draft content provided.",
    };
  }
  
  try {
    const result = await polishWriting({ draftContent: validatedFields.data.draftContent });
    return { polishedDraft: result.polishedContent };
  } catch (e) {
    console.error("Polishing error:", e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred while polishing the draft.";
    return { error: errorMessage };
  }
}

// For Deleting a story
type DeleteResult = {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
};

export async function deleteStoryAction(storyId: string, user: { uid: string, email: string | null }): Promise<DeleteResult> {
  if (!user.uid) {
    return { success: false, error: { code: 'UNAUTHENTICATED', message: 'User is not authenticated.' } };
  }

  const storyRef = doc(db, 'stories', storyId);

  try {
    await logAuditEvent({
      userId: user.uid,
      userEmail: user.email,
      action: 'DELETE_STORY',
      targetResourceId: storyId,
    });

    await deleteDoc(storyRef);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    console.error("Error deleting story:", e);
    
    let errorMessage = "An unexpected error occurred.";
    let errorCode = 'UNKNOWN';

    if (e.code === 'permission-denied') {
        errorMessage = 'You do not have permission to delete this story. Please check your Firestore security rules to ensure that a user can delete a story if `request.auth.uid == resource.data.userId`.';
        errorCode = 'PERMISSION_DENIED';
    } else if (e instanceof Error) {
        errorMessage = e.message;
    }

    return { 
      success: false, 
      error: {
        code: errorCode,
        message: errorMessage 
      }
    };
  }
}
