
# Multi-User Architecture: Schools, Admins, Teachers, and Students

This document outlines a proposed multi-tenant architecture for Crucible Storyworks, supporting distinct user roles within a school-based system.

## 1. Tenancy Model: The School

The entire system is designed around the concept of a "School" as the primary tenant. All data, including users, classrooms, and stories, is partitioned by a `schoolId`. This ensures data isolation and security between different educational institutions.

*   **Initial Setup**: A new school is provisioned by the developer. The first user created for a school is the `Admin`.
*   **Data Isolation**: Every major collection in Firestore (`users`, `classrooms`, `stories`, `studentPerformanceAnalyses`) will contain a `schoolId` field. Security rules will enforce that users can only access data matching their own `schoolId`.

    *Example Security Rule:*
    ```
    // Allow users to read from a classrooms collection only if it's within their school
    match /classrooms/{classroomId} {
      allow read: if request.auth.token.schoolId == resource.data.schoolId;
    }
    ```

## 2. User Roles & Authentication

*   **Firebase Authentication**: Continues to manage user identity.
*   **Firestore `users` Collection**: Each user document (keyed by their `uid`) will have these critical fields:
    *   `schoolId`: (string) The ID of the school they belong to.
    *   `role`: (string) A string that can be `'admin'`, `'teacher'`, or `'student'`.
    *   `gradeLevel`: (string, optional) For students, e.g., "10th Grade".
*   **Firebase Custom Claims**: For maximum security, both `schoolId` and `role` will be set as [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims) on the user's Auth token during the invitation/sign-up process. This is the most secure way to enforce access rules.

## 3. Data Models in Firestore

#### `schools` Collection
*   **Purpose**: Stores information about each client institution.
*   **Document ID**: Auto-generated ID.
*   **Fields**:
    *   `name`: (string) e.g., "Northwood High School"
    *   `primaryContactEmail`: (string)
    *   `zipCode`: (string) e.g., "90210"

#### `classrooms` Collection
*   **Purpose**: Manages classroom information.
*   **Document ID**: Auto-generated ID.
*   **Fields**:
    *   `schoolId`: (string) The ID of the school this classroom belongs to.
    *   `name`: (string) e.g., "Period 3 - Creative Writing"
    *   `teacherId`: (string) The `uid` of the teacher who owns the classroom.
    *   `studentIds`: (array of strings) A list of student `uid`s who are in the class.
    *   `joinCode`: (string, optional) A unique code students can use to join.

#### `assignments` Collection
*   **Purpose**: Links a story to a classroom and tracks student work.
*   **Document ID**: Auto-generated ID.
*   **Fields**:
    *   `schoolId`: (string)
    *   `storyId`: (string)
    *   `classroomId`: (string)
    *   `teacherId`: (string)
    *   `assignedAt`: (timestamp)
    *   `dueDate`: (timestamp, optional)

#### `studentWork` Sub-collection
*   **Location**: `assignments/{assignmentId}/studentWork/{studentId}`
*   **Fields**:
    *   `schoolId`: (string)
    *   `chapterDrafts`: (map)
    *   `lastUpdated`: (timestamp)

#### `studentPerformanceAnalyses` Collection
*   **Purpose**: Stores saved AI performance reports.
*   **Document ID**: Auto-generated ID.
*   **Fields**:
    *   `schoolId`: (string)
    *   `teacherId`: (string)
    *   `studentId`: (string)
    *   `schoolYear`: (string) e.g., "2024-2025".
    *   `analysis`: (map) The full analysis object.
    *   `createdAt`: (timestamp)

## 4. UI and Feature Breakdown

### Admin View (`role: 'admin'`)
*   **Admin Panel (`/admin`)**:
    *   View all users *within their school*.
    *   Invite new teachers and students to their school.
    *   Manage user roles (e.g., promote a teacher to be another admin for the school).
    *   View all classrooms and stories created within their school.

### Teacher View (`role: 'teacher'`)
*   **Dashboard**:
    *   View "My Stories" and "My Classrooms".
    *   Cannot see other teachers' classrooms.
*   **Classroom Details**:
    *   Invite students to their specific classroom.
    *   Assign stories to their classroom.
    *   View student work and analytics reports for students in their class.

### Student View (`role: 'student'`)
*   **Dashboard**:
    *   View "My Assignments" from all classrooms they are enrolled in.
    *   Cannot create stories or classrooms.
*   **Story/Chapter Pages**:
    *   Can only work on assigned stories.
    *   Work is saved to the `studentWork` collection, not the original `story`.

This architecture provides a scalable and secure foundation for a multi-school educational platform.
