import type { Variants } from "framer-motion"

export const GROWTH_VARIANTS: Variants = {
  hidden: { scale: 0.2, opacity: 0, filter: "brightness(0.6)" },
  grow: {
    scale: 1,
    opacity: 1,
    filter: "brightness(1)",
    transition: { type: "spring", stiffness: 120, damping: 12, duration: 1.2 },
  },
}

export const LEAF_VARIANTS: Variants = {
  hidden: { scale: 0, opacity: 0, rotate: -30 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { delay: 0.2 + i * 0.15, type: "spring", stiffness: 150, damping: 10 },
  }),
}

export const FLOWER_VARIANTS: Variants = {
  hidden: { scale: 0, rotate: -90 },
  open: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 200, damping: 8 },
  },
}

export const ANIMAL_WALK: Variants = {
  idle: { x: 0, transition: { duration: 0.4 } },
  walk: {
    x: [0, 24, -24, 0],
    transition: { repeat: Infinity, duration: 6, ease: "easeInOut" },
  },
}

export const ANIMAL_BOUNCE: Variants = {
  idle: { y: 0 },
  bounce: {
    y: [0, -6, 0],
    transition: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
  },
}

export const BIRD_FLY: Variants = {
  idle: { y: 0, x: 0 },
  fly: {
    y: [0, -20, 0],
    x: [0, 40, -20, 0],
    transition: { repeat: Infinity, duration: 12, ease: "easeInOut" },
  },
}

export const CLOUD_DRIFT: Variants = {
  idle: { x: 0 },
  drift: {
    x: [0, 120, -60, 0],
    transition: { repeat: Infinity, duration: 40, ease: "linear" },
  },
}

export const STAR_TWINKLE: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  twinkle: {
    opacity: [0.3, 1, 0.3],
    scale: [0.8, 1.1, 0.8],
    transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
  },
}

export const BUTTERFLY_FLUTTER: Variants = {
  idle: { opacity: 1, scale: 1 },
  flutter: {
    y: [0, -14, 4, -10, 0],
    x: [0, 18, -12, 20, 0],
    scale: [1, 1.1, 0.95, 1.05, 1],
    transition: { repeat: Infinity, duration: 8, ease: "easeInOut" },
  },
}

export const FIREFLY_GLOW: Variants = {
  hidden: { opacity: 0, scale: 0 },
  glow: {
    opacity: [0, 1, 0.2, 1, 0],
    scale: [0, 1, 0.8, 1, 0],
    transition: { repeat: Infinity, duration: 3.5, ease: "easeInOut" },
  },
}

export const RAIN_DROP: Variants = {
  hidden: { y: -40, opacity: 0 },
  fall: {
    y: [0, 220],
    opacity: [0, 0.8, 0],
    transition: { repeat: Infinity, duration: 0.8, ease: "linear" },
  },
}

export const UNLOCK_BURST: Variants = {
  hidden: { scale: 0, opacity: 0, rotate: -20 },
  burst: {
    scale: [0, 1.3, 1],
    opacity: [0, 1, 1],
    rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 12 },
  },
}

export const SEASON_FADE: Variants = {
  initial: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
  exit: { opacity: 0, transition: { duration: 0.5 } },
}

export const SLIDE_UP: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
}

export const WORLD_HUD_PULSE: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
  },
}
