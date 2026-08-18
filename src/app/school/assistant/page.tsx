"use client";

import React, { useState } from "react";
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

export default function AssistantPage() {
  // State management
  const [starBalance, setStarBalance] = useState<number>(740);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPersona, setSelectedPersona] = useState<Persona>("maitresse_maternelle");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [customNeed, setCustomNeed] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationDone, setGenerationDone] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<Array<{ id: string; title: string; date: string }>>([]);

  // Handler: Selecting a persona
  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setSelectedPrompt(null);
    setFormValues({});
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  // Handler: Selecting a prompt tool
  const handleSelectPrompt = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
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

  // Handler: Trigger AI Generation
  const handleStartGeneration = () => {
    if (!selectedPrompt) return;
    setIsGenerating(true);
  };

  // Handler: Complete Generation (Called by ActivityGenerator timer)
  const handleCompleteGeneration = () => {
    setIsGenerating(false);
    setGenerationDone(true);
    setStarBalance((prev) => Math.max(0, prev - 5));
    setCurrentStep(4);
  };

  // Handler: Reset flow for new activity
  const handleReset = () => {
    setCurrentStep(2);
    setGenerationDone(false);
    setIsGenerating(false);
  };

  // Handler: Save generated item to local history state
  const handleSaveHistory = (title: string, details: string) => {
    const newItem = {
      id: `hist_${Date.now()}`,
      title,
      date: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setHistoryItems((prev) => [newItem, ...prev]);
  };

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <AssistantHeader starBalance={starBalance} />

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
                starCost={5}
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
