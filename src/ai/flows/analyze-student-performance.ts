'use server';
/**
 * @fileOverview A Genkit flow for analyzing a student's writing performance over time.
 *
 * - analyzeStudentPerformance - Generates a detailed report on a student's writing evolution.
 * - AnalyzeStudentPerformanceInput - The input type for the flow.
 * - StudentPerformanceAnalysis - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import {
  AnalyzeStudentPerformanceInputSchema,
  StudentPerformanceAnalysisSchema,
  type AnalyzeStudentPerformanceInput,
  type StudentPerformanceAnalysis,
} from '@/lib/student-performance-schema';


export async function analyzeStudentPerformance(input: AnalyzeStudentPerformanceInput): Promise<StudentPerformanceAnalysis> {
  return analyzeStudentPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeStudentPerformancePrompt',
  input: { schema: AnalyzeStudentPerformanceInputSchema },
  output: { schema: StudentPerformanceAnalysisSchema },
  prompt: `You are an expert educational analyst specializing in evaluating student writing. A teacher has provided a series of writing samples from a single student and needs a comprehensive analysis of the student's performance and evolution over time.

Your task is to analyze the provided writing samples and generate a structured report.

**Student ID:** {{{studentId}}}

**Writing Samples (in chronological order):**
{{#each writingSamples}}
---
**Assignment:** {{{this.assignmentTitle}}}
**Submitted on:** {{{this.submissionDate}}}
**Content:**
{{{this.draftContent}}}
---
{{/each}}

**Analysis Instructions:**

1.  **Generate Key Metrics for EACH Sample:** For every writing sample provided, calculate the required quantitative metrics (clarity, grammar, vocabulary, sentence complexity). This is crucial for tracking progress. The submission date for each metric must match the submission date of the sample it's based on.
2.  **Identify Overall Strengths and Weaknesses:** Look for patterns across all samples. What does the student consistently do well? What are their recurring challenges?
3.  **Determine Trends:** Based on the series of metrics, determine if the student is generally improving, declining, or remaining stable in the key areas.
4.  **Analyze Vocabulary (Most Recent Sample):** For the most recent writing sample only, identify the top 10 most frequently used and impactful words. Exclude common English stop words (e.g., 'a', 'an', 'the', 'is', 'in', 'it', 'and', 'but', 'i', 'to', 'was'). Provide the word and its frequency count. Also, write a brief commentary on the student's vocabulary level and word choices in that sample.
5.  **Calculate Word Count:** Determine the total word count of the *most recent* writing sample and place it in the top-level 'wordCount' field.
6.  **Write Summaries and Recommendations:**
    *   **Overall Summary:** Provide a narrative summary of the student's journey.
    *   **Tailored Insights for Student:** Write an encouraging and constructive message directly to the student.
    *   **Recommendations for Teacher:** Provide actionable advice for the teacher to help the student.

Generate the analysis in the structured JSON format specified by the output schema.
`,
});

const analyzeStudentPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeStudentPerformanceFlow',
    inputSchema: AnalyzeStudentPerformanceInputSchema,
    outputSchema: StudentPerformanceAnalysisSchema,
  },
  async input => {
    // Basic validation
    if (!input.writingSamples || input.writingSamples.length === 0) {
      throw new Error("At least one writing sample is required for analysis.");
    }

    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a valid performance analysis. Please try again.");
    }
    return output;
  }
);
