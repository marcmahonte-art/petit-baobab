"use client"

import { useEffect, useState } from "react"
import {
  Sparkles,
  CheckCircle2,
  Sprout,
  Palette,
  Globe,
  Mic,
  BookOpen,
} from "lucide-react"

interface GenerationProgressProps {
  onComplete?: () => void
  isFinished?: boolean
}

const STEPS = [
  { Icon: Sprout, text: "Préparation de ton aventure..." },
  { Icon: Sparkles, text: "Création de ton histoire personnalisée..." },
  { Icon: Palette, text: "Dessin et stylisation des personnages..." },
  { Icon: Globe, text: "Immersion dans l'univers africain..." },
  { Icon: Mic, text: "Préparation de la narration contée..." },
  { Icon: BookOpen, text: "Assemblage final du livre magique..." },
]

export function GenerationProgress({ onComplete, isFinished = false }: GenerationProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1200)

    return () => clearInterval(timer)
  }, [])

  const CurrentIcon = STEPS[currentStepIndex].Icon

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] p-6 max-w-lg mx-auto text-center animate-in zoom-in-95 duration-300">
      {/* Halo animé */}
      <div className="relative mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#FFB300] via-[#7D6AF8] to-[#20C997] animate-spin p-1 flex items-center justify-center blur-xs opacity-80">
          <div className="w-full h-full bg-[#FFF9F2] rounded-full" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-[#7D6AF8]">
          <CurrentIcon className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-[#3B2416] mb-2">
        La magie de Petit Baobab opère...
      </h3>
      <p className="text-sm font-semibold text-[#684C38] mb-6">
        Nous écrivons un conte unique pour ton enfant.
      </p>

      {/* Liste des étapes */}
      <div className="w-full bg-white rounded-2xl p-5 border border-[#F0E7DA] shadow-xs flex flex-col gap-3">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex || isFinished
          const isCurrent = idx === currentStepIndex && !isFinished
          const StepIcon = step.Icon

          return (
            <div
              key={step.text}
              className={`flex items-center gap-3 text-left transition-all duration-300 ${
                isDone
                  ? "text-[#20C997]"
                  : isCurrent
                  ? "text-[#7D6AF8] font-black scale-102"
                  : "text-[#B5A595] opacity-60"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#20C997]" />
              ) : isCurrent ? (
                <StepIcon className="w-4 h-4 shrink-0 text-[#7D6AF8] animate-spin" />
              ) : (
                <StepIcon className="w-4 h-4 shrink-0 opacity-40" />
              )}
              <span className="text-xs sm:text-sm font-bold truncate">{step.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
