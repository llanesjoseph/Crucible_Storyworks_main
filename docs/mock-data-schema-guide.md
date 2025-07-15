# Guide to Creating Mock Data for Student Analysis

To effectively test the "Student Performance Analysis" feature, you can create your own mock data sets. The AI flow requires a specific data structure as input. This guide explains that structure and provides a template you can use.

## Data Structure Overview

The AI flow expects a single object with two main properties:

1.  `studentId`: A unique string to identify the student.
2.  `writingSamples`: An array of objects, where each object represents a single piece of writing from that student.

**Important:** The `writingSamples` array should be ordered chronologically, from oldest to newest submission, to allow the AI to accurately track progress and trends.

## The `writingSamples` Object Schema

Each object inside the `writingSamples` array must have the following three properties:

*   `assignmentTitle` (string): The name of the assignment (e.g., "Chapter 1 Draft", "Final Essay").
*   `draftContent` (string): The full text content of what the student wrote for that assignment.
*   `submissionDate` (string): The date of the submission in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601) (e.g., `"2023-10-27T10:00:00Z"`). Using the `.toISOString()` method on a JavaScript `Date` object is the easiest way to get this format.

## Example Mock Data Object

Here is a complete example of a mock data object. You can copy this structure and modify the contents to create your own test cases. This example shows a student's progression on a single story across three drafts.

```javascript
// This is an example of the data structure required by the `analyzeStudentPerformance` flow.
// You can use this as a template to create your own test data.

const mockStudentData = {
  // A unique identifier for the student.
  studentId: "student_john_smith_01",

  // An array of writing samples, ordered from oldest to newest.
  writingSamples: [
    {
      // First sample (oldest)
      assignmentTitle: "My Summer Vacation - First Draft",
      submissionDate: "2024-08-01T09:00:00Z",
      draftContent: "i went to the beach. it was fun. i swam in the water. the sun was hot. i ate ice cream."
    },
    {
      // Second sample
      assignmentTitle: "My Summer Vacation - Second Draft",
      submissionDate: "2024-08-08T11:30:00Z",
      draftContent: "This summer, my family went to the beach. The weather was very nice and sunny. I had a good time swimming in the cool ocean water. We also ate delicious ice cream to cool off."
    },
    {
      // Third sample (most recent)
      assignmentTitle: "My Summer Vacation - Final Version",
      submissionDate: "2024-08-15T15:00:00Z",
      draftContent: "The highlight of my summer was undoubtedly our family trip to Crystal Cove. The sun cast a brilliant, golden glow across the shore, and the weather was simply perfect. I spent hours joyfully swimming in the refreshing, azure waves of the ocean. Later, to escape the afternoon heat, we all enjoyed some delicious, cold ice cream from a local shop."
    }
  ],
};
```

You can create new files with different data sets (e.g., `src/lib/mock-student-data-2.ts`) and then import and use them in the `src/app/teacher/student-analysis/page.tsx` file to test various scenarios.
