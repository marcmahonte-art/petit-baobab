"use client";

import React, { useEffect, useState } from "react";
import AssistantHeader from "./components/AssistantHeader";
import AssistantStepper from "./components/AssistantStepper";
import ProfileSelector from "./components/ProfileSelector";
import MenaBanner from "./components/MenaBanner";
import ToolCategorySelector from "./components/ToolCategorySelector";
import PromptForm from "./components/PromptForm";
import NeedInput from "./components/NeedInput";
import BaobabAdvice from "./components/BaobabAdvice";
import QuickExamples from "./components/QuickExamples";
import RecentActivities from "./components/RecentActivities";
import ActivityGenerator from "./components/ActivityGenerator";
import GenerationResult from "./components/GenerationResult";
import { Persona, PromptTemplate } from "@/lib/assistant/prompts";
import { createSheet, getToolStarCost, buildShortTitle } from "@/lib/assistant/queries";
import { useAuthStore } from "@/lib/auth-store";
import { AlertCircle } from "lucide-react";

export default function AssistantPage() {
  const user = useAuthStore((s) => s.user);
  const account = useAuthStore((s) => s.account);

  // State management
  const [starBalance, setStarBalance] = useState<number>(740);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPersona, setSelectedPersona] = useState<Persona>("maitresse_maternelle");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [customNeed, setCustomNeed] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationDone, setGenerationDone] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync star balance with Supabase account if logged in
  useEffect(() => {
    if (account?.stars_balance !== undefined) {
      setStarBalance(account.stars_balance);
    }
  }, [account]);

  // Handler: Selecting a persona
  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setSelectedPrompt(null);
    setFormValues({});
    setErrorMessage(null);
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  // Handler: Selecting a prompt tool
  const handleSelectPrompt = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    setErrorMessage(null);
    // Initialize default values
    const defaults: Record<string, string> = {};
    prompt.fields.forEach((field) => {
      if (field.defaultValue) {
        defaults[field.key] = field.defaultValue;
      }
    });
    setFormValues(defaults);
    setCurrentStep(3);
  };

  // Handler: Updating prompt parameter fields
  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  // Handler: Select quick example
  const handleSelectExample = (exampleText: string) => {
    setCustomNeed(exampleText);
  };

  // Handler: Trigger AI Generation (CRITICAL STEP: Star Balance Check & Deduction)
  const handleStartGeneration = () => {
    if (!selectedPrompt) return;
    setErrorMessage(null);

    const cost = getToolStarCost(selectedPrompt.id);

    // Verify star balance before generation
    if (starBalance < cost) {
      setErrorMessage(
        `Solde d'étoiles insuffisant (${starBalance} ✦ disponible${starBalance > 1 ? "s" : ""}). Cette génération nécessite ${cost} ✦.`
      );
      return; // Block generation, do not proceed
    }

    setIsGenerating(true);
  };

  // Handler: Complete Generation (Called by ActivityGenerator timer)
  const handleCompleteGeneration = () => {
    setIsGenerating(false);
    setGenerationDone(true);
    setCurrentStep(4);
  };

  // Handler: Save to Supabase (pedagogical_sheets)
  const handleSaveHistory = async (generatedTitle: string, generatedDetails: string) => {
    if (!selectedPrompt) return;
    const cost = getToolStarCost(selectedPrompt.id);

    const shortTitle = buildShortTitle(selectedPrompt.label, selectedPersona);

    const allInputs = {
      ...formValues,
      customNeed,
    };

    const mockGeneratedText = `Fiche Pédagogique : ${selectedPrompt.label}\nTarget: ${selectedPersona}\nParameters: ${JSON.stringify(allInputs)}\n${generatedDetails}`;

    if (user && account) {
      const result = await createSheet({
        accountId: account.id,
        teacherId: user.id,
        title: shortTitle,
        persona: selectedPersona,
        toolId: selectedPrompt.id,
        category: selectedPrompt.category || null,
        domaineEveil: selectedPrompt.domaine || null,
        inputValues: allInputs,
        generatedContent: mockGeneratedText,
        starsCost: cost,
      });

      if (result.success) {
        if (result.newBalance !== undefined) {
          setStarBalance(result.newBalance);
          useAuthStore.setState((s) =>
            s.account ? { ...s, account: { ...s.account, stars_balance: result.newBalance! } } : s
          );
        }
      } else if (result.error) {
        setErrorMessage(result.error);
      }
    } else {
      // Local fallback for offline/guest mode
      setStarBalance((prev) => Math.max(0, prev - cost));
    }
  };

  // Handler: Reset flow for new activity
  const handleReset = () => {
    setCurrentStep(2);
    setGenerationDone(false);
    setIsGenerating(false);
    setErrorMessage(null);
  };

  const currentCost = selectedPrompt ? getToolStarCost(selectedPrompt.id) : 5;

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <AssistantHeader starBalance={starBalance} />

      {/* Error / Insufficient Balance Banner */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-xs sm:text-sm font-bold">{errorMessage}</p>
        </div>
      )}

      {/* 4-Step Stepper */}
      <AssistantStepper
        currentStep={currentStep}
        onStepClick={(stepId) => setCurrentStep(stepId)}
      />

      {/* Main Content Layout (70% Configuration / 30% Need & Advice) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Main Column (70% ~ 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Profile Selector */}
          <ProfileSelector
            selectedPersona={selectedPersona}
            onSelectPersona={handleSelectPersona}
          />

          {/* MENA Pedagogical Information Banner */}
          <MenaBanner />

          {/* Step 2: Tool Category & Prompt Selector */}
          <ToolCategorySelector
            selectedPersona={selectedPersona}
            selectedPromptId={selectedPrompt?.id || null}
            onSelectPrompt={handleSelectPrompt}
          />

          {/* Step 3: Parameter Customization Form */}
          {selectedPrompt && !isGenerating && !generationDone && (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
              <PromptForm
                prompt={selectedPrompt}
                formValues={formValues}
                onFieldChange={handleFieldChange}
                onGenerate={handleStartGeneration}
                isGenerating={isGenerating}
                starCost={currentCost}
              />
            </div>
          )}

          {/* Loading state during generation */}
          {isGenerating && (
            <ActivityGenerator onComplete={handleCompleteGeneration} />
          )}

          {/* Step 4: Generation Result */}
          {generationDone && selectedPrompt && (
            <GenerationResult
              prompt={selectedPrompt}
              formValues={formValues}
              customNeed={customNeed}
              onSaveHistory={handleSaveHistory}
              onReset={handleReset}
            />
          )}

          {/* Horizontal Scroll of Recent Activities */}
          <RecentActivities />
        </div>

        {/* Right Panel Column (30% ~ 4 cols) */}
        <div className="lg:col-span-4 space-y-5 sticky top-6">
          {/* Custom Need Input (0/250 counter) */}
          <NeedInput value={customNeed} onChange={setCustomNeed} />

          {/* Petit Baobab Advice Card */}
          <BaobabAdvice />

          {/* Quick Clickable Examples */}
          <QuickExamples onSelectExample={handleSelectExample} />
        </div>
      </div>
    </div>
  );
}
