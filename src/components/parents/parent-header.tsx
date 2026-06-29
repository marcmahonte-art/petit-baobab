"use client"

import { BookOpen, ChevronDown, Star } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ParentHeaderProps {
  currentChild: string
  onChildChange: (child: string) => void
}

export function ParentHeader({ currentChild, onChildChange }: ParentHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 select-none">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-[36px] font-extrabold text-[#334155] leading-tight">
          Espace parents
        </h1>
        <p className="text-base font-medium text-[#64748B] mt-1">
          Gérez les comptes, les plans et suivez les activités de vos enfants.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Star Badge */}
        <div className="w-[140px] h-[58px] rounded-[16px] border border-[#E5E7EB] bg-white flex items-center gap-3 px-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[16px] font-extrabold text-[#334155]">125</span>
            <span className="text-[10px] font-bold text-[#64748B]">Mes étoiles</span>
          </div>
        </div>

        {/* Mes Livres Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-[160px] h-[56px] rounded-[18px] bg-[#6D4AFF] text-white hover:bg-[#6D4AFF]/90 font-bold text-[16px] flex items-center justify-center gap-2 shadow-md border-none cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            <span>Mes livres</span>
          </Button>
        </motion.div>

        {/* Kid Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 h-[58px] rounded-full border border-[#E5E7EB] pl-2 pr-4 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm select-none">
              <Avatar className="w-10 h-10 border border-neutral-100">
                <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=child" />
                <AvatarFallback>AW</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1.5">
                <span className="text-[16px] font-extrabold text-[#334155]">Awa</span>
                <ChevronDown className="w-4 h-4 text-[#64748B]" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px] rounded-2xl p-1.5">
            <DropdownMenuItem onClick={() => onChildChange("awa")} className="rounded-xl font-bold text-sm text-[#334155]">
              Awa (6 ans)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChildChange("kofi")} className="rounded-xl font-bold text-sm text-[#334155]">
              Kofi (4 ans)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
