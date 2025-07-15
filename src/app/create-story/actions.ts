
"use server";

import { generateStoryFramework } from "@/ai/flows/generate-story-framework";
import { GenerateStoryFrameworkInputSchema, type GenerateStoryFrameworkOutput, type GenerateStoryFrameworkInput } from '@/lib/story-framework-schema';

export type GenerateOutlineState = {
  data?: GenerateStoryFrameworkOutput;
  error?: string;
};

// This function is called from the client to generate the AI outline.
// It does not interact with Firestore directly.
export async function generateOutline(frameworkData: GenerateStoryFrameworkInput): Promise<GenerateOutlineState> {
  try {
    // The input is already validated on the client, but we can re-validate here for safety.
    const validatedData = GenerateStoryFrameworkInputSchema.safeParse(frameworkData);
    if (!validatedData.success) {
      throw new Error(`Invalid framework data provided to server action: ${validatedData.error.message}`);
    }

    const generatedContent = await generateStoryFramework(validatedData.data);
    
    if (!generatedContent || !generatedContent.chapterBreakdown || generatedContent.chapterBreakdown.length === 0) {
        throw new Error("The AI failed to generate a chapter outline. Please try again.");
    }

    return { data: generatedContent };

  } catch (e) {
    console.error("Error generating outline:", e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during AI outline generation.";
    return { error: errorMessage };
  }
}
