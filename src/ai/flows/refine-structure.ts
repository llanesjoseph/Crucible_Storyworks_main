'use server';
/**
 * @fileOverview A Genkit flow for refining a story's central conflict.
 */

import {ai} from '@/ai/genkit';
import {
  RefineStructureInputSchema,
  RefineStructureOutputSchema,
  type RefineStructureInput,
  type RefineStructureOutput
} from '@/lib/refine-structure-schema';


export async function refineStructure(input: RefineStructureInput): Promise<RefineStructureOutput> {
  return refineStructureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineStructurePrompt',
  input: {schema: RefineStructureInputSchema},
  output: {schema: RefineStructureOutputSchema},
  prompt: `You are a creative co-writer and story development assistant. A writer is defining their story's structure and wants to {{action}} the central conflict.

**Story Context:**
- Title: {{#if concept.title}}{{{concept.title}}}{{else}}N/A{{/if}}
- Genre: {{{concept.genre}}}
- Tone: {{{concept.tone}}}
{{#if concept.gradeLevel}}- Grade Level: {{{concept.gradeLevel}}}{{/if}}
- Logline: {{#if concept.logline}}{{{concept.logline}}}{{else}}N/A{{/if}}
- Characters:
{{#each characters}}
  - Name: {{{this.name}}} ({{{this.role}}})
{{/each}}
- Setting: {{{setting.location}}}

**Current Central Conflict:**
{{{structure.centralConflict}}}

**Writer's Request to {{action}} conflict:**
{{{refinementPrompt}}}

Your task is to rewrite the central conflict based on the writer's request.
- If the action is to 'refine', make it more compelling, specific, or aligned with their new direction.
- If the action is to 'expand', add more stakes, sub-conflicts, or complexity.

Present your output in the requested structured JSON format, with the new conflict in the 'refinedCentralConflict' field.`,
});

const refineStructureFlow = ai.defineFlow(
  {
    name: 'refineStructureFlow',
    inputSchema: RefineStructureInputSchema,
    outputSchema: RefineStructureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a valid refinement. Please try adjusting your request.");
    }
    return output;
  }
);
