
# Services & Architecture Overview for Crucible Storyworks

This document outlines the core services and architectural components required to power the Crucible Storyworks application, particularly focusing on the "Story Framework Builder" feature.

## 1. Frontend Architecture

The user interface is built on a modern web stack designed for performance and a great developer experience.

*   **Next.js & React**: The foundation of the application, using the App Router for server-centric rendering and routing.
*   **TypeScript**: Ensures code quality and type safety across the project.
*   **ShadCN UI & Tailwind CSS**: Provide a library of accessible, pre-built components and a utility-first CSS framework for rapid, consistent styling.

## 2. Backend & Data Services (Firebase)

The backend is powered by Firebase, offering a suite of scalable and integrated services.

*   **Firebase Authentication**:
    *   **Purpose**: Manages user identity. Every educator and student will have an account, allowing for personalized experiences and secure data access.
    *   **Integration**: Secures database access, ensuring users can only view and edit their own stories and classrooms. The `userId` will be stored with every story framework.

*   **Firebase Firestore (NoSQL Database)**:
    *   **Purpose**: The primary data store for the application.
    *   **Data Models**:
        *   `stories`: Stores the complete story frameworks, including the initial user input and the AI-generated content (outlines, character profiles, etc.).
        *   `classrooms`: Manages classroom information, student rosters, and story assignments.
        *   `users`: Stores user profile information for educators and students.
    *   **Integration**: The `createFramework` server action in `/app/create-story/actions.ts` currently saves the generated story data to the `stories` collection.

*   **Google Cloud Storage for Firebase**:
    *   **Purpose**: Used for storing all user-uploaded binary files.
    *   **Use Cases**:
        *   Storing cover images for stories.
        *   Uploading character portraits or inspiration images.
        *   Potentially storing audio or video resources linked to chapters.
    *   **Integration**: The Firebase SDK is configured in `src/lib/firebase.ts`, and security rules are defined in `storage.rules`, ready for UI implementation.

## 3. AI Services (Google AI & Genkit)

All AI-powered features are managed through Genkit flows, providing a structured way to interact with Google's generative models.

*   **`generateStoryFramework` flow (`src/ai/flows/generate-story-framework.ts`)**:
    *   **Purpose**: This is the cornerstone of the Story Framework Builder. It takes the structured input from the user (concept, characters, setting, structure) and uses a powerful AI model to generate a comprehensive, detailed story plan.
    *   **Service Interaction**: It's called from the `createFramework` server action after the user completes the final step of the builder.

*   **`generateStoryIdeas` flow (`src/ai/flows/generate-story-ideas.ts`)**:
    *   **Purpose**: Powers the "AI Idea Sparker" tool, allowing educators to brainstorm initial concepts from a simple prompt.
    *   **Service Interaction**: Used on the `/ai-tools/idea-sparker` page.

*   **`provideWritingFeedback` flow (`src/ai/flows/provide-writing-feedback.ts`)**:
    *   **Purpose**: Provides AI-driven feedback on student writing within the chapter editor, guided by optional educator prompts.
    *   **Service Interaction**: Used in the `WritingEditor` component on the chapter page.

*   **`analyzeStudentPerformance` flow (`src/ai/flows/analyze-student-performance.ts`)**:
    *   **Purpose**: To provide educators with granular insights into a student's writing evolution and to power a personalized student dashboard. This flow analyzes a series of writing samples from a student and generates a comprehensive report.
    *   **Integration**: This is the engine for the "Student Dashboard" and "Teacher Analytics Report." The structured data allows for rich data visualizations (graphs, trend indicators) and personalized text-based feedback.

## 4. Multi-User and Classroom Architecture

As the platform evolves to support multiple schools and classrooms, distinct user roles (Admin, Teacher, Student) are necessary. A detailed plan for this multi-tenant architecture is outlined in a separate document.

*   **[Read the Multi-User Architecture Plan](./multi-user-architecture.md)**

## 5. Analytics and Research at Scale

To support anonymous, large-scale data analysis for research and development purposes, the application is designed to integrate with Google Cloud's analytics ecosystem.

*   **Data Source**: Anonymized data from the primary Firestore database.
*   **ETL (Export, Transform, Load)**: Use the built-in Firebase extension to automatically export Firestore collection data to **Google BigQuery**.
*   **Analysis & Visualization**: BigQuery serves as a powerful data warehouse that allows for complex, SQL-based queries on massive datasets. This is the ideal environment for performing statistical analysis, identifying trends, and improving the AI models, without impacting the performance of the live application database. This approach provides the power of a traditional data warehouse while remaining fully integrated with the Firebase stack.
