"use client"

import { memo } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { TreePine, Gift } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookPage as BookPageModel } from "../types"

export interface BookIndexProps {
  pages: BookPageModel[]
  current: number
  onSelect: (index: number) => void
  total: number
  className?: string
}

/** Bandeau de miniatures (sommaire) de la version interactive. */
function BookIndexComponent({ pages, current, onSelect, total, className }: BookIndexProps) {
  return (
    <div className={cn("w-full flex flex-col gap-2 shrink-0", className)}>
      <span className="text-xs font-black uppercase tracking-wider px-1 text-[#64748B]">
        Pages du livre ({total})
      </span>

      <div className="flex w-full items-stretch gap-4 overflow-x-auto pb-3 scrollbar-thin">
        {pages.map((page, idx) => {
          const isSelected = current === idx
          return (
            <motion.button
              key={page.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(idx)}
              className={cn(
                "relative flex w-[120px] h-[160px] shrink-0 flex-col justify-between rounded-xl border bg-white p-2 text-left shadow-sm transition-all",
                isSelected
                  ? "border-[3px] border-[#6D4CFF] ring-2 ring-[#6D4CFF]/10"
                  : "border-neutral-200/80 hover:border-neutral-300",
              )}
            >
              <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900/5 text-[8px] font-black text-neutral-600">
                {idx + 1}
              </div>

              <div className="relative mt-1 flex-1 w-full border border-neutral-100 rounded-lg bg-[#FAFAFC] overflow-hidden flex items-center justify-center p-1">
                {page.type === "cover" ? (
                  <TreePine className="h-5 w-5 text-[#22C55E]" />
                ) : page.type === "belongs_to" ? (
                  <Gift className="h-5 w-5 text-[#6D4CFF]" />
                ) : (
                  <div className="relative h-full w-full">
                    <Image
                      src={page.image || "/illustrations/animals/elephant.svg"}
                      alt="miniature"
                      fill
                      className="object-contain grayscale"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col leading-none px-0.5 pt-1">
                <span className="w-full truncate text-[10px] font-black text-[#1F2937]">{page.title}</span>
                <span className="mt-0.5 w-full truncate capitalize text-[8px] font-bold text-[#64748B]">{page.details}</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export const BookIndex = memo(BookIndexComponent)
