"use client"

import Image from "next/image"

export function StoriesBottomBanner() {
  return (
    <section className="relative w-full rounded-[24px] md:rounded-[32px] overflow-hidden border border-[#F0E7DA] shadow-xs select-none">
      <div className="relative w-full aspect-[785/172] min-h-[120px] sm:min-h-[160px] md:min-h-[190px]">
        <Image
          src="/illustrations/histoires/bottom-banner.png"
          alt="Chaque histoire est une nouvelle aventure qui t'attend !"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover object-center"
        />
      </div>
    </section>
  )
}
