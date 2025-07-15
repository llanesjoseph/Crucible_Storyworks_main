"use server";

import { generateStoryIdeas } from "@/ai/flows/generate-story-ideas";
import { z } from "zod";

const IdeaSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
});

export type FormState = {
  storyIdeas?: string[];
  error?: string;
  fieldErrors?: {
    prompt?: string[];
  };
};

export async function generateIdeas(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = IdeaSchema.safeParse({
    prompt: formData.get("prompt"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid prompt. Please check your input.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateStoryIdeas({ prompt: validatedFields.data.prompt });
    if (result.storyIdeas && result.storyIdeas.length > 0) {
      return { storyIdeas: result.storyIdeas };
    }
    return { error: "The AI could not generate ideas for this prompt. Please try a different one." };
  } catch (e) {
    console.error(e);
    return { error: "An unexpected error occurred while generating ideas." };
  }
}
