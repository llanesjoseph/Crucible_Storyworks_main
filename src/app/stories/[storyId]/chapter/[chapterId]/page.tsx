
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { BookText, AlertTriangle, Users, ArrowLeft, ArrowRight } from "lucide-react";

import AppLayout from "@/components/app-layout";
import { getStory, type StoryData } from "@/lib/data";
import { WritingEditor } from "./writing-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { generateStorySynopsis } from "@/ai/flows/generate-story-synopsis";
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GenerateStoryFrameworkInputSchema } from '@/lib/story-framework-schema';
import type { z } from 'zod';

type Character = z.infer<typeof GenerateStoryFrameworkInputSchema.shape.characters>[number];

function ChapterPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-3/4 mt-2" />
            <Skeleton className="h-6 w-full mt-2" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
               <Skeleton className="h-[600px] w-full" />
            </div>
            <div className="md:col-span-1 space-y-6">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </div>
    );
}


export default function ChapterPage() {
  const params = useParams();
  const { user } = useAuth();
  const storyId = params.storyId as string;
  const chapterId = params.chapterId as string;

  const [story, setStory] = useState<StoryData | null>(null);
  const [synopsis, setSynopsis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chapterNumber = parseInt(chapterId, 10);

  useEffect(() => {
    if (!storyId || !user || isNaN(chapterNumber)) return;

    const fetchChapterData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storyData = await getStory(storyId);
        if (!storyData) {
          return notFound();
        }
        setStory(storyData);

        const relevantChapters = storyData.generatedContent.chapterBreakdown.filter(
            chapter => chapter.chapterNumber < chapterNumber
        );

        const isFirstChapter = relevantChapters.length === 0;

        const relevantChaptersSummary = relevantChapters
          .sort((a, b) => a.chapterNumber - b.chapterNumber)
          .map(
            chapter => {
              let chapterInfo = `Chapter ${chapter.chapterNumber}: ${chapter.title}\nSummary: ${chapter.summary}`;
              if (chapter.draftContent && chapter.draftContent.trim().length > 0) {
                chapterInfo += `\n\nWritten Content:\n${chapter.draftContent}`;
              }
              return chapterInfo;
            }
          ).join('\n\n---\n\n');

        const synopsisResult = await generateStorySynopsis({ 
          storyTitle: storyData.title,
          relevantChaptersSummary,
          isFirstChapter,
        });
        setSynopsis(synopsisResult.synopsis);

      } catch (e) {
        console.error("Failed to fetch chapter data:", e);
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
         if (errorMessage.includes('permission-denied') || errorMessage.includes('PERMISSION_DENIED')) {
          setError("Permission Denied. You might not have access to this story, or your security rules are not configured correctly.");
        } else {
          setError(`Failed to load story: ${errorMessage}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapterData();

  }, [storyId, chapterNumber, user]);

  if (isLoading) {
      return (
          <AppLayout>
              <div className="flex-1 p-4 sm:p-8 pt-6">
                  <ChapterPageSkeleton />
              </div>
          </AppLayout>
      );
  }

  if (error) {
    return (
       <AppLayout>
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
           <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Chapter</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    )
  }

  if (!story || isNaN(chapterNumber)) {
    return notFound();
  }

  const chapter = story.generatedContent.chapterBreakdown.find(
    (c) => c.chapterNumber === chapterNumber
  );

  if (!chapter) {
    return (
      <AppLayout>
        <div className="p-8">Chapter not found in this story.</div>
      </AppLayout>
    );
  }
  
  const allCharactersInStory = story.characters;
  const activeCharactersInChapter = chapter.characters || [];

  const initialDraftContent = chapter.draftContent || "";
  const initialFinalFeedback = chapter.finalFeedback || "";

  const totalChapters = story.generatedContent.chapterBreakdown.length;
  const hasPrevChapter = chapterNumber > 1;
  const hasNextChapter = chapterNumber < totalChapters;

  return (
    <AppLayout>
      <div className="flex-1 p-4 sm:p-8 pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-primary font-semibold font-headline">{story.title}</p>
            <h1 className="text-4xl font-bold tracking-tight font-headline">
              Chapter {chapter.chapterNumber}: {chapter.title}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              {chapter.summary}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
               <WritingEditor 
                  storyId={storyId} 
                  chapterNumber={chapterNumber} 
                  initialDraftContent={initialDraftContent}
                  initialFinalFeedback={initialFinalFeedback}
                  chapterBreakdown={story.generatedContent.chapterBreakdown}
               />
            </div>
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Characters
                        </CardTitle>
                        <CardDescription>All characters in the story. Highlighted characters appear in this chapter.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                      <TooltipProvider>
                        {allCharactersInStory.filter((c: Character) => c.name).map((char: Character) => {
                            const isActive = activeCharactersInChapter.includes(char.name);
                            const fallback = char.name
                                .split(' ')
                                .map(n => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase() || '?';

                            return (
                                <Tooltip key={char.name} delayDuration={100}>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center text-center gap-1 w-20 cursor-pointer">
                                        <Avatar className={cn(
                                            "h-16 w-16 text-lg",
                                            isActive && "ring-2 ring-offset-2 ring-offset-background ring-success"
                                        )}>
                                            <AvatarFallback>{fallback}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium truncate w-full">{char.name}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="w-48 text-left p-1">
                                      <p className="font-bold text-base font-headline">{char.name}</p>
                                      <p className="text-sm text-muted-foreground">{char.role}</p>
                                      {char.traits && char.traits.length > 0 && (
                                          <>
                                              <div className="border-t my-2"></div>
                                              <p className="text-xs text-muted-foreground">
                                                  Traits: {Array.isArray(char.traits) ? char.traits.join(', ') : char.traits}
                                              </p>
                                          </>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                            );
                        })}
                      </TooltipProvider>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                          <BookText className="w-5 h-5" />
                          Story Recap
                        </CardTitle>
                        <CardDescription>A summary of events before this chapter.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{synopsis || "Loading recap..."}</p>
                    </CardContent>
                </Card>
            </div>
          </div>
          <div className="mt-8 flex justify-between items-center">
            {hasPrevChapter ? (
              <Button asChild variant="outline">
                <Link href={`/stories/${storyId}/chapter/${chapterNumber - 1}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous Chapter
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Chapter
              </Button>
            )}

            <span className="text-sm font-medium text-muted-foreground">
              Chapter {chapterNumber} of {totalChapters}
            </span>

            {hasNextChapter ? (
              <Button asChild variant="outline">
                <Link href={`/stories/${storyId}/chapter/${chapterNumber + 1}`}>
                  Next Chapter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Next Chapter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
