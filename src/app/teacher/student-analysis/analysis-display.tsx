
'use client';

import { useState } from 'react';
import type { StudentPerformanceAnalysis } from '@/lib/student-performance-schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressChart } from './progress-chart';
import { ArrowDown, ArrowRight, ArrowUp, Lightbulb, Users, BarChart, Save, Sparkles, LoaderCircle, Check, Edit, WandSparkles, FileBarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { integrateFeedbackAction, saveAnonymizedReportAction } from './actions';
import { useAuth } from '@/hooks/use-auth';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalysisDisplayProps {
  analysis: StudentPerformanceAnalysis;
  studentName: string;
  studentId: string;
}

// Helper to get the current and last school year.
const getCurrentSchoolYears = () => {  
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    // School year typically starts around August (index 7)
    if (currentMonth >= 7) {
        return [
            `${currentYear}-${currentYear + 1}`,
            `${currentYear - 1}-${currentYear}`,
            `${currentYear - 2}-${currentYear - 1}`,
        ];
    } else {
        return [
            `${currentYear - 1}-${currentYear}`,
            `${currentYear - 2}-${currentYear - 1}`,
            `${currentYear - 3}-${currentYear - 2}`,
        ];
    }
};


const TrendIcon = ({ trend }: { trend: 'improving' | 'declining' | 'stable' }) => {
  if (trend === 'improving') {
    return <ArrowUp className="h-5 w-5 text-success" />;
  }
  if (trend === 'declining') {
    return <ArrowDown className="h-5 w-5 text-destructive" />;
  }
  return <ArrowRight className="h-5 w-5 text-muted-foreground" />;
};

export function AnalysisDisplay({ analysis, studentName, studentId }: AnalysisDisplayProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const schoolYears = getCurrentSchoolYears();
  const [schoolYear, setSchoolYear] = useState(schoolYears[0]);
  const [teacherInsights, setTeacherInsights] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isIntegrating, setIsIntegrating] = useState(false);
  const [isSavingAnonymized, setIsSavingAnonymized] = useState(false);

  const handleSaveReport = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to save.' });
      return;
    }
    if (!schoolYear) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a school year.' });
      return;
    }
    setIsSaving(true);
    try {
      const analysesCollection = collection(db, 'studentPerformanceAnalyses');
      
      await addDoc(analysesCollection, {
        // Core data
        analysis: analysis,
        teacherInsights: teacherInsights,
        // Metadata for querying and security
        studentId: studentId,
        studentName: studentName, // Denormalize for easier display later
        teacherId: user.uid,
        schoolYear: schoolYear,
        createdAt: new Date().toISOString(),
      });

      toast({
          title: "Analysis Report Saved",
          description: `The performance report for ${studentName} (${schoolYear}) has been saved to the database.`,
      });
      // Optionally reset fields or navigate away after saving
      setTeacherInsights('');

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        const friendlyMessage = errorMessage.includes('permission-denied')
            ? 'Permission Denied. Please ensure your Firestore security rules are set up correctly for the "studentPerformanceAnalyses" collection.'
            : `Could not save report. ${errorMessage}`;

        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: friendlyMessage,
        });
        console.error("Save error:", error);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleIntegrateFeedback = async () => {
    if (!teacherInsights.trim() || !analysis.tailoredInsightsForStudent) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please ensure you have written your own insights before integrating.",
        });
        return;
    }

    setIsIntegrating(true);
    try {
        const result = await integrateFeedbackAction(teacherInsights, analysis.tailoredInsightsForStudent);
        if (result.error) {
            throw new Error(result.error);
        }
        if (result.integratedFeedback) {
            setTeacherInsights(result.integratedFeedback);
            toast({
                title: "Feedback Integrated!",
                description: "The AI has merged your feedback with its suggestions.",
            });
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
        toast({
            variant: 'destructive',
            title: 'Integration Failed',
            description: errorMessage,
        });
    } finally {
        setIsIntegrating(false);
    }
  };
  
  const handleSaveAnonymized = async () => {
    setIsSavingAnonymized(true);
    const result = await saveAnonymizedReportAction(analysis);
    if (result.success) {
        toast({
            title: "Report Submitted for Research",
            description: "Thank you! The anonymized data has been sent for analysis.",
        });
    } else {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: result.error,
        });
    }
    setIsSavingAnonymized(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Overall Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.overallSummary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
              {analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
              {analysis.areasForImprovement.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Vocabulary Insights (Latest Draft)
            </CardTitle>
            <CardDescription>{analysis.vocabularyAnalysis.commentary}</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-wrap gap-2">
                {analysis.vocabularyAnalysis.topWords.map((wordInfo) => (
                    <Badge key={wordInfo.word} variant="secondary" className="text-base px-3 py-1">
                        {wordInfo.word}
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">{wordInfo.count}</span>
                    </Badge>
                ))}
             </div>
          </CardContent>
        </Card>

      <ProgressChart metrics={analysis.keyMetrics} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Edit className="w-5 h-5 text-primary" />
                        Add Teacher Insights & Save Report
                    </CardTitle>
                    <CardDescription>
                        Add your personal feedback and save this full analysis to the database for future reference.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="schoolYear">School Year / Semester</Label>
                        <Select value={schoolYear} onValueChange={setSchoolYear}>
                            <SelectTrigger id="schoolYear">
                                <SelectValue placeholder="Select a school year" />
                            </SelectTrigger>
                            <SelectContent>
                                {schoolYears.map(year => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="teacher-insights">Your Insights & Feedback</Label>
                        <Textarea
                            id="teacher-insights"
                            value={teacherInsights}
                            onChange={(e) => setTeacherInsights(e.target.value)}
                            placeholder="e.g., 'Great job on the descriptive language! For the next assignment, let's focus on varying sentence structure...'"
                            className="min-h-[125px] bg-background"
                        />
                     </div>
                </CardContent>
                <CardFooter className="justify-between">
                    <Button onClick={handleSaveReport} disabled={isSaving || !teacherInsights.trim()}>
                        {isSaving ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Saving Report...</> : <><Save className="mr-2 h-4 w-4" />Save Report</>}
                    </Button>
                    <Button onClick={handleIntegrateFeedback} variant="secondary" disabled={isIntegrating || !teacherInsights.trim()}>
                        {isIntegrating ? (
                            <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Integrating...</>
                        ) : (
                            <><WandSparkles className="mr-2 h-4 w-4" />Integrate AI Feedback</>
                        )}
                    </Button>
                </CardFooter>
            </Card>
            
            {user?.role === 'admin' && (
                <Card className="border-green-500/30 bg-green-500/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-300">
                            <FileBarChart className="w-5 h-5" />
                            Contribute to Research
                        </CardTitle>
                        <CardDescription className="text-green-800/80 dark:text-green-300/80">
                            Help improve our platform by submitting an anonymized version of this report. No student PII will be shared.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            This will save the following data points to our research database: School Zip Code (mocked), Student Grade Level (mocked), all quantitative writing metrics, performance trends, and the total word count.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveAnonymized} disabled={isSavingAnonymized} variant="outline">
                            {isSavingAnonymized ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : <>Submit Anonymized Data</>}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI's Data-Driven Suggestions
                    </CardTitle>
                    <CardDescription>
                        This is the AI's feedback for the student. Use the "Integrate" button above to merge it with your own.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {analysis.tailoredInsightsForStudent}
                    </p>
                </CardContent>
            </Card>
        </div>
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recommendations for Teacher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.recommendationsForTeacher}</p>
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardHeader>
            <CardTitle className="text-lg">Performance Trends</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                    <TrendIcon trend={analysis.trendAnalysis.clarityTrend} />
                    <h4 className="font-semibold capitalize">{analysis.trendAnalysis.clarityTrend}</h4>
                </div>
                <p className="text-sm text-muted-foreground">Clarity</p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                    <TrendIcon trend={analysis.trendAnalysis.grammarTrend} />
                    <h4 className="font-semibold capitalize">{analysis.trendAnalysis.grammarTrend}</h4>
                </div>
                <p className="text-sm text-muted-foreground">Grammar</p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                    <TrendIcon trend={analysis.trendAnalysis.vocabularyTrend} />
                    <h4 className="font-semibold capitalize">{analysis.trendAnalysis.vocabularyTrend}</h4>
                </div>
                <p className="text-sm text-muted-foreground">Vocabulary</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
