
import type { AppUser } from "@/hooks/use-auth";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AppUser['role'];
  joined: string;
}

export interface AdminStory {
  id: string;
  title: string;
  author: string;
  chapters: number;
  createdAt: string;
}

export interface AdminClassroom {
    id: string;
    name: string;
    teacher: string;
    students: number;
    createdAt: string;
}

export interface AdminInvitation {
    code: string;
    role: AppUser['role'];
    createdAt: string;
    isUsed: boolean;
}

export const mockAdminUsers: AdminUser[] = [
  { id: 'user_admin_1', name: 'Crucible Ops', email: 'crucible.analytics.ops@gmail.com', role: 'admin', joined: '2024-01-15' },
  { id: 'user_teacher_1', name: 'Dr. Evelyn Reed', email: 'e.reed@school.edu', role: 'teacher', joined: '2024-02-20' },
  { id: 'user_teacher_2', name: 'Mr. Samuel Carter', email: 's.carter@school.edu', role: 'teacher', joined: '2024-03-10' },
  { id: 'student_1', name: 'Alex Johnson', email: 's.alex.j@school.edu', role: 'student', joined: '2024-08-15' },
  { id: 'student_2', name: 'Brenda Chen', email: 's.brenda.c@school.edu', role: 'student', joined: '2024-08-15' },
  { id: 'student_3', name: 'Carlos Diaz', email: 's.carlos.d@school.edu', role: 'student', joined: '2024-08-16' },
];

export const mockAdminStories: AdminStory[] = [
    { id: 'story_1', title: 'The Whispering Woods', author: 'Dr. Evelyn Reed', chapters: 5, createdAt: '2024-05-10' },
    { id: 'story_2', title: 'Cybernetic City', author: 'Dr. Evelyn Reed', chapters: 8, createdAt: '2024-06-01' },
    { id: 'story_3', title: 'Galactic Odyssey', author: 'Mr. Samuel Carter', chapters: 15, createdAt: '2024-07-22' },
];

export const mockAdminClassrooms: AdminClassroom[] = [
    { id: 'class_1', name: 'Period 3 - Creative Writing', teacher: 'Dr. Evelyn Reed', students: 12, createdAt: '2024-08-01' },
    { id: 'class_2', name: 'Grade 10 English', teacher: 'Mr. Samuel Carter', students: 25, createdAt: '2024-08-01' },
    { id: 'class_3', name: 'Advanced Storytelling', teacher: 'Dr. Evelyn Reed', students: 8, createdAt: '2024-08-02' },
];

export const mockAdminInvitations: AdminInvitation[] = [
    { code: 'TCHR-XF4-9B2', role: 'teacher', createdAt: '2024-09-01', isUsed: false },
    { code: 'TCHR-P8G-1Z5', role: 'teacher', createdAt: '2024-09-03', isUsed: false },
    { code: 'STUD-K3L-M7N', role: 'student', createdAt: '2024-09-04', isUsed: false },
];
