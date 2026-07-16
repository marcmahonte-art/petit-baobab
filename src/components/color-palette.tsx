"use client"

import { useColoringStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

export const colors = [
  { name: "Rouge", value: "#E63946" },
  { name: "Orange", value: "#F77F00" },
  { name: "Jaune", value: "#FCBF49" },
  { name: "Vert pomme", value: "#8AC926" },
  { name: "Bleu ciel", value: "#1982C4" },
  { name: "Violet", value: "#6A4C93" },
  { name: "Rose pastel", value: "#FFB5C0" },
  { name: "Pêche", value: "#FFD8A9" },
  { name: "Bleu pastel", value: "#A8DADC" },
  { name: "Vert menthe", value: "#B5E8C5" },
  { name: "Lavande", value: "#D4C1EC" },
  { name: "Marron", value: "#8B5E3C" },
  { name: "Beige", value: "#E8D4B0" },
  { name: "Vert forêt", value: "#3A5A40" },
  { name: "Noir", value: "#2B2D42" },
  { name: "Blanc", value: "#F1F1F1" },
]

export function ColorPalette() {
  const { selectedColor, setSelectedColor } = useColoringStore()

  return (
    <div className="flex items-center gap-2 flex-wrap w-full">
      {colors.map((color) => {
        const isSelected = selectedColor === color.value

        return (
          <motion.button
            key={color.name}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedColor(color.value)}
            title={color.name}
            className={cn(
              "w-[48px] h-[48px] rounded-full relative cursor-pointer flex items-center justify-center transition-all shadow-sm focus:outline-none shrink-0 border border-black/10",
              isSelected && "border-[4px] border-[#F5C400] scale-105"
            )}
            style={{ background: color.value }}
          >
            {isSelected && (
              <Check className="w-5 h-5 text-white stroke-[3.5px] drop-shadow-sm" />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
