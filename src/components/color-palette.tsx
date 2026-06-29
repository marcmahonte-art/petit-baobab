"use client"

import { useColoringStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

export const colors = [
  { name: "Rouge", value: "#FF5E83" },
  { name: "Orange", value: "#FF8E3C" },
  { name: "Jaune", value: "#FFD95C" },
  { name: "Vert Clair", value: "#A8E05F" }, // Added light green to match mockup
  { name: "Vert", value: "#20C997" },
  { name: "Turquoise", value: "#13C6A2" },
  { name: "Bleu", value: "#1194FF" },
  { name: "Violet", value: "#7D6AF8" },
  { name: "Rose", value: "#FF85A2" },
  { name: "Marron", value: "#8D5B4C" },
  { name: "Beige", value: "#F0E7DA" },
  { name: "Gris", value: "#A19388" },
  { name: "Noir", value: "#3B2416" },
  { name: "Rainbow", value: "rainbow" },
]

export function ColorPalette() {
  const { selectedColor, setSelectedColor } = useColoringStore()

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none w-full">
      {colors.map((color) => {
        const isSelected = selectedColor === color.value
        const isRainbow = color.value === "rainbow"

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
            style={{
              background: isRainbow
                ? "linear-gradient(45deg, #ff5e83, #ff8e3c, #ffd95c, #20c997, #1194ff, #7d6af8)"
                : color.value,
            }}
          >
            {isSelected && (
              <Check className="w-5 h-5 text-white stroke-[3.5px] drop-shadow-sm" />
            )}
            {isRainbow && !isSelected && (
              <span className="text-[9px] font-black text-white drop-shadow-sm uppercase">
                Arc
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
