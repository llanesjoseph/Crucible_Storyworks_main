# Data Privacy, Compliance, and Trust Architecture

This document outlines the architectural strategies for ensuring data privacy, supporting regulatory compliance (like COPPA and FERPA), and building trust with users of the Crucible Storyworks platform.

## 1. Guiding Principles

-   **Privacy by Design**: All new features must be designed with data privacy as a primary consideration, not an afterthought.
-   **Data Minimization**: We will only collect and store data that is essential for the functioning of the platform and the improvement of the educational experience.
-   **User Control & Transparency**: Users (and their guardians, where applicable) should have clear insight into and control over their data.

These principles help align the platform's architecture with the requirements of privacy regulations like the Children's Online Privacy Protection Act (COPPA) and the Family Educational Rights and Privacy Act (FERPA).

## 2. Audit Trails

A comprehensive audit trail is the foundation of a secure and transparent system. It provides a chronological record of all significant actions performed by users.

-   **Implementation**: A dedicated, append-only `auditLogs` collection in Firestore.
-   **Log Entry Schema (`src/lib/audit-logging.ts`)**:
    -   `userId`: The UID of the user who performed the action.
    -   `userEmail`: The email of the user, for easier identification in logs.
    -   `action`: A string identifying the type of action (e.g., `DELETE_STORY`, `CREATE_CLASSROOM`, `UPDATE_USER_ROLE`).
    -   `targetResourceId`: The ID of the document or resource that was affected (e.g., the `storyId`).
    -   `details`: A map of additional, relevant context (e.g., `{ "title": "The Whispering Woods" }`).
    -   `timestamp`: An ISO 8601 string of when the event occurred.
-   **Security**: Firestore security rules are configured to make this collection write-only from the client. No user can read, update, or delete log entries, preventing tampering. Admins can view these logs directly in the Firebase Console.
-   **Current Use**: The `deleteStoryAction` is the first feature to be integrated with this system, ensuring a permanent record is kept of all story deletions.

## 3. Data Portability

Users should have the right to export their own data. This builds trust and is a requirement of many data privacy regulations.

-   **Implementation Goal**: A "Export My Data" feature accessible from the user's profile menu.
-   **Process**:
    1.  User initiates an export request from their profile.
    2.  A server-side process (e.g., a Cloud Function) is triggered.
    3.  The function gathers all data associated with that `userId` (stories, assignments, feedback, etc.) from Firestore.
    4.  The data is compiled into a structured, machine-readable format like JSON.
    5.  The user is notified (e.g., via email) with a secure link to download their data archive.
-   **Current Status**: A disabled "Export My Data" button has been added to the UI (`src/components/user-nav.tsx`) as a placeholder for this feature.

## 4. Granular Privacy Controls

To give users meaningful control, a dedicated privacy settings page will be developed.

-   **Location**: A new `/settings/privacy` page.
-   **Controls for Teachers/Admins**:
    -   School-wide settings for data retention policies.
    -   Controls over which types of anonymized data can be submitted for research.
-   **Controls for Students/Parents**:
    -   A clear "opt-in/opt-out" toggle for contributing to the anonymized research dataset.
    -   Ability to view and manage third-party integrations (if any are added in the future).

## 5. Anonymous Mode

For some use cases, it may be beneficial to allow students to participate without using their real names.

-   **Architectural Approach**:
    1.  When a student joins a classroom, the teacher has an option to enable "Anonymous Mode" for that student's participation in a specific assignment.
    2.  If enabled, the system generates a random, non-identifiable alias for the student (e.g., "CreativeCapybara").
    3.  All work submitted for that assignment is associated with this alias and the `studentId`. The student's real name is not displayed in the collaborative context.
    4.  The teacher's view maintains the link between the alias and the real student for grading and feedback purposes, but this link is not exposed to other students.

This architecture provides a robust framework for building a trustworthy educational platform that respects user privacy and provides clear, auditable controls.
