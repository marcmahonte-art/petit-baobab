"use client"

import { Star } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Aminata",
    role: "maman",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=aminata",
    text: "Mon fils adore créer ses propres livres. Les dessins sont magnifiques et éducatifs.",
  },
  {
    name: "Yacouba",
    role: "enseignant",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=yacouba",
    text: "Parfait pour mes élèves ! Les histoires et activités sont très enrichissantes.",
  },
  {
    name: "Fatou",
    role: "maman",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=fatou",
    text: "Enfin une application africaine qui valorise notre culture.",
  },
]

export default function Testimonials() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20">
      <h2 className="text-display-md font-extrabold text-[#1A1A2E] text-center mb-12">
        Ils adorent Petit Baobab
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-white rounded-2xl shadow-card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-12 h-12 rounded-full">
                <AvatarImage src={t.avatar} alt={t.name} />
                <AvatarFallback>
                  {t.name[0]}
                  {t.name[1]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-[15px] text-[#1A1A2E]">
                  {t.name}, {t.role}
                </p>
              </div>
            </div>

            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-[14px] h-[14px] fill-[#FFD95C] text-[#FFD95C]"
                />
              ))}
            </div>

            <p className="text-[14px] text-[#1A1A2E] italic leading-relaxed">
              &ldquo;{t.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
