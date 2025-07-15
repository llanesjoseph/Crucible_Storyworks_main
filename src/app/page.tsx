
'use client';

import Link from "next/link";
import {
  Book,
  PlusCircle,
  Users,
  ArrowRight,
  AlertTriangle,
  School,
  BarChart,
  MoreHorizontal,
  Trash2,
  BookMarked,
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppLayout from "@/components/app-layout";
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import type { StoryData } from '@/lib/data';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DeleteStoryDialog } from "@/components/delete-story-dialog";
import { useViewMode } from "@/hooks/use-view-mode";

function StoryCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { viewMode } = useViewMode();
  const [stories, setStories] = useState<StoryData[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.uid || viewMode === 'student') {
      setIsLoadingStories(false);
      setStories([]);
      return;
    }
  
    setIsLoadingStories(true);
    setStoriesError(null);
    const storiesCol = collection(db, 'stories');
    const q = query(
      storiesCol,
      where('userId', '==', user.uid),
      orderBy('lastUpdated', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const storiesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt;
          const createdAtString = createdAt?.toDate ? createdAt.toDate().toISOString() : createdAt;
          const lastUpdated = data.lastUpdated;
          const lastUpdatedString = lastUpdated?.toDate ? lastUpdated.toDate().toISOString() : lastUpdated;

          return { id: doc.id, ...data, createdAt: createdAtString, lastUpdated: lastUpdatedString } as StoryData;
      });
      setStories(storiesData);
      setIsLoadingStories(false);
    }, (error: any) => {
      console.error("Error fetching stories: ", error);
      
      let friendlyError = "There was a problem fetching your stories. Please check your connection and Firestore security rules.";
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
          if (error.message.includes('building')) {
              friendlyError = "Your database is being prepared to sort stories. This is a one-time setup that can take a few minutes. Please check back shortly.";
          } else {
              friendlyError = "Your database is missing a required index to sort stories. To fix this, open your browser's developer console (F12 or right-click -> Inspect), find the Firebase error message containing a link, and click it to create the index automatically.";
          }
      }
      setStoriesError(friendlyError);
      
      toast({
          variant: "destructive",
          title: "Failed to load stories",
          description: "An error occurred while fetching your data. See the message on the dashboard."
      });
      setIsLoadingStories(false);
    });

    return () => unsubscribe();
    
  }, [user, toast, viewMode]);

  const isLoading = isAuthLoading || isLoadingStories;

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Dashboard
          </h1>
          <div className="flex items-center space-x-2">
            {viewMode !== 'student' && (
                <Button asChild>
                <Link href="/create-story">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Story
                </Link>
                </Button>
            )}
          </div>
        </div>
        <div className="space-y-8">
            {/* For Teachers and Admins */}
            {viewMode !== 'student' && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold tracking-tight font-headline">My Stories</h2>
                    </div>
                    
                    {storiesError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Could Not Load Stories</AlertTitle>
                            <AlertDescription>{storiesError}</AlertDescription>
                        </Alert>
                    )}

                    {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <StoryCardSkeleton />
                        <StoryCardSkeleton />
                        <StoryCardSkeleton />
                    </div>
                    ) : stories.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {stories.map((story) => (
                        <Card key={story.id} className="flex flex-col">
                            <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex-1 pr-2">
                                <CardTitle>{story.title}</CardTitle>
                                <CardDescription>{story.description}</CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DeleteStoryDialog story={story}>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DeleteStoryDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>{story.chapters > 0 ? `${story.chapters} Chapters` : 'Outline pending'}</p>
                                {story.concept?.gradeLevel && (
                                    <p><span className="font-medium text-foreground/80">Grade Level:</span> {story.concept.gradeLevel}</p>
                                )}
                                <p>Updated {formatDistanceToNow(new Date(story.lastUpdated), { addSuffix: true })}</p>
                            </div>
                            </CardContent>
                            <CardFooter>
                            <Link href={`/stories/${story.id}/outline`} className="w-full">
                                <Button variant="outline" className="w-full">
                                View Outline <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            </CardFooter>
                        </Card>
                        ))}
                    </div>
                    ) : !storiesError ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center">
                        <CardHeader>
                        <div className="mx-auto bg-secondary rounded-full p-4 w-fit mb-4">
                            <Book className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <CardTitle>No Stories Yet</CardTitle>
                        <CardDescription>
                            Ready to start your next masterpiece?
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Button asChild>
                            <Link href="/create-story">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Story
                            </Link>
                        </Button>
                        </CardContent>
                    </Card>
                    ) : null }
                </section>
            )}

            {/* For Students */}
            {viewMode === 'student' && (
                <section>
                    <h2 className="text-2xl font-semibold tracking-tight font-headline mb-4">My Assignments</h2>
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                        <CardHeader>
                        <div className="mx-auto bg-secondary rounded-full p-4 w-fit mb-4">
                            <BookMarked className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <CardTitle>No Assignments Yet</CardTitle>
                        <CardDescription>
                            When your teacher assigns a story, it will appear here.
                        </CardDescription>
                        </CardHeader>
                    </Card>
                </section>
            )}
          
            {/* For Teachers */}
            {viewMode === 'teacher' && (
            <>
                <section>
                    <h2 className="text-2xl font-semibold tracking-tight font-headline mb-4">Teacher Tools</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Analysis</CardTitle>
                                <CardDescription>View a sample AI-powered performance report for a student.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center p-6 bg-secondary rounded-lg">
                                    <School className="h-12 w-12 text-muted-foreground" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href="/teacher/student-analysis" className="w-full">
                                    <Button variant="outline" className="w-full">
                                        View Sample Report <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Classroom Overview</CardTitle>
                                <CardDescription>See a bell curve of class performance and individual scores.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center p-6 bg-secondary rounded-lg">
                                    <BarChart className="h-12 w-12 text-muted-foreground" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href="/teacher/classroom-overview" className="w-full">
                                    <Button variant="outline" className="w-full">
                                        View Classroom <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold tracking-tight font-headline mb-4">My Classrooms</h2>
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                        <CardHeader>
                        <div className="mx-auto bg-secondary rounded-full p-4 w-fit mb-4">
                            <Users className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <CardTitle>Classrooms Are Coming Soon</CardTitle>
                        <CardDescription>
                            Soon you'll be able to manage classrooms, invite students, and assign collaborative stories.
                        </CardDescription>
                        </CardHeader>
                    </Card>
                </section>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
