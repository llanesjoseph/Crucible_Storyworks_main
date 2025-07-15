'use server';
/**
 * @fileOverview A Genkit flow for refining a story's characters.
 */

import {ai} from '@/ai/genkit';
import {
  RefineCharactersInputSchema,
  RefineCharactersOutputSchema,
  type RefineCharactersInput,
  type RefineCharactersOutput,
} from '@/lib/refine-characters-schema';


export async function refineCharacters(input: RefineCharactersInput): Promise<RefineCharactersOutput> {
  return refineCharactersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineCharactersPrompt',
  input: {schema: RefineCharactersInputSchema},
  output: {schema: RefineCharactersOutputSchema},
  prompt: `You are a creative co-writer and character development specialist. A writer is working on their cast of characters and wants some help.

**Current Characters:**
{{#each characters}}
- **Name:** {{{this.name}}}
  - **Role:** {{{this.role}}}
  - **Traits:** {{#each this.traits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

**Writer's Request to {{action}} characters:**
{{{refinementPrompt}}}

Your task is to {{#if (eq action 'refine')}}refine the existing list of characters{{else}}expand upon the list of characters{{/if}} based on the writer's request.
- If refining, you might alter existing character details.
- If expanding, you might add new characters or add significant new traits/details to existing ones.
- If the writer asks to remove a character, please do so.

Return the complete, updated list of characters in the 'refinedCharacters' field.`,
});

const refineCharactersFlow = ai.defineFlow(
  {
    name: 'refineCharactersFlow',
    inputSchema: RefineCharactersInputSchema,
    outputSchema: RefineCharactersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a valid refinement. Please try adjusting your request.");
    }
    return output;
  }
);
