import { z } from 'zod';
import { GenerateStoryFrameworkInputSchema } from '@/lib/story-framework-schema';

export const RefineStructureInputSchema = z.object({
  concept: GenerateStoryFrameworkInputSchema.shape.concept,
  characters: GenerateStoryFrameworkInputSchema.shape.characters,
  setting: GenerateStoryFrameworkInputSchema.shape.setting,
  structure: GenerateStoryFrameworkInputSchema.shape.structure,
  action: z.enum(['refine', 'expand']),
  refinementPrompt: z.string().describe("The user's instructions for how to change the central conflict."),
});
export type RefineStructureInput = z.infer<typeof RefineStructureInputSchema>;

export const RefineStructureOutputSchema = z.object({
    refinedCentralConflict: z.string().describe("The new, refined central conflict based on the user's request."),
});
export type RefineStructureOutput = z.infer<typeof RefineStructureOutputSchema>;
