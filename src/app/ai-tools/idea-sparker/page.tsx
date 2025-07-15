import AppLayout from "@/components/app-layout";
import { IdeaSparkerForm } from "@/app/ai-tools/idea-sparker/form";

export default function IdeaSparkerPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight font-headline">
              AI Idea Sparker
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Unleash creativity with AI-generated story ideas. Provide a theme, a character, or a simple phrase to get started.
            </p>
          </div>
          <div className="mt-8">
            <IdeaSparkerForm />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
