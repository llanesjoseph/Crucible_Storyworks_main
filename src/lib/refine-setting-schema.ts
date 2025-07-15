import { z } from 'zod';
import { GenerateStoryFrameworkInputSchema } from '@/lib/story-framework-schema';

export const RefineSettingInputSchema = z.object({
  setting: GenerateStoryFrameworkInputSchema.shape.setting,
  concept: GenerateStoryFrameworkInputSchema.shape.concept,
  characters: GenerateStoryFrameworkInputSchema.shape.characters,
  action: z.enum(['refine', 'expand']),
  refinementPrompt: z.string().describe("The user's instructions for how to change the setting."),
});
export type RefineSettingInput = z.infer<typeof RefineSettingInputSchema>;

export const RefineSettingOutputSchema = z.object({
    refinedSetting: GenerateStoryFrameworkInputSchema.shape.setting,
});
export type RefineSettingOutput = z.infer<typeof RefineSettingOutputSchema>;
