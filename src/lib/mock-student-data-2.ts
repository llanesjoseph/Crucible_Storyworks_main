import type { AnalyzeStudentPerformanceInput } from '@/lib/student-performance-schema';

const today = new Date();
const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
const twoMonthsAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

export const mockStudentData2: AnalyzeStudentPerformanceInput = {
  studentId: "student_sarah_jones_02",
  writingSamples: [
    {
      assignmentTitle: "My Favorite Animal - Draft 1",
      submissionDate: twoMonthsAgo.toISOString(),
      draftContent: "My favrite animal is the lion. Lions are big cats. They are strong. They live in africa. The lion is the king of the jungle."
    },
    {
      assignmentTitle: "My Favorite Animal - Draft 2",
      submissionDate: oneMonthAgo.toISOString(),
      draftContent: "The lion is my favorite animal. As the king of the jungle, lions are symbols of strength and courage. These big cats live on the savannas of Africa. Their roar is very loud and can be heard for miles away. I think lions are the most majestic creatures."
    },
    {
      assignmentTitle: "My Favorite Animal - Final Essay",
      submissionDate: today.toISOString(),
      draftContent: "Of all the magnificent creatures in the animal kingdom, the lion stands out as my favorite. Often hailed as the 'king of the jungle,' this powerful feline is a potent symbol of strength and nobility. Residing primarily on the sun-drenched savannas of Africa, lions possess a commanding presence. Their thunderous roar, a sound that can travel for miles, is a definitive assertion of their dominance. For me, the lion's combination of raw power and dignified grace makes it the most majestic and awe-inspiring animal on the planet."
    }
  ],
};
