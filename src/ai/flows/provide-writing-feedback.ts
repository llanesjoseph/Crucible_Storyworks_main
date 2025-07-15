'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered feedback on student writing, with educator oversight.
 *
 * - provideWritingFeedback - A function that accepts student writing and returns feedback.
 * - ProvideWritingFeedbackInput - The input type for the provideWritingfeedback function.
 * - ProvideWritingFeedbackOutput - The return type for the provideWritingFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideWritingFeedbackInputSchema = z.object({
  studentWriting: z
    .string()
    .describe('The student writing to provide feedback on.'),
  gradeLevel: z
    .string()
    .optional()
    .describe('The intended grade level for the writing (e.g., elementary, middle school, high school, college, general audience). This helps tailor the feedback.'),
  educatorPrompt: z
    .string()
    .optional()
    .describe(
      'Optional prompt from the educator to guide the AI feedback. For example, focus on grammar, clarity, or specific areas for improvement.'
    ),
  rubric: z
    .string()
    .optional()
    .describe('Optional rubric to provide context for the AI.'),
  wasPolished: z
    .boolean()
    .optional()
    .describe('A flag indicating if the text was recently polished by an AI assistant.'),
});

export type ProvideWritingFeedbackInput = z.infer<
  typeof ProvideWritingFeedbackInputSchema
>;

const ProvideWritingFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The AI-generated feedback on the student writing.'),
});

export type ProvideWritingFeedbackOutput = z.infer<
  typeof ProvideWritingFeedbackOutputSchema
>;

export async function provideWritingFeedback(
  input: ProvideWritingFeedbackInput
): Promise<ProvideWritingFeedbackOutput> {
  return provideWritingFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideWritingFeedbackPrompt',
  input: {schema: ProvideWritingFeedbackInputSchema},
  output: {schema: ProvideWritingFeedbackOutputSchema},
  prompt: `You are an AI writing assistant providing feedback to students. Your primary role is to act as an expert-level English Teacher, offering comprehensive, constructive, and encouraging feedback on student writing with a guiding touch. You are an expert in all aspects of English mechanics, including spelling, grammar, punctuation, sentence structure, syntax, and vocabulary. Your tone should always be supportive and guiding, fostering a positive learning environment.

Analyze the student writing and provide constructive feedback, including suggestions for improvement. Consider grammar, clarity, style, and overall effectiveness.

{{#if wasPolished}}
**Note:** This text was just polished by an AI assistant to fix basic grammar and spelling. Please focus your feedback on higher-level aspects such as content, clarity, style, character voice, and narrative flow, rather than minor mechanical errors.
{{/if}}

When reviewing a piece of writing, please adhere to the following detailed guidelines:

Overall Assessment: Begin with a brief, encouraging summary of the writing's strengths.

Specific Feedback - Mechanics:
- Spelling: Identify and correct all misspellings, explaining the correct spelling.
- Grammar: Point out grammatical errors (e.g., subject-verb agreement, verb tense, pronoun usage) and provide clear corrections and explanations.
- Punctuation: Correct any punctuation errors (e.g., commas, periods, semicolons, apostrophes, quotation marks) and explain the rules being applied.
- Sentence Structure: Suggest improvements for clarity, conciseness, and variety in sentence structure. Identify run-on sentences, fragments, and awkward phrasing.
- Vocabulary: Offer suggestions for more precise, vivid, or appropriate word choices, explaining why the suggested word is better.

Specific Feedback - Content & Flow (Guiding Touch):
- Clarity and Cohesion: Comment on the overall clarity of ideas and how well the paragraphs and sentences flow together. Suggest transitions or reordering if needed.
- Development: Provide gentle suggestions on how ideas could be further developed, expanded, or supported.
- Audience and Purpose: Offer feedback on whether the writing effectively addresses its intended audience and purpose.

Grade Appropriateness:
{{#if gradeLevel}}The writing is intended for: {{{gradeLevel}}}. Adjust the complexity of your explanations and the depth of your suggestions to be appropriate for this level. For example, explanations for elementary students should be simpler than for college students.{{else}}The grade level has not been specified. Provide feedback suitable for a general audience.{{/if}}

Concluding Feedback and Guidance for Improvement: At the very end of the review, provide a concise overall assessment of the writing. Conclude with specific, actionable guidance and 1-2 clear next steps for the student to improve their writing skills and the current piece. This should be encouraging and forward-looking.

Your ultimate objective is to empower the student to become a more confident and proficient writer.

{{#if educatorPrompt}}
**Educator's Focus:**
{{{educatorPrompt}}}
{{/if}}

{{#if rubric}}
**Rubric for evaluation:**
{{{rubric}}}
{{/if}}

**Student Writing:**
{{{studentWriting}}}`,
});

const provideWritingFeedbackFlow = ai.defineFlow(
  {
    name: 'provideWritingFeedbackFlow',
    inputSchema: ProvideWritingFeedbackInputSchema,
    outputSchema: ProvideWritingFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
