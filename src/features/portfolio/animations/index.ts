import type { Variants } from "framer-motion"

export const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

export const FADE_IN: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

export const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const CARD_IN: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 14 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
}

export const POP_IN: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 18 } },
}

export const MODAL_OVERLAY: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const MODAL_PANEL: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 20 } },
}

export const TIMELINE_ENTRY: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
}

export const CONFETTI: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } },
}

export const BUTTON_IN: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
}
