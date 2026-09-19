"use client"

import { useState } from "react"
import { StoryStudio } from "./StoryStudio"
import { StoryCreator } from "./creator/StoryCreator"

export function StoryStudioContainer() {
  const [mode, setMode] = useState<"studio" | "wizard">("studio")

  if (mode === "wizard") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-end px-4">
          <button
            type="button"
            onClick={() => setMode("studio")}
            className="text-xs font-extrabold text-[#7D6AF8] hover:underline cursor-pointer"
          >
            ← Revenir au mode Studio (Prompt Libre)
          </button>
        </div>
        <StoryCreator />
      </div>
    )
  }

  return <StoryStudio onSwitchToWizard={() => setMode("wizard")} />
}
