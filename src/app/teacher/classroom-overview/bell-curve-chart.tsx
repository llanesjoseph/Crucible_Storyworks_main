
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ClassroomStudentSummary } from '@/lib/mock-classroom-data';

interface BellCurveChartProps {
  students: ClassroomStudentSummary[];
}

const chartConfig = {
  students: {
    label: 'Students',
    color: 'hsl(var(--chart-1))',
  },
};

export function BellCurveChart({ students }: BellCurveChartProps) {
  const scoreDistribution = students.reduce((acc, student) => {
    const range = Math.floor(student.overallScore / 10) * 10;
    const key = `${range}-${range + 9}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(scoreDistribution)
    .sort()
    .map((range) => ({
      range,
      students: scoreDistribution[range],
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classroom Performance Distribution</CardTitle>
        <CardDescription>A visual representation of overall student writing scores.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="range" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="students" fill="var(--color-students)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
