"use client";

import React from "react";
import { Check } from "lucide-react";

export interface StepperStep {
  id: number;
  title: string;
  subtitle: string;
  color: string;
}

const STEPS: StepperStep[] = [
  { id: 1, title: "Mon profil", subtitle: "Qui êtes-vous ?", color: "#65A916" },
  { id: 2, title: "Choix de l'outil", subtitle: "Que voulez-vous créer ?", color: "#FF8A00" },
  { id: 3, title: "Personnalisation", subtitle: "Décrivez votre besoin", color: "#6535E8" },
  { id: 4, title: "Résultat", subtitle: "Votre contenu est prêt", color: "#FFBD00" },
];

interface AssistantStepperProps {
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export default function AssistantStepper({ currentStep, onStepClick }: AssistantStepperProps) {
  return (
    <div className="w-full bg-white border border-[#EDE3D5] rounded-2xl p-3 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between overflow-x-auto gap-2 sm:gap-4 no-scrollbar pb-1 sm:pb-0">
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isAccessible = step.id <= currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <button
                type="button"
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={!isAccessible}
                className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition-all duration-300 shrink-0 text-left ${
                  isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                } ${
                  isActive
                    ? "bg-[#FFFBF5] ring-2 ring-offset-1 shadow-xs"
                    : "hover:bg-[#FAF6EE]"
                }`}
                style={{
                  borderColor: isActive ? step.color : undefined,
                  boxShadow: isActive ? `0 0 0 2px ${step.color}20` : undefined,
                }}
              >
                {/* Step badge number / icon */}
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm sm:text-base text-white transition-transform duration-200 shrink-0"
                  style={{
                    backgroundColor: isCompleted || isActive ? step.color : "#D8CEBE",
                    transform: isActive ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : step.id}
                </div>

                {/* Step label */}
                <div className="flex flex-col min-w-[100px] sm:min-w-[120px]">
                  <span
                    className="font-bold text-xs sm:text-sm line-clamp-1"
                    style={{
                      color: isActive ? step.color : isCompleted ? "#35180D" : "#7A6A5E",
                    }}
                  >
                    {step.title}
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#90847B] font-medium line-clamp-1">
                    {step.subtitle}
                  </span>
                </div>
              </button>

              {/* Step connector line */}
              {index < STEPS.length - 1 && (
                <div className="hidden md:block flex-1 h-[2px] min-w-[20px] bg-[#E8DFC9] rounded-full mx-1">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: currentStep > step.id ? STEPS[index + 1].color : "transparent",
                      width: currentStep > step.id ? "100%" : "0%",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
