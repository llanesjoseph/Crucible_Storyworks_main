export interface ClassroomStudentSummary {
  id: string;
  name: string;
  overallScore: number;
  topStrength: string;
  improvementArea: string;
}

export const mockClassroomData: ClassroomStudentSummary[] = [
  { id: 'student_1', name: 'Alex Johnson', overallScore: 88, topStrength: 'Vivid Descriptions', improvementArea: 'Sentence Variety' },
  { id: 'student_2', name: 'Brenda Chen', overallScore: 95, topStrength: 'Strong Vocabulary', improvementArea: 'Pacing' },
  { id: 'student_3', name: 'Carlos Diaz', overallScore: 72, topStrength: 'Creative Ideas', improvementArea: 'Grammar' },
  { id: 'student_4', name: 'Diana Wells', overallScore: 68, topStrength: 'Character Voice', improvementArea: 'Spelling' },
  { id: 'student_5', name: 'Ethan Hunt', overallScore: 81, topStrength: 'Engaging Dialogue', improvementArea: 'Show, Don\'t Tell' },
  { id: 'student_6', name: 'Fiona Gallagher', overallScore: 78, topStrength: 'Clear Structure', improvementArea: 'Vocabulary Richness' },
  { id: 'student_7', name: 'George Banks', overallScore: 75, topStrength: 'Consistent Tone', improvementArea: 'Clarity' },
  { id: 'student_8', name: 'Hannah Abbott', overallScore: 91, topStrength: 'Complex Sentences', improvementArea: 'Punctuation' },
  { id: 'student_9', name: 'Ian McKinley', overallScore: 85, topStrength: 'Good Pacing', improvementArea: 'Grammar' },
  { id: 'student_10', name: 'Jessica Day', overallScore: 83, topStrength: 'Clarity', improvementArea: 'Figurative Language' },
  { id: 'student_11', name: 'Kevin Malone', overallScore: 65, topStrength: 'Humor', improvementArea: 'Sentence Structure' },
  { id: 'student_12', name: 'Laura Palmer', overallScore: 92, topStrength: 'Suspense Building', improvementArea: 'Character Development' },
];
