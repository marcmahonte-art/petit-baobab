"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { HeroStep } from "./HeroStep"
import { AgeStep } from "./AgeStep"
import { LocationStep } from "./LocationStep"
import { ThemeValueStep } from "./ThemeValueStep"
import { StyleStep } from "./StyleStep"
import { GenerationProgress } from "./GenerationProgress"
import { saveCustomStoryLocally } from "@/lib/stories/story-service"
import type { StoryThemeId } from "@/lib/stories/types"

export function StoryCreator() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("Moussa")
  const [heroType, setHeroType] = useState<"garcon" | "fille" | "enfant" | "animal" | "imaginaire">("garcon")
  const [age, setAge] = useState(7)
  const [country, setCountry] = useState("Burkina Faso")
  const [environment, setEnvironment] = useState("savane")
  const [theme, setTheme] = useState<StoryThemeId>("aventure")
  const [educationalGoal, setEducationalGoal] = useState("partage")
  const [visualStyle, setVisualStyle] = useState<"petit-baobab-3d" | "album-jeunesse" | "aquarelle">("petit-baobab-3d")

  const totalSteps = 5

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) {
      setErrorMsg("Veuillez indiquer le prénom du héros !")
      return
    }
    setErrorMsg(null)
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleLaunchGeneration()
    }
  }

  const handlePrev = () => {
    setErrorMsg(null)
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    } else {
      router.push("/histoires")
    }
  }

  const handleLaunchGeneration = async () => {
    setIsGenerating(true)
    setErrorMsg(null)

    try {
      const payload = {
        name,
        heroType,
        age,
        country,
        environment,
        theme,
        educationalGoal,
        visualStyle,
      }

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Une erreur est survenue lors de la création.")
      }

      // Sauvegarde locale de l'histoire générée
      if (data.story) {
        saveCustomStoryLocally(data.story)
      }

      // Petite pause pour admirer la fin de l'animation
      setTimeout(() => {
        router.push(`/histoires/${data.storyId}`)
      }, 1500)
    } catch (err: any) {
      console.error("Erreur création:", err)
      setIsGenerating(false)
      setErrorMsg(err.message || "Erreur de connexion. Veuillez réessayer.")
    }
  }

  if (isGenerating) {
    return <GenerationProgress />
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full px-4 py-4">
      {/* Barre de progression des étapes */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-black text-[#684C38]">
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center gap-1 hover:text-[#3B2416] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? "Retour catalogue" : "Étape précédente"}</span>
          </button>
          <span>
            Étape {currentStep} sur {totalSteps}
          </span>
        </div>

        <div className="w-full bg-[#EFE7DB] h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FFB300] to-[#7D6AF8] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Message d'erreur éventuel */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#FF5E83]/10 border border-[#FF5E83]/20 text-[#D81B60] text-sm font-bold text-center">
          {errorMsg}
        </div>
      )}

      {/* Rendu dynamique de l'étape en cours */}
      <div className="min-h-[380px]">
        {currentStep === 1 && (
          <HeroStep
            name={name}
            onNameChange={setName}
            heroType={heroType}
            onHeroTypeChange={setHeroType}
          />
        )}
        {currentStep === 2 && <AgeStep age={age} onAgeChange={setAge} />}
        {currentStep === 3 && (
          <LocationStep
            country={country}
            onCountryChange={setCountry}
            environment={environment}
            onEnvironmentChange={setEnvironment}
          />
        )}
        {currentStep === 4 && (
          <ThemeValueStep
            theme={theme}
            onThemeChange={setTheme}
            educationalGoal={educationalGoal}
            onEducationalGoalChange={setEducationalGoal}
          />
        )}
        {currentStep === 5 && (
          <StyleStep style={visualStyle} onStyleChange={setVisualStyle} />
        )}
      </div>

      {/* Boutons d'action en bas */}
      <div className="flex items-center justify-between pt-4 border-t border-[#F0E7DA]">
        <button
          type="button"
          onClick={handlePrev}
          className="px-6 py-3 rounded-full border-2 border-[#EFE7DB] hover:border-[#3B2416] text-[#684C38] font-bold text-sm transition-all cursor-pointer"
        >
          Précédent
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#6852F6] hover:from-[#6D58F7] hover:to-[#573EF4] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer"
        >
          {currentStep === totalSteps ? (
            <>
              <Sparkles className="w-5 h-5 fill-white/20" />
              <span>Générer mon livre magique !</span>
            </>
          ) : (
            <>
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
