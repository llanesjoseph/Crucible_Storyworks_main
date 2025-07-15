'use server';
/**
 * @fileOverview A Genkit flow for developing a core story concept.
 */

import {ai} from '@/ai/genkit';
import {
  DevelopConceptInputSchema,
  DevelopConceptOutputSchema,
  type DevelopConceptInput,
  type DevelopConceptOutput,
} from '@/lib/develop-concept-schema';


export async function developConcept(input: DevelopConceptInput): Promise<DevelopConceptOutput> {
  return developConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'developConceptPrompt',
  input: {schema: DevelopConceptInputSchema},
  output: {schema: DevelopConceptOutputSchema},
  prompt: `You are a creative co-writer and story development assistant.
A user has provided the following core concept for a story:
{{#if title}}- Title: {{{title}}}{{/if}}
{{#if gradeLevel}}- Grade Level: {{{gradeLevel}}}{{/if}}
- Genre: {{{genre}}}
- Tone: {{{tone}}}
{{#if logline}}- Logline: {{{logline}}}{{/if}}

Your task is to expand upon this initial idea to help the writer build a full story framework. Please generate the following creative suggestions:

1.  **Enhanced Logline**: Refine the user's logline to make it more compelling and detailed. If no logline was provided, create one based on the other inputs.
2.  **Suggested Characters**: Propose 2-3 main characters that would fit this story. For each character, provide a name, their role (e.g., Protagonist, Antagonist, Mentor), a comma-separated list of 3-4 key traits, and a brief one-sentence description.
3.  **Suggested Setting**: Describe a compelling setting. Provide a timeframe, a primary location, and a short paragraph detailing the world's atmosphere and unique characteristics.
4.  **Suggested Structure**: Define a central conflict that will drive the plot. Based on the genre and tone, also suggest a reasonable number of chapters for this story (between 8 and 20).

Present your output in the requested structured JSON format. Be creative and provide ideas that will inspire the writer.`,
});

const developConceptFlow = ai.defineFlow(
  {
    name: 'developConceptFlow',
    inputSchema: DevelopConceptInputSchema,
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
