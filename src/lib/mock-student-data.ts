import type { AnalyzeStudentPerformanceInput } from '@/lib/student-performance-schema';

const today = new Date();
const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
const fourWeeksAgo = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000);

export const mockStudentData: AnalyzeStudentPerformanceInput = {
  studentId: "student_jane_doe_01",
  writingSamples: [
    {
      assignmentTitle: "The Haunted House - First Draft",
      submissionDate: fourWeeksAgo.toISOString(),
      draftContent: "i went to a scarry house. the door was old and it creaked. inside it was dark. a ghost jumped out and I screamed. the end."
    },
    {
      assignmentTitle: "The Haunted House - Second Draft",
      submissionDate: twoWeeksAgo.toISOString(),
      draftContent: "I approached the haunted house cautiously. Its door, ancient and warped, groaned open with a sound like a dying man. The darkness inside was total, a thick blanket that swallowed all light. Suddenly, a spectral figure lunged from the shadows, and a terrified scream escaped my lips. I ran out as fast as I could."
    },
    {
      assignmentTitle: "The Haunted House - Final Story",
      submissionDate: today.toISOString(),
      draftContent: "The dilapidated mansion loomed before me, a skeletal silhouette against the bruised twilight sky. With a hesitant push, the great oak door swung inward, its groan a lament for forgotten years. The darkness within was a palpable entity, suffocating and absolute. From the oppressive blackness, a luminous, ethereal figure surged forth. A scream, raw and primal, tore from my throat as I scrambled back into the relative safety of the dying light, my heart hammering against my ribs like a trapped bird."
    }
  ],
};
