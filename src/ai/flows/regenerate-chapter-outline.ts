'use server';
/**
 * @fileOverview A Genkit flow for regenerating a story's chapter outline.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateStoryFrameworkOutputSchema, GenerateStoryFrameworkInputSchema } from '@/lib/story-framework-schema';

// The input schema now takes the full context, not just the storyId.
const RegenerateChapterOutlineInputSchema = z.object({
  title: z.string(),
  logline: z.string().optional(),
  centralConflict: z.string(),
  characters: GenerateStoryFrameworkInputSchema.shape.characters,
  numChapters: z.number().min(1).max(50),
});
export type RegenerateChapterOutlineInput = z.infer<typeof RegenerateChapterOutlineInputSchema>;

const RegenerateChapterOutlineOutputSchema = z.object({
  chapterBreakdown: GenerateStoryFrameworkOutputSchema.shape.chapterBreakdown,
});
export type RegenerateChapterOutlineOutput = z.infer<typeof RegenerateChapterOutlineOutputSchema>;

export async function regenerateChapterOutline(input: RegenerateChapterOutlineInput): Promise<RegenerateChapterOutlineOutput> {
  return regenerateChapterOutlineFlow(input);
}

// Prompt input now matches the flow's input schema.
const promptInputSchema = RegenerateChapterOutlineInputSchema;

const prompt = ai.definePrompt({
    name: 'regenerateChapterOutlinePrompt',
    input: { schema: promptInputSchema },
    output: { schema: RegenerateChapterOutlineOutputSchema },
    prompt: `You are a master storyteller and creative writing assistant.
    Based on the following story context, generate a new chapter-by-chapter outline with exactly {{{numChapters}}} chapters.

    For each chapter, provide a chapter number, a compelling title, a concise summary, and an array of the characters involved.

    ## Story Context
    - **Title:** {{{title}}}
    {{#if logline}}- **Logline:** {{{logline}}}{{/if}}
    - **Central Conflict:** {{{centralConflict}}}

    ## Characters Available
    {{#each characters}}
    - {{{this.name}}} ({{this.role}})
    {{/each}}

    Generate exactly {{{numChapters}}} chapters.
    Respond ONLY with the JSON object defined in the output schema.
    `,
});

const regenerateChapterOutlineFlow = ai.defineFlow(
  {
    name: 'regenerateChapterOutlineFlow',
    inputSchema: RegenerateChapterOutlineInputSchema,
    outputSchema: RegenerateChapterOutlineOutputSchema,
  },
  async (input) => {
    // No more getStory()! Simply pass the input to the prompt.
    const { output } = await prompt(input);
    
    if (!output || !output.chapterBreakdown || output.chapterBreakdown.length === 0) {
      throw new Error("The AI failed to generate a chapter outline. Please try again with a different number of chapters or adjust the story concept.");
    }

    return output;
  }
);
