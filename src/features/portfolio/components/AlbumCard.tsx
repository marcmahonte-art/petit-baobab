"use client"

import { motion } from "framer-motion"
import { CARD_IN } from "../animations"
import type { AlbumSummary } from "../albums"

interface AlbumCardProps {
  album: AlbumSummary
  onOpen: (album: AlbumSummary) => void
}

export function AlbumCard({ album, onOpen }: AlbumCardProps) {
  return (
    <motion.button
      type="button"
      variants={CARD_IN}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onOpen(album)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#F1E7DA] bg-white text-left shadow-sm transition hover:shadow-lg"
    >
      <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF6E8] to-[#FFE08A]">
        {album.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={album.cover} alt={album.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <span className="text-5xl" aria-hidden="true">
            {album.icon}
          </span>
        )}
        <span className="absolute bottom-2 right-2 rounded-full bg-white/85 px-2 py-0.5 text-xs font-extrabold text-[#3B2416] backdrop-blur-sm">
          {album.count}
        </span>
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-extrabold text-[#3B2416]">{album.title}</h3>
        <p className="text-xs font-semibold text-[#B4A495]">Année {album.year}</p>
      </div>
    </motion.button>
  )
}
