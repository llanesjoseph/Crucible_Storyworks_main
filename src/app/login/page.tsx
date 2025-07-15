import { LoginButtons } from "./login-buttons";
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
            <BookOpen className="w-12 h-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold font-headline">Welcome to Crucible Storyworks</h1>
            <p className="text-muted-foreground mt-2">Sign in to begin your storytelling journey.</p>
        </div>
        <LoginButtons />
      </div>
    </div>
  );
}
