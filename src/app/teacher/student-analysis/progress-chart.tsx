
'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { StudentPerformanceAnalysis } from '@/lib/student-performance-schema';
import { format, parseISO } from 'date-fns';

interface ProgressChartProps {
  metrics: StudentPerformanceAnalysis['keyMetrics'];
}

const chartConfig = {
  clarityScore: { label: 'Clarity', color: 'hsl(var(--chart-1))' },
  grammarAccuracy: { label: 'Grammar', color: 'hsl(var(--chart-2))' },
  vocabularyRichness: { label: 'Vocabulary', color: 'hsl(var(--chart-3))' },
};

export function ProgressChart({ metrics }: ProgressChartProps) {
  const chartData = metrics.map((metric) => ({
    date: format(parseISO(metric.submissionDate), 'MMM d'),
    clarityScore: metric.clarityScore,
    grammarAccuracy: metric.grammarAccuracy,
    vocabularyRichness: metric.vocabularyRichness,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Metrics Over Time</CardTitle>
        <CardDescription>Visualizing student growth across key writing areas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line type="monotone" dataKey="clarityScore" stroke="var(--color-clarityScore)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="grammarAccuracy" stroke="var(--color-grammarAccuracy)" name="Grammar Accuracy (%)" strokeWidth={2} dot={false} yAxisId="right" />
              <Line type="monotone" dataKey="vocabularyRichness" stroke="var(--color-vocabularyRichness)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
