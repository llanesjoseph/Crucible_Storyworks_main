'use server';
/**
 * @fileOverview A Genkit flow for refining a story's setting.
 */

import {ai} from '@/ai/genkit';
import {
  RefineSettingInputSchema,
  RefineSettingOutputSchema,
  type RefineSettingInput,
  type RefineSettingOutput,
} from '@/lib/refine-setting-schema';


export async function refineSetting(input: RefineSettingInput): Promise<RefineSettingOutput> {
  return refineSettingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineSettingPrompt',
  input: {schema: RefineSettingInputSchema},
  output: {schema: RefineSettingOutputSchema},
  prompt: `You are a creative co-writer and world-building expert. A writer is working on their story's setting and wants some help.

**Story Context:**
- Genre: {{{concept.genre}}}
- Tone: {{{concept.tone}}}
{{#if concept.gradeLevel}}- Grade Level: {{{concept.gradeLevel}}}{{/if}}
- Logline: {{{concept.logline}}}
- Characters:
{{#each characters}}
  - {{{this.name}}} ({{{this.role}}})
{{/each}}

**Current Setting:**
- Timeframe: {{{setting.timeframe}}}
- Location: {{{setting.location}}}
- World Description: {{{setting.worldDescription}}}

**Writer's Request to {{action}} setting:**
{{{refinementPrompt}}}

Your task is to {{#if (eq action 'refine')}}refine the existing setting{{else}}expand upon the existing setting{{/if}} based on the writer's request.
- If refining, you might alter existing details to be more specific or aligned with the request.
- If expanding, you should add new details, lore, or descriptions to the world.

Return the complete, updated setting details in the 'refinedSetting' field.`,
});

const refineSettingFlow = ai.defineFlow(
  {
    name: 'refineSettingFlow',
    inputSchema: RefineSettingInputSchema,
    outputSchema: RefineSettingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a valid refinement. Please try adjusting your request.");
    }
    return output;
  }
);
