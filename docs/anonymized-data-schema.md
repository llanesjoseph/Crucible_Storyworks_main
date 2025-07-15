
# Anonymized Data Schema for Research

This document outlines the data structure for a dedicated Firestore collection, `anonymizedMetrics`, designed for safe, large-scale analysis using tools like Google BigQuery.

## 1. Purpose

The primary goal of this collection is to store valuable, non-identifiable metrics for research and platform improvement. By creating a separate, anonymized collection, we ensure that no Personally Identifiable Information (PII) is ever exported to our analytics warehouse. This is a more secure and manageable approach than attempting to transform data during the export process.

## 2. The Process

1.  **Generate Performance Analysis**: The existing `analyzeStudentPerformance` flow runs on raw student data (which is protected by strict security rules).
2.  **Create Anonymized Report**: A new, separate process (e.g., a scheduled Cloud Function or a new Genkit flow) will take the output of a performance analysis and combine it with non-identifiable metadata from the `schools` and `users` collections.
3.  **Save to `anonymizedMetrics`**: This new, anonymous object is saved as a new document in the `anonymizedMetrics` collection.
4.  **Export to BigQuery**: The "Export Collections to BigQuery" Firebase extension is configured to listen **only** to the `anonymizedMetrics` collection.

This ensures a clean separation between sensitive user data and aggregated research data.

## 3. Data Schema: `anonymizedMetrics` Collection

This collection will store the anonymized data points.

*   **Document ID**: Auto-generated ID.
*   **Fields**:
    *   `reportId`: (string) A unique, randomly generated ID for this report. **This is not the student's `uid`**.
    *   `schoolZipCode`: (string) The zip code of the school, fetched from the `schools` collection.
    *   `studentGradeLevel`: (string) The grade level of the student, fetched from the `users` collection (e.g., "10th Grade").
    *   `metrics`: (map) A direct copy of the `keyMetrics` array from the `StudentPerformanceAnalysis` object. This contains the core quantitative data.
        *   Example: `[{ clarityScore: 7, grammarAccuracy: 85, ... }]`
    *   `trends`: (map) A direct copy of the `trendAnalysis` object from the analysis output.
        *   Example: `{ clarityTrend: 'improving', ... }`
    *   `wordCount`: (number) The total word count of the most recent writing sample.
    *   `createdAt`: (timestamp) The timestamp when this anonymized report was generated.

### Example Document

```json
// Document in /anonymizedMetrics/{autoId}
{
  "reportId": "anon_report_xyz789",
  "schoolZipCode": "90210",
  "studentGradeLevel": "11th Grade",
  "metrics": [
    {
      "clarityScore": 6,
      "grammarAccuracy": 80,
      "vocabularyRichness": 5,
      "sentenceComplexity": 12.5
    },
    {
      "clarityScore": 8,
      "grammarAccuracy": 92,
      "vocabularyRichness": 7,
      "sentenceComplexity": 15.1
    }
  ],
  "trends": {
    "clarityTrend": "improving",
    "grammarTrend": "improving",
    "vocabularyTrend": "improving"
  },
  "wordCount": 250,
  "createdAt": "2024-10-28T14:00:00Z"
}
```

By using this schema, you can safely export the entire `anonymizedMetrics` collection to BigQuery to analyze trends by region (zip code), grade level, and writing proficiency without ever exposing user data.
