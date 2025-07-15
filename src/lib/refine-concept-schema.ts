import { z } from 'zod';
import {
  DevelopConceptInputSchema,
  DevelopConceptOutputSchema,
} from '@/lib/develop-concept-schema';

export const RefineConceptInputSchema = z.object({
  concept: DevelopConceptInputSchema,
  currentSuggestions: DevelopConceptOutputSchema,
  action: z.enum(['refine', 'expand']),
  refinementPrompt: z.string().describe("The user's instructions for how to change the suggestions."),
});
export type RefineConceptInput = z.infer<typeof RefineConceptInputSchema>;
