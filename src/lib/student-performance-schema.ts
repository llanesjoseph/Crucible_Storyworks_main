import { z } from 'zod';

// Define a single writing sample structure
const WritingSampleSchema = z.object({
    assignmentTitle: z.string().describe("The title of the assignment."),
    draftContent: z.string().describe("The text written by the student for this assignment."),
    submissionDate: z.string().describe("The date the draft was submitted in ISO 8601 format."),
});

// The input for our new analysis flow
export const AnalyzeStudentPerformanceInputSchema = z.object({
  studentId: z.string().describe("The unique identifier for the student."),
  writingSamples: z.array(WritingSampleSchema).describe("An array of the student's writing samples, ordered from oldest to newest."),
  // pastAnalyses are not included in input, as the flow will generate a new analysis from scratch based on all samples.
  // The context of evolution is derived from the ordered writingSamples.
});
export type AnalyzeStudentPerformanceInput = z.infer<typeof AnalyzeStudentPerformanceInputSchema>;

// The structured output schema for the analysis
export const StudentPerformanceAnalysisSchema = z.object({
  overallSummary: z.string().describe("A high-level summary of the student's progress, writing style, and key changes over the provided samples."),
  keyMetrics: z.array(z.object({
      submissionDate: z.string().describe("The submission date of the sample this metric corresponds to."),
      clarityScore: z.number().min(0).max(10).describe("A score from 0-10 representing the clarity and coherence of the writing."),
      grammarAccuracy: z.number().min(0).max(100).describe("An estimated percentage of grammatical accuracy."),
      vocabularyRichness: z.number().min(0).max(10).describe("A score from 0-10 representing the richness and variety of vocabulary used."),
      sentenceComplexity: z.number().describe("The average number of words per sentence, as a measure of structural complexity."),
  })).describe("A series of quantitative metrics for each provided writing sample to track evolution over time."),
  strengths: z.array(z.string()).describe("A list of consistent strengths observed across the writing samples."),
  areasForImprovement: z.array(z.string()).describe("A list of recurring areas where the student could improve, with actionable advice."),
  trendAnalysis: z.object({
      clarityTrend: z.enum(['improving', 'declining', 'stable']).describe("The trend of writing clarity over time."),
      grammarTrend: z.enum(['improving', 'declining', 'stable']).describe("The trend of grammatical accuracy over time."),
      vocabularyTrend: z.enum(['improving', 'declining', 'stable']).describe("The trend of vocabulary richness over time."),
  }).describe("A summary of performance trends across all samples."),
  vocabularyAnalysis: z.object({
    topWords: z.array(z.object({
        word: z.string(),
        count: z.number(),
    })).describe("A list of the top 10 most frequently used, impactful words from the most recent sample, excluding common stop words like 'the', 'a', 'is' etc."),
    commentary: z.string().describe("A brief analysis of the student's vocabulary usage, level, and word choices based on the most recent sample."),
  }).describe("An analysis of the student's vocabulary usage."),
  wordCount: z.number().describe("The total word count of the most recent writing sample."),
  tailoredInsightsForStudent: z.string().describe("A personalized message for the student, celebrating their growth and offering targeted encouragement for their next steps."),
  recommendationsForTeacher: z.string().describe("Specific, actionable recommendations for the teacher on how to best support this student's development based on the analysis."),
});
export type StudentPerformanceAnalysis = z.infer<typeof StudentPerformanceAnalysisSchema>;
