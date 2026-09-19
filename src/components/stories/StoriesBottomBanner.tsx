"use client"

import Image from "next/image"

export function StoriesBottomBanner() {
  return (
    <section className="relative w-full rounded-[24px] md:rounded-[32px] overflow-hidden border border-[#F0E7DA] shadow-xs select-none">
      <div className="relative w-full aspect-[785/165] min-h-[140px] sm:min-h-[180px] md:min-h-[210px]">
        <Image
          src="/illustrations/histoires/bottom-banner.webp"
          alt="Chaque histoire est une nouvelle aventure qui t'attend !"
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover object-center"
        />
      </div>
    </section>
  )
}
