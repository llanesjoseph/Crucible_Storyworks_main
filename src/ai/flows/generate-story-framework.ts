'use server';
/**
 * @fileOverview A Genkit flow for generating a complete story framework.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateStoryFrameworkInputSchema,
  GenerateStoryFrameworkOutputSchema,
  type GenerateStoryFrameworkInput,
  type GenerateStoryFrameworkOutput,
} from '@/lib/story-framework-schema';


export async function generateStoryFramework(input: GenerateStoryFrameworkInput): Promise<GenerateStoryFrameworkOutput> {
  return generateStoryFrameworkFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateStoryFrameworkPrompt',
  input: {schema: GenerateStoryFrameworkInputSchema},
  output: {schema: GenerateStoryFrameworkOutputSchema},
  prompt: `You are a master storyteller and creative writing assistant.
Based on the following detailed story context, generate a chapter-by-chapter outline. The outline should have exactly {{{structure.numChapters}}} chapters.

For each chapter, provide:
- chapterNumber: The number of the chapter.
- title: A short, compelling chapter title.
- summary: A concise sentence describing the key event of the chapter.
- characters: An array of names of the characters who are primarily involved in this chapter.

## Story Context
- **Title:** {{#if concept.title}}{{{concept.title}}}{{else}}Untitled{{/if}}
- **Genre:** {{{concept.genre}}}
- **Tone:** {{{concept.tone}}}
- **Logline:** {{{concept.logline}}}
{{#if concept.gradeLevel}}- **Grade Level:** {{{concept.gradeLevel}}}{{/if}}
- **Central Conflict:** {{{structure.centralConflict}}}

## Characters Available
{{#each characters}}
- **Name:** {{{this.name}}}
  - **Role:** {{{this.role}}}
  - **Traits:** {{#each this.traits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

## Setting
- **Location:** {{{setting.location}}}
- **Timeframe:** {{{setting.timeframe}}}
- **World:** {{{setting.worldDescription}}}

Generate exactly {{{structure.numChapters}}} chapters.
Respond ONLY with the JSON object defined in the output schema.`,
});

const generateStoryFrameworkFlow = ai.defineFlow(
  {
    name: 'generateStoryFrameworkFlow',
    inputSchema: GenerateStoryFrameworkInputSchema,
    outputSchema: GenerateStoryFrameworkOutputSchema,
  },
  async input => {
    // Ensure numChapters has a default if not provided
    if (!input.structure.numChapters) {
      input.structure.numChapters = 10; // A sensible default
    }

    const {output} = await prompt(input);

    if (!output || !output.chapterBreakdown || output.chapterBreakdown.length === 0) {
      throw new Error("The AI failed to generate a chapter outline, possibly due to a timeout or content restrictions. Please try again with a more focused concept or a smaller number of chapters.");
    }

    return output;
  }
);
