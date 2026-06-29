"use client"

import { Search, Bell, Globe, Menu, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import Image from "next/image"

export function Header() {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-2 lg:h-[72px] select-none">
      {/* Mobile Top Bar (Brand + Actions) & Desktop Actions Alignment */}
      <div className="flex items-center justify-between lg:hidden w-full">
        {/* Mobile Left: Menu Toggle + Mini Logo */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-10 h-10 text-[#7A6A5E]">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-4 w-[280px]">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="flex items-center">
            <Image
              src="/illustrations/logo-petit-baobab.webp"
              alt="Petit Baobab"
              width={120}
              height={40}
              className="h-[36px] w-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Mobile Right: Actions */}
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full border border-[#EFE7DB] text-[#7A6A5E] bg-white hover:bg-neutral-50 shrink-0">
            <Globe className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full border border-[#EFE7DB] text-[#7A6A5E] relative bg-white hover:bg-neutral-50 shrink-0">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#FF5E83] rounded-full text-[8px] font-extrabold text-white flex items-center justify-center">3</span>
          </Button>

          <div className="flex items-center gap-2 h-[40px] rounded-full border border-[#EFE7DB] pl-1.5 pr-2.5 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm select-none">
            <Avatar className="w-7 h-7">
              <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=child" />
              <AvatarFallback>AW</AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold text-[#3B2416]">Awa</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#7A6A5E] shrink-0" />
          </div>
        </div>
      </div>

      {/* Search Bar - Responsive layout */}
      <div className="relative w-full lg:w-[640px]">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A6A5E]" />
        <Input
          placeholder="Que veux-tu créer aujourd'hui ? (ex : un éléphant...)"
          className="pl-14 pr-6 w-full h-[54px] rounded-full border border-[#EFE7DB] bg-white text-base font-medium text-[#3B2416] placeholder-[#7A6A5E]/60 focus-visible:ring-1 focus-visible:ring-[#FFD95C]"
        />
      </div>

      {/* Desktop Actions */}
      <div className="hidden lg:flex items-center gap-3">
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-[#EFE7DB] text-[#7A6A5E] bg-white hover:bg-neutral-50">
          <Globe className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-[#EFE7DB] text-[#7A6A5E] relative bg-white hover:bg-neutral-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF5E83] rounded-full text-[9px] font-extrabold text-white flex items-center justify-center">3</span>
        </Button>

        <div className="flex items-center gap-2 h-[56px] rounded-full border border-[#EFE7DB] pl-2 pr-4 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=child" />
            <AvatarFallback>AW</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left leading-none">
            <span className="text-sm font-bold text-[#3B2416]">Awa</span>
            <span className="text-[10px] font-bold text-[#7A6A5E] mt-0.5">6 ans</span>
          </div>
          <ChevronDown className="w-4 h-4 text-[#7A6A5E] ml-1 shrink-0" />
        </div>
      </div>
    </header>
  )
}
