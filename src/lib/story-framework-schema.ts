import { z } from 'zod';

export const GenerateStoryFrameworkInputSchema = z.object({
  concept: z.object({
    title: z.string().optional(),
    genre: z.string(),
    tone: z.string(),
    logline: z.string().optional(),
    gradeLevel: z.string().optional(),
    collaborationMode: z.enum(['solo', 'group']).default('solo').describe("The collaboration model for the story, either a solo project or a group effort."),
  }),
  characters: z.array(z.object({
    id: z.number().optional(), // Add optional ID for client-side management
    name: z.string(),
    role: z.string(),
    traits: z.array(z.string())
  })),
  setting: z.object({
    timeframe: z.string(),
    location: z.string(),
    worldDescription: z.string()
  }),
  structure: z.object({
    type: z.string(),
    targetLength: z.string(),
    centralConflict: z.string(),
    numChapters: z.number().optional(),
  })
});

export type GenerateStoryFrameworkInput = z.infer<typeof GenerateStoryFrameworkInputSchema>;

export const GenerateStoryFrameworkOutputSchema = z.object({
  chapterBreakdown: z.array(z.object({
    chapterNumber: z.number(),
    title: z.string(),
    summary: z.string(),
    characters: z.array(z.string()).default([]),
    draftContent: z.string().optional().describe("The draft content of the chapter written by the user."),
    finalFeedback: z.string().optional().describe("The final, consolidated feedback for the chapter draft.")
  })).describe("A detailed breakdown of each chapter.")
});

export type GenerateStoryFrameworkOutput = z.infer<typeof GenerateStoryFrameworkOutputSchema>;
