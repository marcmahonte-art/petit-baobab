"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookStep } from "@/features/coloring-book/types"

interface BookStepperProps {
  activeStep: BookStep
  selectedCount: number
  isGenerating: boolean
  generationProgress: number
  setActiveStep: (step: BookStep) => void
}

export function BookStepper({ activeStep, selectedCount, isGenerating, generationProgress, setActiveStep }: BookStepperProps) {
  return (
    <div className="w-full bg-white rounded-[24px] border border-[#E5E7EB]/80 p-5 md:p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-2">
          {/* Step 1 */}
          <button 
            onClick={() => setActiveStep(1)} 
            className="flex items-start gap-3 text-left focus:outline-none cursor-pointer group"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors duration-200",
              activeStep > 1 ? "bg-[#20C997] text-white" : "bg-[#7D6AF8] text-white"
            )}>
              {activeStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : "1"}
            </div>
            <div className="flex flex-col leading-tight mt-0.5">
              <span className={cn("text-[13px] font-extrabold transition-colors", activeStep === 1 ? "text-[#7D6AF8]" : "text-[#1F2937] group-hover:text-[#7D6AF8]")}>
                Choisir les dessins
              </span>
              <span className="text-[10px] font-bold text-[#64748B] mt-0.5">Sélectionne tes dessins préférés</span>
            </div>
          </button>
          
          {/* Step 2 */}
          <button 
            onClick={() => selectedCount > 0 && setActiveStep(2)} 
            disabled={selectedCount === 0}
            className="flex items-start gap-3 text-left focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors duration-200",
              activeStep === 2 ? "bg-[#7D6AF8] text-white" : activeStep > 2 ? "bg-[#20C997] text-white" : "bg-[#7A6A5E]/15 text-[#7A6A5E]"
            )}>
              {activeStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : "2"}
            </div>
            <div className="flex flex-col leading-tight mt-0.5">
              <span className={cn("text-[13px] font-extrabold transition-colors", activeStep === 2 ? "text-[#7D6AF8]" : "text-[#1F2937] group-hover:text-[#7D6AF8]")}>
                Personnaliser
              </span>
              <span className="text-[10px] font-bold text-[#64748B] mt-0.5">Titre, couverture et options</span>
            </div>
          </button>
          
          {/* Step 3 */}
          <button 
            onClick={() => selectedCount > 0 && setActiveStep(3)} 
            disabled={selectedCount === 0}
            className="flex items-start gap-3 text-left focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors duration-200",
              activeStep === 3 ? "bg-[#7D6AF8] text-white" : activeStep > 3 ? "bg-[#20C997] text-white" : "bg-[#7A6A5E]/15 text-[#7A6A5E]"
            )}>
              {activeStep > 3 ? <Check className="w-4 h-4 stroke-[3]" /> : "3"}
            </div>
            <div className="flex flex-col leading-tight mt-0.5">
              <span className={cn("text-[13px] font-extrabold transition-colors", activeStep === 3 ? "text-[#7D6AF8]" : "text-[#1F2937] group-hover:text-[#7D6AF8]")}>
                Aperçu
              </span>
              <span className="text-[10px] font-bold text-[#64748B] mt-0.5">Vois ton livre avant création</span>
            </div>
          </button>
          
          {/* Step 4 */}
          <button 
            onClick={() => selectedCount > 0 && setActiveStep(4)} 
            disabled={selectedCount === 0}
            className="flex items-start gap-3 text-left focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors duration-200",
              activeStep === 4 ? "bg-[#7D6AF8] text-white" : "bg-[#7A6A5E]/15 text-[#7A6A5E]"
            )}>
              {activeStep === 4 && isGenerating && generationProgress < 100 ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : "4"}
            </div>
            <div className="flex flex-col leading-tight mt-0.5">
              <span className={cn("text-[13px] font-extrabold transition-colors", activeStep === 4 ? "text-[#7D6AF8]" : "text-[#1F2937] group-hover:text-[#7D6AF8]")}>
                Télécharger
              </span>
              <span className="text-[10px] font-bold text-[#64748B] mt-0.5">PDF prêt à imprimer</span>
            </div>
          </button>
        </div>
      </div>
  )
}
