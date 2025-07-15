import { z } from 'zod';
import { GenerateStoryFrameworkInputSchema } from '@/lib/story-framework-schema';

export const RefineCharactersInputSchema = z.object({
  characters: GenerateStoryFrameworkInputSchema.shape.characters,
  action: z.enum(['refine', 'expand']),
  refinementPrompt: z.string().describe("The user's instructions for how to change the characters."),
});
export type RefineCharactersInput = z.infer<typeof RefineCharactersInputSchema>;

export const RefineCharactersOutputSchema = z.object({
    refinedCharacters: GenerateStoryFrameworkInputSchema.shape.characters,
});
export type RefineCharactersOutput = z.infer<typeof RefineCharactersOutputSchema>;
