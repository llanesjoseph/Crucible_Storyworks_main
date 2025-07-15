'use server';

import { integrateTeacherFeedback } from '@/ai/flows/integrate-teacher-feedback';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { randomUUID } from 'crypto';
import { StudentPerformanceAnalysis, StudentPerformanceAnalysisSchema } from '@/lib/student-performance-schema';

const IntegrateSchema = z.object({
  teacherFeedback: z.string().min(1, 'Teacher feedback cannot be empty.'),
  aiSuggestion: z.string().min(1, 'AI suggestion cannot be empty.'),
});

export async function integrateFeedbackAction(
  teacherFeedback: string,
  aiSuggestion: string
): Promise<{ integratedFeedback?: string; error?: string }> {
  const validatedFields = IntegrateSchema.safeParse({ teacherFeedback, aiSuggestion });

  if (!validatedFields.success) {
    return { error: 'Invalid input provided for feedback integration.' };
  }

  try {
    const result = await integrateTeacherFeedback(validatedFields.data);
    return { integratedFeedback: result.integratedFeedback };
  } catch (e) {
    console.error('Integration error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred while integrating feedback.';
    return { error: errorMessage };
  }
}

export async function saveAnonymizedReportAction(
  analysis: StudentPerformanceAnalysis
): Promise<{ success?: boolean; error?: string }> {
    const validatedAnalysis = StudentPerformanceAnalysisSchema.safeParse(analysis);
    if (!validatedAnalysis.success) {
        return { error: "Invalid analysis data provided." };
    }

    const data = validatedAnalysis.data;

    try {
        const anonymizedMetric = {
            reportId: `anon_report_${randomUUID()}`,
            schoolZipCode: '94043', // Mock data: e.g., Mountain View, CA
            studentGradeLevel: '11th Grade', // Mock data
            metrics: data.keyMetrics,
            trends: data.trendAnalysis,
            wordCount: data.wordCount,
            createdAt: new Date().toISOString(),
        };

        await addDoc(collection(db, 'anonymizedMetrics'), anonymizedMetric);

        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
        const friendlyMessage = errorMessage.includes('permission-denied')
            ? 'Permission Denied. Please ensure your Firestore security rules for "anonymizedMetrics" are configured to allow writes.'
            : `Could not save anonymized report. ${errorMessage}`;

        console.error("Error saving anonymized report:", e);
        return { error: friendlyMessage };
    }
}
