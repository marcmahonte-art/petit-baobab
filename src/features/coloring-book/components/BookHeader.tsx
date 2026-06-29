"use client"

import { BookOpen, ChevronDown, Star } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface BookHeaderProps {
  currentChild: string
  setCurrentChild: (child: string) => void
}

export function BookHeader({ currentChild, setCurrentChild }: BookHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-2">
        <div>
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#1F2937] leading-none tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-[#7D6AF8]" /> Livres de coloriage
          </h1>
          <p className="text-[15px] md:text-[16px] font-bold text-[#64748B] mt-1.5 flex items-center gap-1">
            Crée ton propre livre de coloriage personnalisé !
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Star Counter */}
          <div className="w-[130px] h-[52px] rounded-[16px] border border-[#E5E7EB] bg-white flex items-center gap-2.5 px-3.5 shadow-sm">
            <Star className="w-5 h-5 fill-current text-[#FBBF24]" />
            <div className="flex flex-col justify-center leading-none">
              <span className="text-[15px] font-extrabold text-[#1F2937]">125</span>
              <span className="text-[9px] font-bold text-[#64748B] mt-0.5">Mes étoiles</span>
            </div>
          </div>

          {/* Mes Livres Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button className="w-[150px] h-[52px] rounded-[16px] bg-[#6D4CFF] text-white hover:bg-[#6D4CFF]/90 font-bold text-[15px] flex items-center justify-center gap-2 shadow-md border-none cursor-pointer">
              <BookOpen className="w-5 h-5" />
              <span>Mes livres</span>
            </Button>
          </motion.div>

          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2.5 h-[52px] rounded-full border border-[#E5E7EB] pl-1.5 pr-3.5 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm">
                <Avatar className="w-9 h-9 border border-neutral-100">
                  <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${currentChild}`} />
                  <AvatarFallback>{currentChild.toUpperCase().slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-extrabold text-[#1F2937] capitalize">{currentChild}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[140px] rounded-2xl p-1">
              <DropdownMenuItem onClick={() => setCurrentChild("awa")} className="rounded-xl font-bold text-sm text-[#1F2937]">
                Awa (6 ans)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentChild("kofi")} className="rounded-xl font-bold text-sm text-[#1F2937]">
                Kofi (4 ans)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
  )
}
