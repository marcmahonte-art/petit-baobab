// ============================================================
// Petit Baobab — Mascottes centralisées
// ============================================================

export const MASCOT_IDS = [
  "bobo",
  "kaya",
  "zuri",
  "momo",
  "kiki",
  "baobab",
] as const

export type MascotId = (typeof MASCOT_IDS)[number]

export const MASCOT_IMAGES: Record<MascotId, string> = {
  bobo: "/illustrations/mascots/bobo-lion.png",
  kaya: "/illustrations/mascots/kaya-elephant.png",
  zuri: "/illustrations/mascots/zuri-girafe.png",
  momo: "/illustrations/mascots/momo-singe.png",
  kiki: "/illustrations/mascots/kiki-perroquet.png",
  baobab: "/illustrations/mascots/baobab-guide.png",
}

export const MASCOT_LABELS: Record<MascotId, string> = {
  bobo: "Bôbô le Lion",
  kaya: "Kaya l'Éléphant",
  zuri: "Zuri la Girafe",
  momo: "Momo le Singe",
  kiki: "Kiki le Perroquet",
  baobab: "Petit Baobab",
}

export const DEFAULT_MASCOT: MascotId = "baobab"

export function getMascotImage(id: string | null | undefined): string {
  if (id && id in MASCOT_IMAGES) return MASCOT_IMAGES[id as MascotId]
  return MASCOT_IMAGES[DEFAULT_MASCOT]
}
