"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { generateIdeas, FormState } from "@/app/ai-tools/idea-sparker/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, LoaderCircle, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Ideas
        </>
      )}
    </Button>
  );
}

export function IdeaSparkerForm() {
  const initialState: FormState = {};
  const [state, formAction] = useFormState(generateIdeas, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Prompt</CardTitle>
          <CardDescription>
            Enter a prompt to inspire the AI. The more detailed, the better!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              name="prompt"
              placeholder="e.g., A detective who is afraid of the dark, a magical library where books come alive..."
              className="min-h-[120px]"
              aria-describedby="prompt-error"
            />
            {state?.fieldErrors?.prompt && (
                <p id="prompt-error" className="text-sm font-medium text-destructive">
                    {state.fieldErrors.prompt.join(", ")}
                </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
      
      {state?.storyIdeas && state.storyIdeas.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold tracking-tight font-headline text-center mb-4">
            Generated Ideas
          </h3>
          <div className="space-y-4">
            {state.storyIdeas.map((idea, index) => (
              <Card key={index} className="bg-secondary">
                <CardContent className="p-4 flex items-start gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                    <Wand2 className="w-5 h-5" />
                  </span>
                  <p className="text-sm">{idea}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
