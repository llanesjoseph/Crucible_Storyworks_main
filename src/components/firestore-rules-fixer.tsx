
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Check, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Stories can only be accessed by their owner.
    match /stories/{storyId} {
      allow read, update, delete: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    // Drafts can only be accessed by their owner.
    match /storyDrafts/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Student performance analyses can be created by any authenticated user,
    // but can only be read or updated by the teacher who created them.
    match /studentPerformanceAnalyses/{studentId} {
      allow read, update: if request.auth.uid == resource.data.teacherId;
      allow create: if request.auth.uid != null;
    }
  }
}`;

export function FirestoreRulesFixer() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(firestoreRules);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Firestore rules copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-destructive bg-destructive/5 mt-4">
        <CardHeader>
            <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <div className="flex-1">
                    <CardTitle className="text-destructive font-headline">Action Required: Permission Denied</CardTitle>
                    <CardDescription className="text-destructive/80">
                        This error is almost always caused by one of two things:
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold">1. Your Session is Initializing</h4>
                    <p className="text-sm text-muted-foreground mt-1">If you just logged in, your authentication might not be fully ready. The simplest fix is to <strong className="font-semibold text-foreground">click the "Create Story" button again.</strong> This usually works.</p>
                </div>
                 <div>
                    <h4 className="font-semibold">2. Incorrect Security Rules</h4>
                    <p className="text-sm text-muted-foreground mt-1">If retrying doesn't work, your security rules are incorrect. Go to your Firebase project's <strong className="font-semibold">Firestore Database → Rules</strong> tab and replace everything with the code below.</p>
                </div>
            </div>

            <div className="relative rounded-md bg-background p-4 font-mono text-xs">
                <pre><code>{firestoreRules}</code></pre>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
            </div>
             <Button asChild className="w-full">
                <Link href="https://console.firebase.google.com/" target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Firebase Console
                </Link>
            </Button>
        </CardContent>
    </Card>
  );
}
