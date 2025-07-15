import AppLayout from "@/components/app-layout";
import { StoryFrameworkBuilder } from "@/components/story-framework-builder";

export default function CreateStoryPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight font-headline">
              Story Framework Builder
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Let's build the foundation for your next great story, step-by-step.
            </p>
          </div>
          <StoryFrameworkBuilder />
        </div>
      </div>
    </AppLayout>
  );
}
