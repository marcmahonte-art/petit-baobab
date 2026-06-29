"use client"

import { Paintbrush, PaintBucket, Eraser, Wand2, Undo, Redo, ZoomIn, ZoomOut, Trash2 } from "lucide-react"
import { useColoringStore, ToolType } from "@/lib/store"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

interface DrawingToolsPanelProps {
  onUndo?: () => void
  onRedo?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onClearAll?: () => void
}

export function DrawingToolsPanel({
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onClearAll,
}: DrawingToolsPanelProps) {
  const { selectedTool, setSelectedTool, historyIndex, canvasHistory } = useColoringStore()
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < canvasHistory.length - 1 && historyIndex !== -1

  const tools = [
    { id: "brush" as ToolType, label: "Pinceau", icon: Paintbrush },
    { id: "bucket" as ToolType, label: "Pot de peinture", icon: PaintBucket },
    { id: "eraser" as ToolType, label: "Gomme", icon: Eraser },
    { id: "fill" as ToolType, label: "Remplissage", icon: Wand2 },
  ]

  return (
    <div className="bg-white rounded-[32px] border border-[#EFE7DB] p-[20px] shadow-sm select-none flex flex-col gap-[20px] h-full w-[220px]">
      {/* 1. Drawing Tools List */}
      <div className="flex flex-col gap-1">
        {tools.map((tool) => {
          const isSelected = selectedTool === tool.id
          return (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTool(tool.id)}
              className={cn(
                "w-full flex items-center gap-[16px] pl-[18px] rounded-[18px] transition-all cursor-pointer h-[60px]",
                isSelected
                  ? "bg-[#EFE8FF] text-[#7C57FF] font-semibold"
                  : "bg-transparent text-[#3B2416] hover:bg-neutral-50 font-semibold"
              )}
            >
              <tool.icon className={cn("w-[28px] h-[28px]", isSelected ? "text-[#7C57FF]" : "text-[#7A6A5E]")} />
              <span className="text-[16px]">{tool.label}</span>
            </motion.button>
          )
        })}
      </div>

      <div className="border-t border-[#ECECEC] my-[8px]" />

      {/* 2. History Section */}
      <TooltipProvider>
        <div className="flex flex-col gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={canUndo ? { scale: 1.02, x: 2 } : undefined}
                whileTap={canUndo ? { scale: 0.98 } : undefined}
                onClick={onUndo}
                disabled={!canUndo}
                className={cn(
                  "w-full flex items-center gap-[16px] pl-[18px] rounded-[18px] bg-transparent text-[#3B2416] font-semibold h-[60px] transition-all",
                  canUndo
                    ? "hover:bg-neutral-50 cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                )}
              >
                <Undo className="w-[28px] h-[28px] text-[#7A6A5E]" />
                <span className="text-[16px]">Annuler</span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#2D1846] text-white border-none font-bold rounded-lg shadow-md px-3 py-1.5 text-xs">
              Annuler (Ctrl + Z / Cmd + Z)
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={canRedo ? { scale: 1.02, x: 2 } : undefined}
                whileTap={canRedo ? { scale: 0.98 } : undefined}
                onClick={onRedo}
                disabled={!canRedo}
                className={cn(
                  "w-full flex items-center gap-[16px] pl-[18px] rounded-[18px] bg-transparent text-[#3B2416] font-semibold h-[60px] transition-all",
                  canRedo
                    ? "hover:bg-neutral-50 cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                )}
              >
                <Redo className="w-[28px] h-[28px] text-[#7A6A5E]" />
                <span className="text-[16px]">Refaire</span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#2D1846] text-white border-none font-bold rounded-lg shadow-md px-3 py-1.5 text-xs">
              Refaire (Ctrl + Shift + Z / Ctrl + Y / Cmd + Shift + Z)
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div className="border-t border-[#ECECEC] my-[8px]" />

      {/* 3. Zoom Section */}
      <div className="flex flex-col gap-1">
        <motion.button
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onZoomIn}
          className="w-full flex items-center gap-[16px] pl-[18px] rounded-[18px] bg-transparent text-[#3B2416] hover:bg-neutral-50 font-semibold h-[60px] cursor-pointer"
        >
          <ZoomIn className="w-[28px] h-[28px] text-[#7A6A5E]" />
          <span className="text-[16px]">Zoom +</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onZoomOut}
          className="w-full flex items-center gap-[16px] pl-[18px] rounded-[18px] bg-transparent text-[#3B2416] hover:bg-neutral-50 font-semibold h-[60px] cursor-pointer"
        >
          <ZoomOut className="w-[28px] h-[28px] text-[#7A6A5E]" />
          <span className="text-[16px]">Zoom -</span>
        </motion.button>
      </div>

      <div className="border-t border-[#ECECEC] mt-auto pt-4" />

      {/* 4. Clear All Outlined Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClearAll}
        className="w-full flex items-center justify-center gap-2 h-[56px] rounded-full border-[2px] border-[#D8CCFF] text-[#7C57FF] bg-transparent hover:bg-[#7C57FF]/5 font-bold text-base cursor-pointer shadow-sm transition-all duration-250"
      >
        <Trash2 className="w-5 h-5 text-[#7C57FF]" />
        <span>Effacer tout</span>
      </motion.button>
    </div>
  )
}
