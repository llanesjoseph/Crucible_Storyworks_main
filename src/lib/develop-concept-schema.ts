import { z } from 'zod';

export const DevelopConceptInputSchema = z.object({
  title: z.string().optional(),
  genre: z.string(),
  tone: z.string(),
  logline: z.string().optional(),
  gradeLevel: z.string().optional(),
});
export type DevelopConceptInput = z.infer<typeof DevelopConceptInputSchema>;

export const DevelopConceptOutputSchema = z.object({
  enhancedLogline: z.string().describe("A more detailed, enhanced version of the original logline or a new one if none was provided."),
  suggestedCharacters: z.array(z.object({
    name: z.string(),
    role: z.string(),
    traits: z.string().describe("A comma-separated string of key character traits."),
    description: z.string().describe("A brief description of the character."),
  })).describe("A list of 2-3 suggested main characters with name, role, traits, and a brief description."),
  suggestedSetting: z.object({
    timeframe: z.string(),
    location: z.string(),
    worldDescription: z.string().describe("A paragraph describing the world and its atmosphere."),
  }).describe("A suggested setting for the story."),
  suggestedStructure: z.object({
    centralConflict: z.string().describe("The core conflict that will drive the narrative."),
    suggestedChapterCount: z.number().describe("A suggested number of chapters for a story of this type, typically between 8 and 20."),
  }).describe("A suggested narrative structure."),
});
export type DevelopConceptOutput = z.infer<typeof DevelopConceptOutputSchema>;
