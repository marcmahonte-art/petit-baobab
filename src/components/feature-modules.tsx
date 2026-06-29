import { FeatureCard } from "@/components/feature-card"

const features = [
  { title: "Coloriage", illustration: "/illustrations/lion.webp", topColor: "#C5BCFF", bottomColor: "#8067F8", imgW: 130, imgH: 130 },
  { title: "Dessin magique", illustration: "/illustrations/robot.webp", topColor: "#C6F5E7", bottomColor: "#20C997", imgW: 130, imgH: 130 },
  { title: "Livres de coloriage", illustration: "/illustrations/book.webp", topColor: "#FFE7A0", bottomColor: "#FFB300", imgW: 140, imgH: 125 },
  { title: "Jeux éducatifs", illustration: "/illustrations/puzzle.webp", topColor: "#B9DDFF", bottomColor: "#0094FF", imgW: 130, imgH: 130 },
  { title: "Histoires", illustration: "/illustrations/reading-girl.webp", topColor: "#FFC6D3", bottomColor: "#FF557E", imgW: 130, imgH: 130 },
  { title: "Activités", illustration: "/illustrations/crayons.webp", topColor: "#BFF5ED", bottomColor: "#13C6A2", imgW: 130, imgH: 130 },
]

export function FeatureModules() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-[18px]">
      {features.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </div>
  )
}
