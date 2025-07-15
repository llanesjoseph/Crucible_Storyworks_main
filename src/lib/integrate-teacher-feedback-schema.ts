import { z } from 'zod';

export const IntegrateTeacherFeedbackInputSchema = z.object({
  teacherFeedback: z.string().describe("The teacher's original feedback written for the student."),
  aiSuggestion: z.string().describe("The AI's data-driven suggestion based on performance analysis."),
});
export type IntegrateTeacherFeedbackInput = z.infer<typeof IntegrateTeacherFeedbackInputSchema>;

export const IntegrateTeacherFeedbackOutputSchema = z.object({
  integratedFeedback: z.string().describe("A single, cohesive piece of feedback that combines the teacher's original thoughts with the AI's suggestions."),
});
export type IntegrateTeacherFeedbackOutput = z.infer<typeof IntegrateTeacherFeedbackOutputSchema>;
