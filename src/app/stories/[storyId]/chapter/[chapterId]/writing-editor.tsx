
"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { getWritingFeedback, polishDraftAction, type WritingFeedbackFormState } from "@/app/stories/actions";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, LoaderCircle, Save, Check, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GenerateStoryFrameworkOutput } from '@/lib/story-framework-schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Getting Suggestions...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Get AI Suggestions
        </>
      )}
    </Button>
  );
}

export function WritingEditor({
  storyId,
  chapterNumber,
  initialDraftContent,
  initialFinalFeedback,
  chapterBreakdown,
}: {
  storyId: string;
  chapterNumber: number;
  initialDraftContent: string;
  initialFinalFeedback: string;
  chapterBreakdown: GenerateStoryFrameworkOutput['chapterBreakdown'];
}) {
  const initialState: WritingFeedbackFormState = {};
  const [state, formAction] = useFormState(getWritingFeedback, initialState);
  const { toast } = useToast();

  const [draftContent, setDraftContent] = useState(initialDraftContent);
  const [finalFeedback, setFinalFeedback] = useState(initialFinalFeedback);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishApplied, setPolishApplied] = useState(false);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
    if (state?.feedback) {
        setFinalFeedback(state.feedback);
        toast({ title: "AI suggestions received!", description: "You can now review, edit, and save the feedback below." });
    }
  }, [state, toast]);

  useEffect(() => {
    setDraftContent(initialDraftContent);
    setFinalFeedback(initialFinalFeedback);
  }, [initialDraftContent, initialFinalFeedback, chapterNumber]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setIsSaved(false);

    const chapterIndex = chapterBreakdown.findIndex(c => c.chapterNumber === chapterNumber);
    if (chapterIndex === -1) {
        toast({ variant: "destructive", title: "Save Failed", description: "This chapter could not be found in the story data." });
        setIsSaving(false);
        return;
    }

    const updatedChapters = [...chapterBreakdown];
    updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        draftContent: draftContent,
    };

    const storyRef = doc(db, 'stories', storyId);
    
    try {
        await updateDoc(storyRef, {
            'generatedContent.chapterBreakdown': updatedChapters,
            'lastUpdated': new Date().toISOString()
        });

        toast({ title: "Draft Saved!", description: "Your chapter progress has been saved."});
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
        console.error("Error saving chapter draft:", e);
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
        const friendlyMessage = errorMessage.includes('permission-denied')
            ? "Permission denied. Please check your Firestore security rules."
            : `Failed to save draft: ${errorMessage}`;
        toast({ variant: "destructive", title: "Save Failed", description: friendlyMessage });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleSaveFeedback = async () => {
    setIsSavingFeedback(true);
    setFeedbackSaved(false);

    const chapterIndex = chapterBreakdown.findIndex(c => c.chapterNumber === chapterNumber);
    if (chapterIndex === -1) {
        toast({ variant: "destructive", title: "Save Failed", description: "This chapter could not be found." });
        setIsSavingFeedback(false);
        return;
    }

    const updatedChapters = [...chapterBreakdown];
    updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        finalFeedback: finalFeedback,
    };

    const storyRef = doc(db, 'stories', storyId);
    
    try {
        await updateDoc(storyRef, {
            'generatedContent.chapterBreakdown': updatedChapters,
            'lastUpdated': new Date().toISOString()
        });

        toast({ title: "Feedback Saved!", description: "The collaborative feedback has been saved for this chapter."});
        setFeedbackSaved(true);
        setTimeout(() => setFeedbackSaved(false), 2000);
    } catch (e) {
        console.error("Error saving feedback:", e);
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
        const friendlyMessage = errorMessage.includes('permission-denied')
            ? "Permission denied. Please check your Firestore security rules."
            : `Failed to save feedback: ${errorMessage}`;
        toast({ variant: "destructive", title: "Save Failed", description: friendlyMessage });
    } finally {
        setIsSavingFeedback(false);
    }
  };

  const handlePolishDraft = async () => {
    if (!draftContent.trim()) {
      toast({
        variant: 'destructive',
        title: 'Draft is empty',
        description: 'Please write something before polishing.',
      });
      return;
    }
    setIsPolishing(true);
    try {
      const result = await polishDraftAction(draftContent);
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.polishedDraft) {
        setDraftContent(result.polishedDraft);
        setPolishApplied(true);
        toast({
          title: 'Draft Polished!',
          description: 'The AI has polished your chapter draft.',
        });
      }
    } catch (e) {
      console.error('Failed to polish draft:', e);
      const errorMessage =
        e instanceof Error ? e.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Polishing Failed',
        description: errorMessage,
      });
    } finally {
      setIsPolishing(false);
    }
  };


  return (
    <div className="space-y-6">
        <form action={formAction}>
        <input type="hidden" name="studentWriting" value={draftContent} />
        <input type="hidden" name="wasPolished" value={String(polishApplied)} />
        <Card>
            <CardHeader>
            <CardTitle className="font-headline text-lg">Chapter Draft</CardTitle>
            <CardDescription>Write the chapter content below. You must provide your own initial feedback before the AI can provide suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid w-full gap-1.5">
                <Label htmlFor="student-writing-textarea">Your Writing</Label>
                <Textarea
                id="student-writing-textarea"
                placeholder="It was a dark and stormy night..."
                className="min-h-[400px] text-base"
                value={draftContent}
                onChange={(e) => {
                    setDraftContent(e.target.value);
                    setPolishApplied(false);
                }}
                />
            </div>
            <div className="grid w-full gap-1.5">
                <Label htmlFor="gradeLevel">Grade Level (Optional)</Label>
                <Select name="gradeLevel">
                <SelectTrigger id="gradeLevel">
                    <SelectValue placeholder="Select a grade level to tailor feedback" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Elementary School">Elementary School</SelectItem>
                    <SelectItem value="Middle School">Middle School</SelectItem>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="College">College</SelectItem>
                    <SelectItem value="General Audience">General Audience</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="grid w-full gap-1.5">
                <Label htmlFor="educator-prompt">Teacher's Initial Feedback (Required)</Label>
                <Textarea
                id="educator-prompt"
                name="educatorPrompt"
                placeholder="e.g., Please check for plot consistency and suggest ways to improve the main character's dialogue. I feel the pacing is a bit slow in the first half."
                aria-describedby="educator-prompt-error"
                />
                 {state?.fieldErrors?.educatorPrompt && (
                    <p id="educator-prompt-error" className="text-sm font-medium text-destructive">
                        {state.fieldErrors.educatorPrompt.join(", ")}
                    </p>
                )}
            </div>
            
            </CardContent>
            <CardFooter className="justify-between">
                <Button type="button" onClick={handleSaveDraft} variant="secondary" disabled={isSaving || isSaved || isPolishing}>
                {isSaving ? (
                    <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : isSaved ? (
                    <><Check className="mr-2 h-4 w-4 text-green-500" />Saved!</>
                ) : (
                    <><Save className="mr-2 h-4 w-4" />Save Draft</>
                )}
                </Button>
                <div className="flex items-center gap-2">
                    <Button type="button" onClick={handlePolishDraft} variant="outline" disabled={isPolishing || isSaving}>
                    {isPolishing ? (
                        <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Polishing...
                        </>
                    ) : (
                        <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Polish with AI
                        </>
                    )}
                    </Button>
                    <SubmitButton disabled={isPolishing || isSaving} />
                </div>
            </CardFooter>
        </Card>
        </form>

        {(state.feedback || finalFeedback) && (
            <Card className="bg-secondary">
                <CardHeader>
                    <CardTitle className="font-headline text-base flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    Collaborative Feedback
                    </CardTitle>
                    <CardDescription>
                        Review and edit the AI-assisted feedback below. Save it to attach it to this chapter.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={finalFeedback}
                        onChange={(e) => setFinalFeedback(e.target.value)}
                        className="min-h-[200px] bg-background"
                        placeholder="AI feedback will appear here..."
                    />
                </CardContent>
                <CardFooter>
                    <Button type="button" onClick={handleSaveFeedback} disabled={isSavingFeedback || feedbackSaved}>
                        {isSavingFeedback ? (
                            <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Saving Feedback...</>
                        ) : feedbackSaved ? (
                            <><Check className="mr-2 h-4 w-4" />Feedback Saved!</>
                        ) : (
                            <><Save className="mr-2 h-4 w-4" />Save Feedback</>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        )}
    </div>
  );
}
