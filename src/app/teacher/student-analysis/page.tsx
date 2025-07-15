import AppLayout from '@/components/app-layout';
import { analyzeStudentPerformance } from '@/ai/flows/analyze-student-performance';
import { mockStudentData2 } from '@/lib/mock-student-data-2';
import { AnalysisDisplay } from './analysis-display';
import { AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

async function AnalysisData() {
    try {
        const analysis = await analyzeStudentPerformance(mockStudentData2);
        if (!analysis) {
            throw new Error("AI analysis returned no data.");
        }
        return <AnalysisDisplay analysis={analysis} studentName="Sarah Jones" studentId={mockStudentData2.studentId} />;
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return (
            <Card className="border-destructive">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <CardTitle className="text-xl text-destructive">
                        Failed to Generate Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        There was an error while trying to generate the student performance analysis. This might be due to a temporary issue with the AI service.
                    </p>
                    <p className="mt-2 text-xs font-mono bg-muted p-2 rounded-md">Error: {errorMessage}</p>
                </CardContent>
            </Card>
        );
    }
}

function AnalysisSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2"><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-2/4" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-3/5" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
            </div>
            <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
            <div className="grid gap-6 md:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            </div>
        </div>
    );
}

export default function StudentAnalysisPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Student Performance Analysis
            </h1>
            <p className="text-muted-foreground">
              An AI-generated report on the writing evolution of a sample student.
            </p>
          </div>
        </div>
        <div className="mt-8">
            <Suspense fallback={<AnalysisSkeleton />}>
                <AnalysisData />
            </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}
