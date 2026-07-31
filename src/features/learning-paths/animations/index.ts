import type { Variants } from "framer-motion"

export const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export const CARD_IN: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
}

export const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export const TIMELINE_STEP: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

export const LESSON_PULSE: Variants = {
  idle: { scale: 1 },
  pulse: { scale: [1, 1.08, 1], transition: { duration: 1.6, repeat: Infinity, repeatType: "mirror" } },
}

export const PROGRESS_BAR: Variants = {
  hidden: { width: 0 },
  visible: (target: number) => ({ width: `${target}%`, transition: { duration: 0.8, ease: "easeOut" } }),
}

export const REWARD_POP: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 18 } },
  exit: { opacity: 0, scale: 0.7, transition: { duration: 0.2 } },
}

export const MODAL_OVERLAY: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const MODAL_PANEL: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 20 } },
  exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
}

export const CONFETTI: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.5 },
  visible: (i: number) => ({
    opacity: [0, 1, 1, 0],
    y: [0, 40 + i * 8],
    x: [0, (i % 2 === 0 ? 1 : -1) * (20 + (i % 5) * 12)],
    scale: 1,
    transition: { duration: 1.4 + (i % 3) * 0.4, repeat: Infinity, delay: i * 0.08 },
  }),
}

export const TIMELINE_ENTRY: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}
