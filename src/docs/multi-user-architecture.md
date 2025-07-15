
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
    *   `role`: (string) A string defining the user's permissions.
    *   `gradeLevel`: (string, optional) For students, e.g., "10th Grade".
*   **Firebase Custom Claims**: For maximum security, both `schoolId` and `role` will be set as [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims) on the user's Auth token during the invitation/sign-up process. This is the most secure way to enforce access rules.

## 3. Core User Roles

*   **Admin (`admin`)**: Manages users and settings for an entire school.
*   **Teacher (`teacher`)**: Creates and manages stories and classrooms.
*   **Student (`student`)**: Participates in classrooms and completes assignments.

## 4. Data Models in Firestore

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

## 5. Future & Specialized Roles

The architecture is designed to be extensible to support a wider educational community.

*   **Parent/Guardian (`parent`)**: A read-only role linked to one or more `student` accounts.
    *   **Permissions**: View their child's assignments, submitted work, and performance analyses. Cannot edit work or interact in classrooms.
    *   **Implementation**: Requires a mapping in the `users` collection (e.g., a `childIds` array in the parent's document).

*   **Librarian/Media Specialist (`librarian`)**: A school-level role focused on resource management.
    *   **Permissions**: Can create and manage a school-wide library of story templates and resources. Can view but not edit classroom assignments.
    *   **Implementation**: Access to a shared "Story Library" collection, partitioned by `schoolId`.

*   **Curriculum Coordinator (`coordinator`)**: A high-level role for overseeing educational standards across a school or district.
    *   **Permissions**: Read-only access to all classrooms, stories, and analytics reports within their `schoolId`.
    *   **Implementation**: Security rules would grant broad read access based on their role and `schoolId` custom claim.

*   **Peer Reviewer (`student` with special permission)**: This is not a permanent role, but a temporary capability granted to a `student`.
    *   **Permissions**: Can view and comment on a specific peer's assignment draft.
    *   **Implementation**: Managed at the assignment level, where a teacher can create review pairs or groups.

*   **Guest Expert (`guest`)**: A temporary, limited-access role for outside professionals.
    *   **Permissions**: Can be invited to a specific classroom or story to provide feedback. Cannot view other parts of the platform.
    *   **Implementation**: Invited via a special, single-use code that grants access to a limited scope of data.
