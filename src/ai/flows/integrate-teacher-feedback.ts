'use server';
/**
 * @fileOverview A Genkit flow for integrating teacher feedback with AI suggestions.
 */

import { ai } from '@/ai/genkit';
import {
  IntegrateTeacherFeedbackInputSchema,
  IntegrateTeacherFeedbackOutputSchema,
  type IntegrateTeacherFeedbackInput,
  type IntegrateTeacherFeedbackOutput,
} from '@/lib/integrate-teacher-feedback-schema';

export async function integrateTeacherFeedback(input: IntegrateTeacherFeedbackInput): Promise<IntegrateTeacherFeedbackOutput> {
  return integrateTeacherFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'integrateTeacherFeedbackPrompt',
  input: { schema: IntegrateTeacherFeedbackInputSchema },
  output: { schema: IntegrateTeacherFeedbackOutputSchema },
  prompt: `You are a collaborative writing assistant for a teacher. The teacher has written their own feedback for a student, and you have provided a separate data-driven suggestion.

  Your task is to integrate the teacher's feedback with your suggestions into a single, cohesive, and encouraging message for the student.

  - **Prioritize the teacher's voice and intent.** The final text should sound like it comes from the teacher.
  - **Skillfully weave in the key points from the AI suggestion.** Do not just append it. Find natural places to insert the data-driven observations.
  - **Maintain an encouraging and constructive tone.**
  - **Do not introduce new topics.** Only use the information provided in the two text blocks.

  **Teacher's Original Feedback:**
  {{{teacherFeedback}}}

  **AI's Data-Driven Suggestion:**
  {{{aiSuggestion}}}

  Produce the final, integrated feedback below.`,
});

const integrateTeacherFeedbackFlow = ai.defineFlow(
  {
    name: 'integrateTeacherFeedbackFlow',
    inputSchema: IntegrateTeacherFeedbackInputSchema,
    outputSchema: IntegrateTeacherFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to integrate the feedback. Please try again.");
    }
    return output;
  }
);
