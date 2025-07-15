'use server';
/**
 * @fileOverview A Genkit flow for refining a story concept with further user input.
 */

import {ai} from '@/ai/genkit';
import {
  DevelopConceptOutputSchema,
  type DevelopConceptOutput,
} from '@/lib/develop-concept-schema';
import { RefineConceptInputSchema, type RefineConceptInput } from '@/lib/refine-concept-schema';


export async function refineConcept(input: RefineConceptInput): Promise<DevelopConceptOutput> {
  return refineConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineConceptPrompt',
  input: {schema: RefineConceptInputSchema},
  output: {schema: DevelopConceptOutputSchema},
  prompt: `You are a creative co-writer and story development assistant. A writer has an initial concept and you have already provided a set of suggestions. Now, the writer wants to {{action}} those suggestions.

**Original Concept:**
- Title: {{#if concept.title}}{{{concept.title}}}{{else}}N/A{{/if}}
- Genre: {{{concept.genre}}}
- Tone: {{{concept.tone}}}
{{#if concept.gradeLevel}}- Grade Level: {{{concept.gradeLevel}}}{{/if}}
- Logline: {{#if concept.logline}}{{{concept.logline}}}{{else}}N/A{{/if}}

**Current Suggestions (that you provided):**
- Enhanced Logline: {{{currentSuggestions.enhancedLogline}}}
- Suggested Characters:
{{#each currentSuggestions.suggestedCharacters}}
  - Name: {{{this.name}}} ({{{this.role}}}) - {{{this.description}}}
{{/each}}
- Suggested Setting: {{{currentSuggestions.suggestedSetting.location}}} - {{{currentSuggestions.suggestedSetting.worldDescription}}}
- Suggested Central Conflict: {{{currentSuggestions.suggestedStructure.centralConflict}}}

**Writer's Request to {{action}} suggestions:**
{{{refinementPrompt}}}

Your task is to regenerate the *entire* set of creative suggestions (logline, characters, setting, and structure) based on the writer's request.
- If the action is to 'refine', you should alter the existing suggestions to better fit the request.
- If the action is to 'expand', you should add more detail or new elements based on the request.
Ensure the new suggestions are cohesive and still adhere to the original concept, but incorporate the writer's feedback.

Present your output in the requested structured JSON format. Be creative and provide ideas that will inspire the writer.`,
});

const refineConceptFlow = ai.defineFlow(
  {
    name: 'refineConceptFlow',
    inputSchema: RefineConceptInputSchema,
    outputSchema: DevelopConceptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate valid suggestions. Please try adjusting your concept.");
    }
    return output;
  }
);
