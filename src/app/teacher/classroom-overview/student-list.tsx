
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ClassroomStudentSummary } from '@/lib/mock-classroom-data';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface StudentListProps {
  students: ClassroomStudentSummary[];
}

export function StudentList({ students }: StudentListProps) {
  const sortedStudents = [...students].sort((a, b) => b.overallScore - a.overallScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Roster & Scores</CardTitle>
        <CardDescription>A detailed list of each student's current performance. Click on a student's name to view their detailed analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Student Name</TableHead>
              <TableHead className="text-center">Overall Score</TableHead>
              <TableHead>Top Strength</TableHead>
              <TableHead>Area for Improvement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  <Link href="/teacher/student-analysis" className="text-primary hover:underline">
                    {student.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg w-8 text-center">{student.overallScore}</span>
                    <Progress value={student.overallScore} className="h-2 flex-1" />
                  </div>
                </TableCell>
                <TableCell>
                    <Badge variant="secondary">{student.topStrength}</Badge>
                </TableCell>
                <TableCell>
                    <Badge variant="outline">{student.improvementArea}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
