"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoaderCircle, AlertTriangle, ExternalLink, Ticket } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Inline SVG for Google icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 398.2 0 256S111.8 0 244 0c69.8 0 131.6 28.3 176.9 74.2L344.9 148.8C318.1 124.9 283.4 112 244 112c-88.6 0-160.2 72.4-160.2 161.6s71.6 161.6 160.2 161.6c96.8 0 138.2-68.5 142.9-104.4H244V261.8h244z"></path>
  </svg>
);

export function LoginButtons() {
  const { user, isLoading, signInWithGoogle, firebaseConfig } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<{title: string, description: React.ReactNode} | null>(null);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);

    // Save invite code to localStorage so we can retrieve it after the redirect.
    if (inviteCode) {
        localStorage.setItem('inviteCode', inviteCode);
    } else {
        localStorage.removeItem('inviteCode');
    }

    const error = await signInWithGoogle();
    if (error) {
      const errorCode = (error as any).code;
      if (errorCode === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your app domain';
        setAuthError({
            title: "Domain Not Authorized",
            description: `Your app's domain (${currentDomain}) must be added to the authorized domains list in your Firebase Authentication settings before you can sign in. Please add it in the Firebase console.`
        });
      } else if (errorCode === 'auth/api-key-not-valid' || errorCode === 'auth/invalid-api-key') {
         const gcpUrl = `https://console.cloud.google.com/apis/credentials?project=${firebaseConfig?.projectId}`;
         setAuthError({
            title: "Invalid API Key",
            description: (
              <div className="space-y-2">
                <p>The Firebase API key used by the app is invalid. Since you've confirmed the 'Identity Toolkit API' is enabled, please check the following:</p>
                <ol className="list-decimal list-inside text-xs space-y-1">
                  <li>
                    <strong>Check for typos:</strong> Meticulously re-copy the <code className="bg-destructive-foreground/20 p-1 rounded-sm">apiKey</code> from your Firebase project settings into your <code className="bg-destructive-foreground/20 p-1 rounded-sm">.env.local</code> file.
                  </li>
                  <li>
                    <strong>Check API Key Restrictions:</strong> Your API key might be restricted. Go to the Google Cloud Console to ensure your app's domain is allowed.
                  </li>
                </ol>
                <Button variant="link" asChild className="p-0 h-auto font-semibold">
                    <Link href={gcpUrl} target="_blank">Check API Credentials <ExternalLink className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            )
        });
      } else {
        setAuthError({
            title: "Sign-in Failed",
            description: "An unexpected error occurred. Please try again."
        });
      }
    }
    // If sign-in is successful, the useEffect above will handle redirection.
    // If it fails, we want to allow another attempt.
    setIsSigningIn(false);
  };
  
  if (isLoading || user) {
      return (
        <div className="flex justify-center items-center p-8">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
                Use Google to sign in. If you have an invite code, enter it below before signing in.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {authError && (
                <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{authError.title}</AlertTitle>
                <AlertDescription>{authError.description}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
                <Label htmlFor="invite-code" className="flex items-center">
                    <Ticket className="w-4 h-4 mr-2" />
                    Invite Code (Optional)
                </Label>
                <Input
                    id="invite-code"
                    placeholder="e.g., TCHR-ABC-123"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="font-mono"
                    autoCapitalize="characters"
                />
            </div>
        </CardContent>
        <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleSignIn} disabled={isSigningIn}>
            {isSigningIn ? (
                <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
                </>
            ) : (
                <>
                <GoogleIcon />
                Sign in with Google
                </>
            )}
            </Button>
        </CardFooter>
    </Card>
  );
}
