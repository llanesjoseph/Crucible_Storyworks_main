
"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { regenerateOutlineAction, type RegenerateOutlineFormState } from "@/app/stories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { StoryData } from "@/lib/data";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Regenerate Outline
                </>
            )}
        </Button>
    );
}

export function OutlineControls({ story }: { story: StoryData }) {
    const initialState: RegenerateOutlineFormState = {};
    const [state, formAction] = useFormState(regenerateOutlineAction, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.error) {
            toast({ variant: "destructive", title: "Generation Failed", description: state.error });
        }
        if (state?.success) {
            toast({ title: "Success!", description: "The chapter outline has been regenerated." });
        }
    }, [state, toast]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">AI-Assisted Outline</CardTitle>
                <CardDescription>
                    Adjust the number of chapters and let the AI generate a new outline for your story.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="flex items-end gap-4">
                    <input type="hidden" name="storyId" value={story.id} />
                    <input type="hidden" name="title" value={story.title} />
                    <input type="hidden" name="logline" value={story.concept.logline || ''} />
                    <input type="hidden" name="centralConflict" value={story.structure.centralConflict} />
                    <input type="hidden" name="characters" value={JSON.stringify(story.characters)} />

                    <div className="grid flex-1 gap-1.5">
                        <Label htmlFor="numChapters">Number of Chapters</Label>
                        <Input
                            id="numChapters"
                            name="numChapters"
                            type="number"
                            placeholder="e.g., 10"
                            defaultValue={story.structure.numChapters}
                            min="1"
                            max="50"
                            required
                        />
                        {state?.fieldErrors?.numChapters && (
                            <p className="text-sm font-medium text-destructive">
                                {state.fieldErrors.numChapters.join(", ")}
                            </p>
                        )}
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
