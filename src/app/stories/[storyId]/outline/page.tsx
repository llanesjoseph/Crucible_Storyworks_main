
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Users, BookOpen, Wand2, AlertTriangle, User, Users2 } from "lucide-react";

import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getStory, type StoryData } from "@/lib/data";
import { OutlineControls } from "./outline-controls";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { updateCollaborationMode } from '@/app/stories/actions';
import { useToast } from '@/hooks/use-toast';

function OutlineSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
      <div className="flex items-start gap-4 mt-8">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
       <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
    </div>
  )
}

function StorySettings({ story }: { story: StoryData }) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentMode, setCurrentMode] = useState(story.concept.collaborationMode || 'solo');

  const handleModeChange = async (newMode: 'solo' | 'group') => {
    setIsUpdating(true);
    setCurrentMode(newMode);
    const result = await updateCollaborationMode(story.id, newMode);
    if (result.success) {
      toast({
        title: "Project Type Updated",
        description: `Story is now set to a ${newMode === 'solo' ? 'solo' : 'group'} project.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.error,
      });
      // Revert on failure
      setCurrentMode(story.concept.collaborationMode || 'solo');
    }
    setIsUpdating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Story Settings</CardTitle>
        <CardDescription>
          Manage high-level details about your story framework.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label>Project Type</Label>
        <RadioGroup
          value={currentMode}
          onValueChange={handleModeChange}
          className="flex items-center gap-6 mt-2"
          disabled={isUpdating}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="solo" id="solo" />
            <Label htmlFor="solo" className="font-normal flex items-center gap-2 cursor-pointer">
              <User /> Solo Project
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="group" id="group" />
            <Label htmlFor="group" className="font-normal flex items-center gap-2 cursor-pointer">
              <Users2 /> Group Collaboration
            </Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground mt-2">
          This setting will determine how assignments and collaboration features work in the future.
        </p>
      </CardContent>
    </Card>
  );
}


export default function StoryOutlinePage() {
  const params = useParams();
  const { user } = useAuth();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<StoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId || !user) return;

    const fetchStory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storyData = await getStory(storyId);
        if (storyData) {
          setStory(storyData);
        } else {
          notFound();
        }
      } catch (e) {
        console.error("Failed to fetch story:", e);
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

    fetchStory();
  }, [storyId, user]);


  if (isLoading) {
    return (
       <AppLayout>
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-80 mt-2" />
            </div>
          </div>
          <OutlineSkeleton />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
       <AppLayout>
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
           <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Story</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    )
  }

  if (!story) {
    return notFound();
  }
  
  const hasChapters = story.generatedContent.chapterBreakdown && story.generatedContent.chapterBreakdown.length > 0;

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{story.title}</h1>
            <p className="text-muted-foreground">{story.description}</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <OutlineControls story={story} />
          <StorySettings story={story} />
        </div>

        {hasChapters ? (
          <div className="mt-8 flex flex-col gap-6">
            {story.generatedContent.chapterBreakdown.map((chapter, index) => (
              <div key={chapter.chapterNumber} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg font-headline">
                    {chapter.chapterNumber}
                  </div>
                  {index < story.generatedContent.chapterBreakdown.length - 1 && (
                    <div className="w-0.5 h-16 bg-border mt-2"></div>
                  )}
                </div>
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="font-headline">{chapter.title}</CardTitle>
                    <CardDescription>{chapter.summary}</CardDescription>
                  </CardHeader>
                  <CardFooter className="justify-between pt-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{chapter.characters.join(', ') || 'No characters listed'}</span>
                      </div>
                      <Button asChild>
                          <Link href={`/stories/${story.id}/chapter/${chapter.chapterNumber}`}>
                              <BookOpen className="mr-2 h-4 w-4" /> Go to Chapter
                          </Link>
                      </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : (
            <Card className="mt-8 text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                        <Wand2 className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline mt-4">Ready to Build Your Outline?</CardTitle>
                    <CardDescription>Your story concept is saved. Use the controls above to generate your chapter-by-chapter outline with AI.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        You can adjust the number of chapters and regenerate the outline at any time.
                    </p>
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}

    