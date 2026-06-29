"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronRight, ChevronDown, Cat, Apple, Briefcase, Drum, Type, TreePalm, Home, TreePine, GraduationCap, PartyPopper, type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useColoringStore } from "@/lib/store"

interface CategoryItem {
  id: string
  label: string
  icon: LucideIcon
}

const categories: CategoryItem[] = [
  { id: "animals", label: "Animaux", icon: Cat },
  { id: "fruits", label: "Fruits & Légumes", icon: Apple },
  { id: "jobs", label: "Métiers", icon: Briefcase },
  { id: "culture", label: "Culture Africaine", icon: Drum },
  { id: "alphabet", label: "Alphabet ABC", icon: Type },
]

const themes: CategoryItem[] = [
  { id: "savannah", label: "Savane Africaine", icon: TreePalm },
  { id: "village", label: "Vie au Village", icon: Home },
  { id: "forest", label: "Grande Forêt", icon: TreePine },
  { id: "school", label: "L'École des Petits", icon: GraduationCap },
  { id: "party", label: "Fêtes & Danses", icon: PartyPopper },
]

export function CategoryTabs() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { selectedCategory, setSelectedCategory } = useColoringStore()

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      const timer = setTimeout(() => {
        setIsCollapsed(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  const renderList = (items: CategoryItem[]) => (
    <div className="flex flex-col gap-2 mt-4 select-none">
      {items.map((item) => {
        const isActive = selectedCategory === item.id
        return (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory(item.id)}
            className={cn(
              "h-[70px] rounded-[18px] px-[18px] flex items-center justify-between transition-all cursor-pointer shadow-sm border",
              isActive
                ? "bg-[#FFF7DD] border-[#FFE08A] text-[#3B2416] font-bold"
                : "bg-white border-[#EFE7DB] text-[#7A6A5E] hover:bg-neutral-50"
            )}
          >
            <div className="flex items-center gap-[16px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#FFF9F2] flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-[#7D6AF8]" />
              </div>
              <span className="text-[18px] font-semibold text-[#3B2416]">
                {item.label}
              </span>
            </div>
            <ChevronRight className={cn("w-5 h-5", isActive ? "text-[#3B2416]" : "text-[#7A6A5E]")} />
          </motion.div>
        )
      })}
    </div>
  )

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Mobile Accordion Header */}
      <div
        onClick={() => {
          if (window.innerWidth < 768) {
            setIsCollapsed(!isCollapsed)
          }
        }}
        className="w-full flex md:hidden justify-between items-center h-[40px] cursor-pointer px-1 select-none"
      >
        <h4 className="text-lg font-extrabold text-[#3B2416] flex items-center gap-2">
          <span>Explorer les dessins</span>
        </h4>
        <ChevronDown className={cn("w-5 h-5 text-[#7A6A5E] transition-transform", !isCollapsed && "rotate-180")} />
      </div>

      {/* Accordion Content */}
      <div className={cn("w-full transition-all duration-200", isCollapsed && "hidden md:block")}>
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-[18px] p-1 bg-[#EFE7DB]/60 h-[52px] border border-[#EFE7DB]/40">
          <TabsTrigger 
            value="categories" 
            className="rounded-[14px] font-extrabold text-[15px] cursor-pointer h-full transition-all duration-250 data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#8B6CFF] data-[state=active]:to-[#6E4EF5] data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Catégories
          </TabsTrigger>
          <TabsTrigger 
            value="themes" 
            className="rounded-[14px] font-extrabold text-[15px] cursor-pointer h-full transition-all duration-250 data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#8B6CFF] data-[state=active]:to-[#6E4EF5] data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Thèmes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          {renderList(categories)}
        </TabsContent>
        <TabsContent value="themes">
          {renderList(themes)}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
