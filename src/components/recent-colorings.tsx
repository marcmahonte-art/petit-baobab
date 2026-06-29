import Image from "next/image"
import { Pencil } from "lucide-react"

const colorings = [
  { image: "/illustrations/coloring-elephant.png", title: "Éléphant de la savane", time: "Il y a 2 heures" },
  { image: "/illustrations/coloring-balafon.png", title: "Petite fille et balafon", time: "Il y a 1 jour" },
  { image: "/illustrations/coloring-baobab.png", title: "Baobab", time: "Il y a 2 jours" },
  { image: "/illustrations/coloring-giraffe.png", title: "Girafe", time: "Il y a 3 jours" },
]

export function RecentColorings() {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,.06)]">
      <div className="h-[64px] flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-[#3B2416]">Derniers coloriages</h3>
        <a href="#" className="text-sm font-bold text-[#7A6A5E] hover:text-[#3B2416]">Voir tout</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 xs:gap-4">
        {colorings.map((c, i) => (
          <div key={i} className="coloring-item h-[200px] xs:h-[240px] md:h-[280px] rounded-[18px] border border-[#ECECEC] p-2 xs:p-3 flex flex-col bg-white">
            <div className="flex-1 min-h-0 rounded-[12px] bg-[#FFF9F2] flex items-center justify-center overflow-hidden relative">
              <Image
                src={c.image}
                alt={c.title}
                width={120}
                height={120}
                className="w-[80%] h-[80%] object-contain"
              />
              <div className="absolute bottom-1.5 right-1.5 xs:bottom-2 xs:right-2 w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-[#FFE08A] flex items-center justify-center">
                <Pencil className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#3B2416]" />
              </div>
            </div>
            <div className="h-[45px] xs:h-[55px] flex flex-col justify-center pt-1 xs:pt-2">
              <span className="text-xs xs:text-sm font-bold text-[#3B2416] leading-tight truncate">{c.title}</span>
              <span className="text-[10px] xs:text-xs text-[#7A6A5E] mt-0.5">{c.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
