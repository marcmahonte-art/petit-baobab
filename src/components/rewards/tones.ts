import type { BadgeTone } from "@/lib/rewards/mock-rewards";

// Mapping ton -> classes Tailwind, calqué sur le RewardsCard existant
// (pastel + bordure claire + icône colorée).
export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  amber: "bg-[#FFF5CC] text-amber-500 border-amber-200",
  emerald: "bg-[#E2F7EE] text-emerald-500 border-emerald-200",
  purple: "bg-[#EBE8FF] text-purple-500 border-purple-200",
  blue: "bg-[#E3F2FD] text-blue-500 border-blue-200",
  pink: "bg-[#FFE6EF] text-pink-500 border-pink-200",
  orange: "bg-[#FFF0E0] text-orange-500 border-orange-200",
};

export function toneClass(tone: BadgeTone): string {
  return BADGE_TONE_CLASSES[tone] ?? BADGE_TONE_CLASSES.amber;
}
