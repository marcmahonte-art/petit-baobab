import type { Variants } from "framer-motion"

export const CARD_IN: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 14 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
}

export const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}
