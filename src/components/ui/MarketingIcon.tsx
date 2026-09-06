import React from "react"

interface MarketingIconProps {
  icon: string | null | undefined
  className?: string
  alt?: string
}

export function MarketingIcon({ icon, className = "h-6 w-6 object-contain inline-block", alt = "" }: MarketingIconProps) {
  if (!icon) return null

  if (icon.startsWith("/") || icon.startsWith("http") || /\.(png|svg|webp|jpg|jpeg)$/i.test(icon)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={icon} alt={alt} className={className} />
    )
  }

  return <span className={className} aria-hidden="true">{icon}</span>
}
