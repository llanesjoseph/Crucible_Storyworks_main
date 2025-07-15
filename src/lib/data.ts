
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GenerateStoryFrameworkOutput } from '@/lib/story-framework-schema';
import { GenerateStoryFrameworkInputSchema } from '@/lib/story-framework-schema';
import type { z } from 'zod';

export interface StoryData {
    id: string;
    userId: string;
    concept: z.infer<typeof GenerateStoryFrameworkInputSchema>['concept'];
    characters: z.infer<typeof GenerateStoryFrameworkInputSchema>['characters'];
    setting: z.infer<typeof GenerateStoryFrameworkInputSchema>['setting'];
    structure: z.infer<typeof GenerateStoryFrameworkInputSchema>['structure'];
    generatedContent: GenerateStoryFrameworkOutput;
    status: 'complete' | 'draft' | 'in-progress';
    title: string;
    description: string;
    chapters: number;
    createdAt: string;
    lastUpdated: string;
}

export const getStory = async (id: string): Promise<StoryData | null> => {
    const docRef = doc(db, 'stories', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Handle potential Timestamp objects from Firestore
        const createdAt = data.createdAt;
        const createdAtString = createdAt?.toDate ? createdAt.toDate().toISOString() : createdAt;

        const lastUpdated = data.lastUpdated;
        const lastUpdatedString = lastUpdated?.toDate ? lastUpdated.toDate().toISOString() : lastUpdated;
        
        return {
            id: docSnap.id,
            ...data,
            createdAt: createdAtString,
            lastUpdated: lastUpdatedString
        } as StoryData;
    } else {
        return null;
    }
};

export const getStories = async (): Promise<StoryData[]> => {
    try {
        const storiesCol = collection(db, 'stories');
        const q = query(storiesCol, orderBy('lastUpdated', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const stories = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            
            // Handle potential Timestamp objects from Firestore
            const createdAt = data.createdAt;
            const createdAtString = createdAt?.toDate ? createdAt.toDate().toISOString() : createdAt;

            const lastUpdated = data.lastUpdated;
            const lastUpdatedString = lastUpdated?.toDate ? lastUpdated.toDate().toISOString() : lastUpdated;

            return {
                id: docSnap.id,
                ...data,
                createdAt: createdAtString,
                lastUpdated: lastUpdatedString
            } as StoryData;
        });

        return stories;
    } catch (error) {
        console.error("Error fetching stories: ", error);
        // In case of error (e.g. security rules), return an empty array
        // to prevent the page from crashing.
        return [];
    }
};
