
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { LoaderCircle, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import type { StoryData } from '@/lib/data';
import { Button } from './ui/button';
import { deleteStoryAction } from '@/app/stories/actions';

interface DeleteStoryDialogProps {
  story: StoryData;
  children: React.ReactNode;
}

export function DeleteStoryDialog({ story, children }: DeleteStoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const isConfirmationMatching = inputValue === story.title;

  const handleDelete = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to delete a story.' });
        return;
    }
    setIsDeleting(true);
    setPermissionError(null);
    
    const result = await deleteStoryAction(story.id, { uid: user.uid, email: user.email });

    if (result.success) {
        toast({
            title: 'Story Deleted',
            description: `"${story.title}" has been permanently deleted.`,
        });
        setOpen(false); // Close the dialog on success
    } else if (result.error) {
        if (result.error.code === 'PERMISSION_DENIED') {
            setPermissionError(result.error.message);
        } else {
            toast({
              variant: 'destructive',
              title: 'Deletion Failed',
              description: result.error.message,
            });
        }
    }
    
    setIsDeleting(false);
  };
  
  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when closing
      setInputValue('');
      setIsDeleting(false);
      setPermissionError(null);
    }
    setOpen(isOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the story
            <span className="font-semibold text-foreground"> "{story.title}" </span>
            and all of its associated data. This action will be logged for security purposes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {!permissionError ? (
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-story-title">
              To confirm, please type "<span className="font-bold text-primary">{story.title}</span>" below.
            </Label>
            <Input
              id="confirm-story-title"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoComplete="off"
            />
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Permission Denied: Cannot Delete from UI</AlertTitle>
            <AlertDescription>
              {permissionError}
              <div className="mt-4">
                <p className="text-xs">
                  Your User ID: <code className="bg-destructive/20 p-1 rounded-md font-mono">{user?.uid}</code>
                </p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-xs text-destructive-foreground">
                    <Link href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                        Open Firebase Console to Fix <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!permissionError && (
             <AlertDialogAction
              onClick={handleDelete}
              disabled={!isConfirmationMatching || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive"
            >
              {isDeleting ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Story
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
