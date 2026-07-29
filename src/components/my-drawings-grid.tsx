"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ChevronDown, Loader2 } from "lucide-react"
import { useColoringStore, DrawingItem } from "@/lib/store"

export function MyDrawingsGrid() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [drawingsByCategory, setDrawingsByCategory] = useState<Record<string, DrawingItem[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { currentDrawing, setCurrentDrawing, selectedCategory } = useColoringStore()

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      const timer = setTimeout(() => {
        setIsCollapsed(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/drawings")
        if (res.ok) {
          const data = await res.json()
          setDrawingsByCategory(data)
        }
      } catch (err) {
        console.error("Failed to fetch drawings:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDrawings()
  }, [])

  const currentCategoryDrawings = drawingsByCategory[selectedCategory] || []

  return (
    <div className="flex flex-col gap-2 md:gap-[14px] select-none w-full">
      {/* Header section: Height 40px, Display flex, Justify-content space-between */}
      <div 
        onClick={() => {
          if (window.innerWidth < 768) {
            setIsCollapsed(!isCollapsed)
          }
        }}
        className="h-[40px] flex justify-between items-center w-full px-1 cursor-pointer md:cursor-default"
      >
        <h4 className="text-sm md:text-lg font-extrabold text-[#3B2416] flex items-center gap-2">
          <span>Modeles</span>
          <ChevronDown className={cn("w-5 h-5 text-[#7A6A5E] md:hidden transition-transform", !isCollapsed && "rotate-180")} />
        </h4>
        <span className="text-[10px] font-bold bg-[#4A4EBE]/15 text-[#4A4EBE] px-2.5 py-1 rounded-full uppercase tracking-wider">
          {selectedCategory}
        </span>
      </div>

      {/* Grid of drawings: 2 columns, Gap 14px, scrollable */}
      {!isCollapsed && (
        <div className="max-h-[360px] overflow-y-auto pr-1 custom-scrollbar min-h-[140px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[140px] py-8 text-neutral-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#4A4EBE]" />
              <span className="text-xs font-semibold">Chargement des dessins...</span>
            </div>
          ) : currentCategoryDrawings.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[140px] text-center py-8 text-xs font-semibold text-[#7A6A5E] px-4 leading-normal">
              Aucun modele disponible dans cette categorie.
              <p className="text-[10px] text-[#7A6A5E]/70 mt-1 font-medium leading-relaxed">
                Ajoute des fichiers .svg dans <code className="bg-neutral-100 px-1 py-0.5 rounded">public/illustrations/{selectedCategory}/</code> pour les voir ici !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 md:gap-[14px] justify-items-center pb-4 pt-1">
              {currentCategoryDrawings.map((draw) => {
                const isActive = currentDrawing.id === draw.id
                return (
                  <motion.div
                    key={draw.id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setCurrentDrawing({ ...draw, category: selectedCategory })}
                    className={cn(
                      "w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-[14px] md:rounded-[18px] border p-1.5 md:p-2 flex items-center justify-center cursor-pointer transition-all shadow-sm relative bg-white overflow-hidden",
                      isActive
                        ? "border-[2px] border-[#6D4CFF] ring-2 ring-[#6D4CFF]/15"
                        : "border-[#ECECEC] hover:border-[#6D4CFF]/40"
                    )}
                  >
                    <div className="w-full h-full relative flex items-center justify-center bg-[#FFF9F2] rounded-[12px] overflow-hidden">
                      <img
                        src={draw.image}
                        alt={draw.name}
                        className="w-full h-full object-contain p-1.5"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.opacity = "0" }}
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-black text-center py-1 pointer-events-none truncate px-1">
                      {draw.name}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

