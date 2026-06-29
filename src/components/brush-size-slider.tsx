"use client"

import { useColoringStore } from "@/lib/store"
import { Slider } from "@/components/ui/slider"

const sizes = [1, 2, 4, 6, 8, 12, 20]

export function BrushSizeSlider() {
  const { brushSize, setBrushSize } = useColoringStore()

  // Find current size index
  const currentIndex = sizes.indexOf(brushSize) !== -1 ? sizes.indexOf(brushSize) : 3

  const handleSliderChange = (val: number[]) => {
    const index = val[0]
    if (index >= 0 && index < sizes.length) {
      setBrushSize(sizes[index])
    }
  }

  return (
    <div className="flex items-center gap-3.5 select-none w-full px-1 py-1">
      <span className="text-xs sm:text-sm font-extrabold text-[#7A6A5E] shrink-0">
        Taille
      </span>
      <div className="flex-1 min-w-[70px]">
        <Slider
          min={0}
          max={sizes.length - 1}
          step={1}
          value={[currentIndex]}
          onValueChange={handleSliderChange}
        />
      </div>
      <span className="text-xs sm:text-sm font-extrabold text-[#3B2416] shrink-0 text-right min-w-[34px]">
        {brushSize}px
      </span>
    </div>
  )
}
