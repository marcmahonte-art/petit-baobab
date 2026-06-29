import Image from "next/image"
import Link from "next/link"

interface FeatureCardProps {
  title: string
  illustration: string
  topColor: string
  bottomColor: string
  href: string
  imgW?: number
  imgH?: number
}

export function FeatureCard({ title, illustration, topColor, bottomColor, href, imgW = 118, imgH = 118 }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="feature-card h-[180px] rounded-[24px] overflow-hidden flex flex-col"
    >
      <div
        className="h-[130px] flex items-end justify-center"
        style={{ backgroundColor: topColor }}
      >
        <Image
          src={illustration}
          alt={title}
          width={imgW}
          height={imgH}
          className="object-contain object-bottom"
          style={{ width: imgW, height: imgH }}
        />
      </div>
      <div
        className="h-[50px] flex items-center justify-center"
        style={{ backgroundColor: bottomColor }}
      >
        <span className="text-base font-extrabold text-white">{title}</span>
      </div>
    </Link>
  )
}
