'use server';

/**
 * @fileOverview A Genkit flow for polishing written text.
 *
 * - polishWriting - A function that improves grammar, spelling, and flow without changing content.
 * - PolishWritingInput - The input type for the polishWriting function.
 * - PolishWritingOutput - The return type for the polishWriting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PolishWritingInputSchema = z.object({
  draftContent: z.string().describe('The draft text to be polished.'),
});
export type PolishWritingInput = z.infer<typeof PolishWritingInputSchema>;

const PolishWritingOutputSchema = z.object({
  polishedContent: z.string().describe('The polished version of the text.'),
});
export type PolishWritingOutput = z.infer<typeof PolishWritingOutputSchema>;

export async function polishWriting(input: PolishWritingInput): Promise<PolishWritingOutput> {
  return polishWritingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'polishWritingPrompt',
  input: {schema: PolishWritingInputSchema},
  output: {schema: PolishWritingOutputSchema},
  prompt: `You are an expert copy editor. Your task is to polish the following text.
  
  Please correct any grammar, spelling, and punctuation errors. Improve sentence structure and flow for better readability.
  
  IMPORTANT: Do NOT change the meaning of the text. Do not add or remove any information, plot points, or character actions. Only perform edits that improve the quality of the writing itself.
  
  Original Text:
  {{{draftContent}}}
  
  Return ONLY the polished text in the 'polishedContent' field of the JSON output.`,
});

const polishWritingFlow = ai.defineFlow(
  {
    name: 'polishWritingFlow',
    inputSchema: PolishWritingInputSchema,
    outputSchema: PolishWritingOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to polish the text. Please try again.");
    }
    return output;
  }
);
