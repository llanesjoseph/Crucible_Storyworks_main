'use server';
/**
 * @fileOverview A Genkit flow for generating a synopsis of a story up to a specific chapter.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input now takes the pre-formatted data, not the storyId.
const GenerateStorySynopsisInputSchema = z.object({
  storyTitle: z.string().describe("The title of the story."),
  relevantChaptersSummary: z.string().describe("A formatted string containing the summaries and written draft content of previous chapters."),
  isFirstChapter: z.boolean().describe("A flag to indicate if this is the first chapter."),
});
export type GenerateStorySynopsisInput = z.infer<typeof GenerateStorySynopsisInputSchema>;

const GenerateStorySynopsisOutputSchema = z.object({
  synopsis: z.string().describe("A concise summary of the story's key events, character developments, and plot points up to the specified chapter."),
});
export type GenerateStorySynopsisOutput = z.infer<typeof GenerateStorySynopsisOutputSchema>;

export async function generateStorySynopsis(input: GenerateStorySynopsisInput): Promise<GenerateStorySynopsisOutput> {
  return generateStorySynopsisFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateStorySynopsisPrompt',
    // Prompt input schema matches the flow's new input schema (minus the flag).
    input: { schema: z.object({ storyTitle: z.string(), relevantChaptersSummary: z.string() }) },
    output: { schema: GenerateStorySynopsisOutputSchema },
    prompt: `You are a helpful writing assistant. A writer is working on a chapter of their story and needs a reminder of what has happened so far to ensure continuity.

    Based on the story title and the content from previous chapters provided below, generate a concise synopsis. The content includes chapter summaries and the actual text written by the user.

    **Give precedence to the 'Written Content'** as it represents the most accurate account of the story events. Use the summaries for context if the written content is missing. The synopsis should cover the main plot points, key character developments, and any important unresolved conflicts.

    **Story Title:** {{{storyTitle}}}

    **Previous Chapter Information:**
    {{{relevantChaptersSummary}}}

    Provide a clear and helpful summary that will get the writer up to speed.
    `,
});

const generateStorySynopsisFlow = ai.defineFlow(
  {
    name: 'generateStorySynopsisFlow',
    inputSchema: GenerateStorySynopsisInputSchema,
    outputSchema: GenerateStorySynopsisOutputSchema,
  },
  async ({ storyTitle, relevantChaptersSummary, isFirstChapter }) => {
    // No more getStory!
    if (isFirstChapter) {
        return { synopsis: "This is the first chapter. You're just getting started! There is no prior story to summarize." };
    }

    const { output } = await prompt({
        storyTitle,
        relevantChaptersSummary
    });

    return output!;
  }
);
