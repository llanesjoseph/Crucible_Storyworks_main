
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Trash, LoaderCircle, Sparkles, ArrowLeft, Wand2, Check, RefreshCw, AlertTriangle, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { developConcept } from '@/ai/flows/develop-concept';
import { refineConcept } from '@/ai/flows/refine-concept';
import { refineCharacters } from '@/ai/flows/refine-characters';
import { refineSetting } from '@/ai/flows/refine-setting';
import { refineStructure } from '@/ai/flows/refine-structure';
import type { DevelopConceptOutput } from '@/lib/develop-concept-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/use-auth';
import { generateOutline } from '@/app/create-story/actions';
import type { StoryData } from '@/lib/data';
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
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FirestoreRulesFixer } from '@/components/firestore-rules-fixer';
import { doc, getDoc, setDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GenerateStoryFrameworkInput } from '@/lib/story-framework-schema';
import { GenerateStoryFrameworkInputSchema } from '@/lib/story-framework-schema';

const totalSteps = 5;

type FormDataShape = Omit<StoryData, 'id' | 'userId' | 'createdAt' | 'lastUpdated' | 'title' | 'description' | 'status' | 'chapters' | 'generatedContent'> & {
    structure: { numChapters?: number; type: string; targetLength: string; centralConflict: string; };
};

const initialFormData: FormDataShape = {
  concept: { title: '', genre: 'Fantasy', tone: 'Adventurous', logline: '', gradeLevel: 'Middle School', collaborationMode: 'solo' as 'solo' | 'group' },
  characters: [{ id: 1, name: '', role: 'Protagonist', traits: [] }],
  setting: { timeframe: '', location: '', worldDescription: '' },
  structure: { type: 'Three-Act Structure', targetLength: 'Novel (50k-100k words)', centralConflict: '', numChapters: 8 }
};

type Character = z.infer<typeof GenerateStoryFrameworkInputSchema.shape.characters>[number];
type SuggestedCharacter = DevelopConceptOutput['suggestedCharacters'][0];
type RefinementAction = 'refine' | 'expand';

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Creating Story...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Create Story Framework
        </>
      )}
    </Button>
  );
}

function RefinementAssistant({
  title,
  description,
  prompt,
  onPromptChange,
  onSubmit,
  isLoading,
  action,
  onActionChange,
}: {
  title: string;
  description: string;
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  action: RefinementAction;
  onActionChange: (action: RefinementAction) => void;
}) {
  return (
    <Card className="border-primary/20 border-dashed bg-primary/5">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Action</Label>
          <RadioGroup value={action} onValueChange={(v) => onActionChange(v as RefinementAction)} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="refine" id="refine" />
              <Label htmlFor="refine">Refine</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expand" id="expand" />
              <Label htmlFor="expand">Expand</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label htmlFor="refinement-prompt">Your Instructions</Label>
          <Textarea
            id="refinement-prompt"
            placeholder="e.g., 'Make the characters younger' or 'Change the setting to a cyberpunk city'"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={isLoading}
            className="bg-background"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onSubmit} disabled={!prompt || isLoading} className="w-full">
          {isLoading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Submit to AI
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function StoryFrameworkBuilder() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataShape>(initialFormData);
  const [nextCharId, setNextCharId] = useState(2);
  const [suggestions, setSuggestions] = useState<DevelopConceptOutput | null>(null);
  
  const [isDraftLoading, setIsDraftLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<{message: string; isPermissionError: boolean} | null>(null);

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isRefiningConcept, setIsRefiningConcept] = useState(false);
  const [isRefiningCharacters, setIsRefiningCharacters] = useState(false);
  const [isRefiningSetting, setIsRefiningSetting] = useState(false);
  const [isRefiningStructure, setIsRefiningStructure] = useState(false);

  const [refinementAction, setRefinementAction] = useState<RefinementAction>('refine');
  const [conceptPrompt, setConceptPrompt] = useState('');
  const [characterPrompt, setCharacterPrompt] = useState('');
  const [settingPrompt, setSettingPrompt] = useState('');
  const [structurePrompt, setStructurePrompt] = useState('');
  
  // Load draft from Firestore on mount
  useEffect(() => {
    if (!user) {
        setIsDraftLoading(false);
        return;
    };

    async function loadDraft() {
        setIsDraftLoading(true);
        try {
            const draftRef = doc(db, 'storyDrafts', user!.uid);
            const docSnap = await getDoc(draftRef);
            if (docSnap.exists()) {
                const draftData = docSnap.data();
                if (draftData?.formData) {
                    setFormData(draftData.formData);
                    if (draftData.formData.characters && draftData.formData.characters.length > 0) {
                        const maxId = Math.max(0, ...draftData.formData.characters.map((c: any) => c.id || 0));
                        setNextCharId(maxId + 1);
                    }
                    toast({ description: "Resumed your cloud-saved draft." });
                }
            }
        } catch (error) {
            console.error("Failed to load draft:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not load your draft.";
            toast({ variant: 'destructive', title: 'Error Loading Draft', description: errorMessage });
        } finally {
            setIsDraftLoading(false);
        }
    }

    loadDraft();
  }, [user, toast]);

  const handleSaveDraft = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be signed in to save a draft.' });
        return;
    }
    setSaveStatus('saving');
    try {
        const draftRef = doc(db, 'storyDrafts', user.uid);
        await setDoc(draftRef, { 
            formData: formData,
            lastUpdated: new Date().toISOString()
        });
        setSaveStatus('saved');
        toast({ title: 'Draft Saved!', description: 'Your progress has been saved.' });
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
        setSaveStatus('idle');
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        toast({ variant: 'destructive', title: 'Save Failed', description: `An error occurred while saving. Please check your connection and Firestore rules. Error: ${errorMessage}` });
        console.error("Error saving draft:", error);
    }
  };


  const handleStartOver = async () => {
    if (user) {
        try {
            const draftRef = doc(db, 'storyDrafts', user.uid);
            await deleteDoc(draftRef);
        } catch (error) {
            console.error("Could not delete draft on start over:", error);
        }
    }
    setFormData(initialFormData);
    setNextCharId(2);
    setStep(1);
    setSuggestions(null);
    setConceptPrompt('');
    setCharacterPrompt('');
    setSettingPrompt('');
    setStructurePrompt('');
    toast({ description: "Started a new story framework." });
  };
  
  const isCharAdded = (char: SuggestedCharacter) => {
    return formData.characters.some((c) => c.name.toLowerCase() === char.name.toLowerCase());
  };

  const preparedDataForAI: GenerateStoryFrameworkInput = useMemo(() => {
    return {
      ...formData,
      characters: formData.characters.map(({ id, ...rest }) => ({
        ...rest,
        traits: Array.isArray(rest.traits) ? rest.traits : [],
      })).filter((c) => c.name),
      structure: {
        ...formData.structure,
        numChapters: formData.structure.numChapters || suggestions?.suggestedStructure.suggestedChapterCount,
      }
    };
  }, [formData, suggestions]);

  const handleNext = async () => {
    if (step === 1) {
      setIsSuggesting(true);
      setStep(prev => prev + 1);
      try {
        const result = await developConcept(formData.concept);
        setSuggestions(result);
        setFormData(prev => ({
          ...prev,
          structure: {
            ...prev.structure,
            numChapters: result.suggestedStructure.suggestedChapterCount || prev.structure.numChapters,
          }
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not get AI suggestions.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
      } finally {
        setIsSuggesting(false);
      }
      return;
    }
    setStep(prev => Math.min(prev + 1, totalSteps + 1));
  };

  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
  
  const handleConceptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, concept: { ...prev.concept, [name]: value } }));
  };

  const handleSelectChange = (name: 'genre' | 'tone' | 'gradeLevel', value: string) => {
    setFormData(prev => ({ ...prev, concept: { ...prev.concept, [name]: value } }));
  };

  const handleCharacterChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      characters: prev.characters.map((c) => c.id === id ? { ...c, [name]: value } : c)
    }));
  };
  
  const handleCharacterTraitsChange = (id: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      characters: prev.characters.map((c) => c.id === id ? { ...c, traits: value.split(',').map(t => t.trim()) } : c)
    }));
  };

  const addCharacter = () => {
    setFormData(prev => ({
      ...prev,
      characters: [...prev.characters, { id: nextCharId, name: '', role: 'Supporting Character', traits: [] }]
    }));
    setNextCharId(prev => prev + 1);
  };

  const removeCharacter = (id: number) => {
    setFormData(prev => ({
      ...prev,
      characters: prev.characters.filter((c) => c.id !== id)
    }));
  };
  
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({ ...prev, setting: { ...prev.setting, [name]: value } }));
  }

  const handleStructureChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
     if (name === 'numChapters') {
       setFormData(prev => ({ ...prev, structure: { ...prev.structure, [name]: value ? parseInt(value, 10) : undefined } }));
     } else {
       setFormData(prev => ({ ...prev, structure: { ...prev.structure, [name]: value } }));
     }
  }
  const handleStructureSelectChange = (name: 'type' | 'targetLength', value: string) => {
    setFormData(prev => ({ ...prev, structure: { ...prev.structure, [name]: value } }));
  };

  const useSuggestion = (type: 'logline' | 'setting' | 'structure') => {
    if (!suggestions) return;
    if (type === 'logline') {
      setFormData(prev => ({ ...prev, concept: { ...prev.concept, logline: suggestions.enhancedLogline } }));
      toast({ description: "Logline updated with AI suggestion." });
    }
    if (type === 'setting') {
      setFormData(prev => ({ ...prev, setting: suggestions.suggestedSetting }));
      toast({ description: "Setting updated with AI suggestion." });
    }
    if (type === 'structure') {
      setFormData(prev => ({ ...prev, structure: { ...prev.structure, centralConflict: suggestions.suggestedStructure.centralConflict } }));
      toast({ description: "Central conflict updated with AI suggestion." });
    }
  };

  const addSuggestedCharacter = (character: SuggestedCharacter) => {
    if (formData.characters.some((c) => c.name.toLowerCase() === character.name.toLowerCase())) {
      toast({ variant: 'default', title: 'Character already exists' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      characters: [...prev.characters.filter((c) => c.name !== '' || (Array.isArray(c.traits) && c.traits.length > 0)), { id: nextCharId, name: character.name, role: character.role, traits: character.traits.split(',').map(t => t.trim()) }]
    }));
    setNextCharId(prev => prev + 1);
    toast({ description: `Character "${character.name}" added.` });
  };
  
  const useAllSuggestions = () => {
    if (!suggestions) return;

    const newCharacters = suggestions.suggestedCharacters.map((char, index) => ({
      id: nextCharId + index,
      name: char.name,
      role: char.role,
      traits: char.traits.split(',').map(t => t.trim()),
    }));

    setFormData(prev => ({
      ...prev,
      concept: {
        ...prev.concept,
        logline: suggestions.enhancedLogline,
      },
      characters: newCharacters,
      setting: suggestions.suggestedSetting,
      structure: {
        ...prev.structure,
        centralConflict: suggestions.suggestedStructure.centralConflict,
      },
    }));

    setNextCharId(prev => prev + newCharacters.length);
    toast({ description: "All AI suggestions have been applied." });
  };

  const handleRefineConcept = async () => {
    if (!conceptPrompt || !suggestions) return;
    setIsRefiningConcept(true);
    try {
      const result = await refineConcept({
        concept: formData.concept,
        currentSuggestions: suggestions,
        action: refinementAction,
        refinementPrompt: conceptPrompt
      });
      setSuggestions(result);
      setConceptPrompt('');
      toast({ title: "Suggestions updated!", description: "The AI has updated the suggestions based on your feedback." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not refine suggestions.";
      toast({ variant: "destructive", title: "Refinement Error", description: errorMessage });
    } finally {
      setIsRefiningConcept(false);
    }
  };

  const handleRefineCharacters = async () => {
    if (!characterPrompt) return;
    setIsRefiningCharacters(true);
    try {
      const result = await refineCharacters({
        characters: preparedDataForAI.characters,
        action: refinementAction,
        refinementPrompt: characterPrompt,
      });
      setFormData(prev => ({
        ...prev,
        characters: result.refinedCharacters.map((c, index) => ({
          id: prev.characters[index]?.id || Date.now() + index,
          name: c.name,
          role: c.role,
          traits: Array.isArray(c.traits) ? c.traits : [],
        }))
      }));
      setCharacterPrompt('');
      toast({ title: "Characters updated!", description: "The AI has updated the character list." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not refine characters.";
      toast({ variant: "destructive", title: "Refinement Error", description: errorMessage });
    } finally {
      setIsRefiningCharacters(false);
    }
  };

  const handleRefineSetting = async () => {
    if (!settingPrompt) return;
    setIsRefiningSetting(true);
    try {
      const result = await refineSetting({
        setting: formData.setting,
        concept: formData.concept,
        characters: preparedDataForAI.characters,
        action: refinementAction,
        refinementPrompt: settingPrompt,
      });
      setFormData(prev => ({ ...prev, setting: result.refinedSetting }));
      setSettingPrompt('');
      toast({ title: "Setting updated!", description: "The AI has updated the setting details." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not refine the setting.";
      toast({ variant: "destructive", title: "Refinement Error", description: errorMessage });
    } finally {
      setIsRefiningSetting(false);
    }
  };

  const handleRefineStructure = async () => {
    if (!structurePrompt) return;
    setIsRefiningStructure(true);
    try {
      const result = await refineStructure({
        ...preparedDataForAI,
        action: refinementAction,
        refinementPrompt: structurePrompt
      });
      setFormData(prev => ({ ...prev, structure: { ...prev.structure, centralConflict: result.refinedCentralConflict } }));
      setStructurePrompt('');
      toast({ title: "Conflict updated!", description: "The AI has updated the central conflict." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not refine the conflict.";
      toast({ variant: "destructive", title: "Refinement Error", description: errorMessage });
    } finally {
      setIsRefiningStructure(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be signed in to create a story.' });
      return;
    }
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Step 1: Generate the outline via server action
      const outlineResult = await generateOutline(preparedDataForAI);

      if (outlineResult.error || !outlineResult.data) {
        throw new Error(outlineResult.error || "AI failed to return valid outline data.");
      }
      
      // Step 2: Create the full story object on the client
      const newStory: Omit<StoryData, 'id'> = {
        userId: user.uid,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        title: formData.concept.title || 'Untitled Story',
        description: formData.concept.logline || 'No description provided.',
        status: 'complete',
        chapters: outlineResult.data.chapterBreakdown.length,
        concept: preparedDataForAI.concept,
        characters: preparedDataForAI.characters,
        setting: preparedDataForAI.setting,
        structure: preparedDataForAI.structure,
        generatedContent: outlineResult.data,
      };

      // Step 3: Save the new story to Firestore from the client
      const docRef = await addDoc(collection(db, 'stories'), newStory);

      // Step 4: Delete the draft
      try {
        const draftRef = doc(db, 'storyDrafts', user.uid);
        await deleteDoc(draftRef);
      } catch (draftError) {
        console.error("Could not delete draft, but story was created:", draftError);
      }

      // Step 5: Redirect
      toast({ title: "Success!", description: "Your story framework has been created." });
      router.push(`/stories/${docRef.id}/outline`);

    } catch (e) {
      console.error("Error creating story:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      
      if (errorMessage.includes('permission-denied') || errorMessage.includes('PERMISSION_DENIED')) {
        setSubmissionError({
          message: "Permission Denied. Your database security rules are blocking this action.",
          isPermissionError: true,
        });
      } else {
        setSubmissionError({
          message: `Failed to create story: ${errorMessage}`,
          isPermissionError: false,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const loglineUsed = useMemo(() => suggestions && formData.concept.logline === suggestions.enhancedLogline, [formData.concept.logline, suggestions]);
  const settingUsed = useMemo(() => {
    if (!suggestions) return false;
    try {
      return JSON.stringify(formData.setting) === JSON.stringify(suggestions.suggestedSetting);
    } catch (e) {
      return false;
    }
  }, [formData.setting, suggestions]);
  const structureUsed = useMemo(() => suggestions && formData.structure.centralConflict === suggestions.suggestedStructure.centralConflict, [formData.structure.centralConflict, suggestions]);


  if (isDraftLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-24 ml-auto" />
        </CardFooter>
      </Card>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader><CardTitle className="font-headline">Step 1: The Core Concept</CardTitle><CardDescription>What is your story about?</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="title">Story Title (Optional)</Label><Input id="title" name="title" value={formData.concept.title} onChange={handleConceptChange} placeholder="e.g., The Last Dragon of Eldoria" /></div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label htmlFor="genre">Genre</Label>
                  <Select name="genre" value={formData.concept.genre} onValueChange={(v) => handleSelectChange('genre', v)}>
                    <SelectTrigger><SelectValue placeholder="Select a genre" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Fantasy">Fantasy</SelectItem><SelectItem value="Sci-Fi">Sci-Fi</SelectItem><SelectItem value="Mystery">Mystery</SelectItem><SelectItem value="Thriller">Thriller</SelectItem><SelectItem value="Adventure">Adventure</SelectItem><SelectItem value="Horror">Horror</SelectItem><SelectItem value="Comedy">Comedy</SelectItem><SelectItem value="Drama">Drama</SelectItem><SelectItem value="Rom-Com">Rom-Com</SelectItem><SelectItem value="Romance">Romance</SelectItem><SelectItem value="Crime">Crime</SelectItem><SelectItem value="History">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2"><Label htmlFor="tone">Tone</Label>
                  <Select name="tone" value={formData.concept.tone} onValueChange={(v) => handleSelectChange('tone', v)}>
                    <SelectTrigger><SelectValue placeholder="Select a tone" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Adventurous">Adventurous</SelectItem><SelectItem value="Humorous">Humorous</SelectItem><SelectItem value="Serious">Serious</SelectItem><SelectItem value="Dark">Dark</SelectItem><SelectItem value="Whimsical">Whimsical</SelectItem><SelectItem value="Romantic">Romantic</SelectItem><SelectItem value="Suspenseful">Suspenseful</SelectItem><SelectItem value="Uplifting">Uplifting</SelectItem><SelectItem value="Gritty">Gritty</SelectItem><SelectItem value="Satirical">Satirical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="gradeLevel">Grade Level</Label>
                  <Select name="gradeLevel" value={formData.concept.gradeLevel || ''} onValueChange={(v) => handleSelectChange('gradeLevel', v)}>
                    <SelectTrigger><SelectValue placeholder="Select a grade level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Elementary School">Elementary School</SelectItem>
                      <SelectItem value="Middle School">Middle School</SelectItem>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                      <SelectItem value="General Audience">General Audience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="logline">Logline / One-Sentence Pitch</Label><Textarea id="logline" name="logline" value={formData.concept.logline} onChange={handleConceptChange} placeholder="e.g., A young wizard must team up with a cynical dragon to prevent a prophecy that spells doom for their world." /></div>
              <div className="space-y-3 pt-4">
                <Label>Project Type</Label>
                <RadioGroup
                  name="collaborationMode"
                  value={formData.concept.collaborationMode}
                  onValueChange={(value: 'solo' | 'group') => setFormData(prev => ({ ...prev, concept: { ...prev.concept, collaborationMode: value } }))}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="solo" id="solo-project" />
                    <Label htmlFor="solo-project" className="font-normal cursor-pointer">Solo Project</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="group" id="group-project" />
                    <Label htmlFor="group-project" className="font-normal cursor-pointer">Group Collaboration</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Choose if this is for individual students or a collaborative group.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        if (isSuggesting) {
          return (
            <Card><CardHeader><CardTitle className="font-headline">Developing Your Concept...</CardTitle><CardDescription>Our AI co-writer is brainstorming ideas based on your concept. Please wait a moment.</CardDescription></CardHeader><CardContent className="flex flex-col items-center justify-center space-y-4 p-12"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /><p className="text-muted-foreground">Generating suggestions...</p></CardContent></Card>
          );
        }
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="font-headline">Step 2: AI-Assisted Development</CardTitle>
                    <CardDescription>Here are some AI-generated ideas to flesh out your concept. Use, edit, or ignore them as you see fit.</CardDescription>
                  </div>
                  {suggestions && (
                    <Button onClick={useAllSuggestions} disabled={isRefiningConcept}>
                      <Check className="mr-2 h-4 w-4" />
                      Use All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {suggestions ? (
                  <>
                    <div>
                      <Label className="text-base font-semibold">Suggested Logline</Label>
                      <div className="flex items-start gap-2 mt-1">
                        <p className="text-sm text-muted-foreground flex-1 p-3 bg-secondary rounded-md">{suggestions.enhancedLogline}</p>
                        <Button variant={loglineUsed ? "success" : "outline"} size="sm" onClick={() => useSuggestion('logline')} disabled={isRefiningConcept}>
                          {loglineUsed ? <Check className="mr-2 h-4 w-4"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                          {loglineUsed ? 'Used' : 'Use this'}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-semibold">Suggested Characters</Label>
                      <div className="space-y-2 mt-1">{suggestions.suggestedCharacters.map((char, i) => {
                          const charAdded = isCharAdded(char);
                          return (
                            <div key={i} className="flex items-start gap-2 p-3 bg-secondary rounded-md">
                              <div className="flex-1">
                                <h4 className="font-bold">{char.name} <span className="text-xs font-normal text-muted-foreground bg-background px-1.5 py-0.5 rounded-full">{char.role}</span></h4>
                                <p className="text-sm text-muted-foreground mt-1">{char.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">Traits: {char.traits}</p>
                              </div>
                              <Button variant={charAdded ? "success" : "outline"} size="sm" onClick={() => addSuggestedCharacter(char)} disabled={isRefiningConcept}>
                                {charAdded ? <Check className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                                {charAdded ? 'Added' : 'Add'}
                              </Button>
                            </div>
                          );
                      })}</div>
                    </div>
                    <div>
                      <Label className="text-base font-semibold">Suggested Setting</Label>
                      <div className="flex items-start gap-2 mt-1">
                        <div className="text-sm text-muted-foreground flex-1 p-3 bg-secondary rounded-md">
                          <p><strong>{suggestions.suggestedSetting.location}</strong> ({suggestions.suggestedSetting.timeframe})</p>
                          <p className="mt-1">{suggestions.suggestedSetting.worldDescription}</p>
                        </div>
                        <Button variant={settingUsed ? "success" : "outline"} size="sm" onClick={() => useSuggestion('setting')} disabled={isRefiningConcept}>
                          {settingUsed ? <Check className="mr-2 h-4 w-4"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                          {settingUsed ? 'Used' : 'Use this'}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-semibold">Suggested Central Conflict</Label>
                      <div className="flex items-start gap-2 mt-1">
                        <p className="text-sm text-muted-foreground flex-1 p-3 bg-secondary rounded-md">{suggestions.suggestedStructure.centralConflict}</p>
                        <Button variant={structureUsed ? "success" : "outline"} size="sm" onClick={() => useSuggestion('structure')} disabled={isRefiningConcept}>
                          {structureUsed ? <Check className="mr-2 h-4 w-4"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                          {structureUsed ? 'Used' : 'Use this'}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : <p className="text-center text-muted-foreground py-8">Failed to load AI suggestions. You can continue manually.</p>}
              </CardContent>
            </Card>
            {suggestions && <RefinementAssistant title="Refine Suggestions" description="Not quite right? Tell the AI what you'd like to change and it will generate new ideas." prompt={conceptPrompt} onPromptChange={setConceptPrompt} onSubmit={handleRefineConcept} isLoading={isRefiningConcept} action={refinementAction} onActionChange={setRefinementAction} />}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-headline">Step 3: The Characters</CardTitle><CardDescription>Define the characters in your story. Add or remove them as needed.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {formData.characters.map((char) => (<div key={char.id} className="p-4 border rounded-md space-y-3 relative">{formData.characters.length > 1 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeCharacter(char.id!)}><Trash className="h-4 w-4" /></Button>}<div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor={`char-name-${char.id}`}>Name</Label><Input id={`char-name-${char.id}`} name="name" value={char.name} onChange={(e) => handleCharacterChange(char.id!, e)} placeholder="Character's Name" /></div><div className="space-y-2"><Label htmlFor={`char-role-${char.id}`}>Role</Label><Input id={`char-role-${char.id}`} name="role" value={char.role} onChange={(e) => handleCharacterChange(char.id!, e)} placeholder="e.g., Protagonist, Antagonist" /></div></div><div className="space-y-2"><Label htmlFor={`char-traits-${char.id}`}>Key Traits (comma-separated)</Label><Input id={`char-traits-${char.id}`} name="traits" value={Array.isArray(char.traits) ? char.traits.join(', ') : ''} onChange={(e) => handleCharacterTraitsChange(char.id!, e.target.value)} placeholder="e.g., Brave, Impulsive, Loyal" /></div></div>))}
                <Button type="button" variant="outline" onClick={addCharacter}><PlusCircle className="mr-2 h-4 w-4" /> Add Character</Button>
              </CardContent>
            </Card>
            <RefinementAssistant title="Refine Characters" description="Need help with your cast? Give the AI instructions to add, remove, or change characters." prompt={characterPrompt} onPromptChange={setCharacterPrompt} onSubmit={handleRefineCharacters} isLoading={isRefiningCharacters} action={refinementAction} onActionChange={setRefinementAction} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="font-headline">Step 4: The Setting</CardTitle><CardDescription>Describe where and when your story takes place.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="timeframe">Timeframe</Label><Input id="timeframe" name="timeframe" value={formData.setting.timeframe} onChange={handleSettingChange} placeholder="e.g., Distant Future, Medieval Era" /></div><div className="space-y-2"><Label htmlFor="location">Primary Location</Label><Input id="location" name="location" value={formData.setting.location} onChange={handleSettingChange} placeholder="e.g., The Floating City of Aethel" /></div></div>
                    <div className="space-y-2"><Label htmlFor="worldDescription">World Description</Label><Textarea id="worldDescription" name="worldDescription" value={formData.setting.worldDescription} onChange={handleSettingChange} placeholder="Describe the unique aspects of your world. What are the rules, societies, and general atmosphere?" className="min-h-[120px]" /></div>
                </CardContent>
            </Card>
            <RefinementAssistant title="Refine Setting" description="Flesh out your world. Ask the AI to add historical details, describe the culture, or make the atmosphere more specific." prompt={settingPrompt} onPromptChange={setSettingPrompt} onSubmit={handleRefineSetting} isLoading={isRefiningSetting} action={refinementAction} onActionChange={setRefinementAction} />
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="font-headline">Step 5: The Structure</CardTitle><CardDescription>How will your story be organized?</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Narrative Structure</Label>
                          <Select name="type" value={formData.structure.type} onValueChange={(v) => handleStructureSelectChange('type', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Three-Act Structure">Three-Act Structure</SelectItem>
                              <SelectItem value="The Hero's Journey">The Hero's Journey</SelectItem>
                              <SelectItem value="Episodic">Episodic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Target Length</Label>
                          <Select name="targetLength" value={formData.structure.targetLength} onValueChange={(v) => handleStructureSelectChange('targetLength', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Short Story (1k-7.5k words)">Short Story (1k-7.5k words)</SelectItem>
                              <SelectItem value="Novella (17k-40k words)">Novella (17k-40k words)</SelectItem>
                              <SelectItem value="Novel (50k-100k words)">Novel (50k-100k words)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="numChapters">Number of Chapters</Label>
                            <Input
                                id="numChapters"
                                name="numChapters"
                                type="number"
                                value={formData.structure.numChapters ?? ''}
                                onChange={handleStructureChange}
                                placeholder="e.g., 12"
                                min="1"
                                max="50"
                            />
                        </div>
                    </div>
                    <div className="space-y-2"><Label htmlFor="centralConflict">The Central Conflict</Label><Textarea id="centralConflict" name="centralConflict" value={formData.structure.centralConflict} onChange={handleStructureChange} placeholder="What is the main problem or goal that drives the story forward?" className="min-h-[100px]" /></div>
                </CardContent>
            </Card>
            <RefinementAssistant title="Refine Central Conflict" description="Need help? Give the AI instructions to rewrite or expand the central conflict." prompt={structurePrompt} onPromptChange={setStructurePrompt} onSubmit={handleRefineStructure} isLoading={isRefiningStructure} action={refinementAction} onActionChange={setRefinementAction} />
          </div>
        );
      case totalSteps + 1:
        if (!user) {
          return (
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-destructive">Authentication Required</CardTitle>
                <CardDescription>You must be signed in to create a story.</CardDescription>
              </CardHeader>
            </Card>
          )
        }
        return (
          <Card>
            <CardHeader><CardTitle className="font-headline">Final Review</CardTitle><CardDescription>Review your story concept below. After creating the framework, you'll be able to generate the chapter-by-chapter outline.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <div><h3 className="font-semibold text-lg font-headline">Concept</h3>
                  <p><strong>Title:</strong> {formData.concept.title || "N/A"}</p>
                  <p><strong>Grade Level:</strong> {formData.concept.gradeLevel || "N/A"}</p>
                  <p><strong>Genre:</strong> {formData.concept.genre}</p>
                  <p><strong>Tone:</strong> {formData.concept.tone}</p>
                  <p><strong>Project Type:</strong> <span className="capitalize">{formData.concept.collaborationMode} Project</span></p>
                </div>
                <div><h3 className="font-semibold text-lg font-headline">Characters</h3><ul className="list-disc pl-5">{formData.characters.filter((c) => c.name).map((c) => <li key={c.id}>{c.name} ({c.role})</li>)}</ul></div>
                <div><h3 className="font-semibold text-lg font-headline">Setting</h3><p>{formData.setting.location}, {formData.setting.timeframe}</p></div>
                <div><h3 className="font-semibold text-lg font-headline">Structure</h3><p>{formData.structure.type} - {formData.structure.centralConflict}</p></div>
                
                {submissionError?.isPermissionError ? (
                  <FirestoreRulesFixer />
                ) : submissionError ? (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Creating Story</AlertTitle>
                        <AlertDescription>{submissionError.message}</AlertDescription>
                    </Alert>
                ) : null}

            </CardContent>
            <CardFooter>
              <SubmitButton isSubmitting={isSubmitting} />
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  }

  const isWorking = isSuggesting || isRefiningConcept || isRefiningCharacters || isRefiningSetting || isRefiningStructure;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Progress value={(step / (totalSteps + 1)) * 100} className="w-full" />
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-4 shrink-0">
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will delete your current draft and start a new, empty story framework. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleStartOver}>Start Over</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        if (step === totalSteps + 1) {
          handleFinalSubmit();
        } else {
          handleNext();
        }
      }}>
        {renderStep()}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1 || isWorking || isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            
            {step <= totalSteps && (
                <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={saveStatus !== 'idle'}>
                        {saveStatus === 'saving' && <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Saving...</>}
                        {saveStatus === 'saved' && <><Check className="mr-2 h-4 w-4" />Saved!</>}
                        {saveStatus === 'idle' && <><Save className="mr-2 h-4 w-4" />Save Draft</>}
                    </Button>
                    <Button type="submit" disabled={isWorking || isSubmitting}>Next</Button>
                </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
