
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import AuthGuard from '@/components/auth-guard';
import { AlertTriangle } from 'lucide-react';
import { ViewModeProvider } from '@/hooks/use-view-mode';

export const metadata: Metadata = {
  title: 'Crucible Storyworks',
  description: 'Collaborative storytelling for the modern classroom.',
};

function MissingFirebaseConfig() {
  const envTemplate = `
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
`.trim();

  return (
    <html lang="en">
      <body className="bg-background text-foreground font-body">
        <div className="flex min-h-screen flex-col items-center justify-center p-8">
          <div className="w-full max-w-2xl rounded-lg border-2 border-dashed border-destructive p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold font-headline text-destructive">
              Action Required: Connect Your Firebase Project
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your application is not connected to Firebase. To get started, you need to provide your project's configuration keys.
            </p>
            <div className="mt-6 text-left">
              <p className="font-semibold">Follow these steps:</p>
              <ol className="list-decimal pl-6 mt-2 space-y-2 text-sm">
                <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Firebase Console</a> and open your project settings.</li>
                <li>Under "Your apps", find and select your web app.</li>
                <li>In the "Firebase SDK snippet" section, select "Config" to view your project's keys.</li>
                <li>Create a new file named <code className="bg-muted text-muted-foreground p-1 rounded-md font-mono text-xs">.env.local</code> in the root directory of this project.</li>
                <li>Copy the content below into your <code className="bg-muted text-muted-foreground p-1 rounded-md font-mono text-xs">.env.local</code> file and replace the placeholder values with your actual Firebase project keys.</li>
              </ol>
              <pre className="mt-4 p-4 bg-muted rounded-md text-xs overflow-x-auto">
                <code>{envTemplate}</code>
              </pre>
              <p className="mt-4 text-sm text-center text-muted-foreground">After creating the file, the application will automatically restart and connect to your project.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!isFirebaseConfigured) {
    return <MissingFirebaseConfig />;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ViewModeProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
            <Toaster />
          </ViewModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
