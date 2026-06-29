export interface ArtPath {
  id: string
  name: string
  d: string
  strokeWidth: number
  stroke: string
  fill: string
  zIndex: number
}

// Coordinate space: 800 x 500
export const savaneArtPaths: ArtPath[] = [
  // --- BACKGROUND / NATURE ---
  // Ground
  {
    id: "ground",
    name: "Sol de la Savane",
    d: "M 0 450 Q 200 420 400 450 T 800 430 L 800 500 L 0 500 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 1,
  },
  // Sun
  {
    id: "sun-center",
    name: "Soleil - Centre",
    d: "M 150 120 A 35 35 0 1 1 149.9 120 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 2,
  },
  {
    id: "sun-rays",
    name: "Soleil - Rayons",
    d: "M 150 70 L 150 50 M 150 170 L 150 190 M 100 120 L 80 120 M 200 120 L 220 120 M 115 85 L 100 70 M 185 155 L 200 170 M 115 155 L 100 170 M 185 85 L 200 70",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "none",
    zIndex: 2,
  },
  // Cloud Left
  {
    id: "cloud-left",
    name: "Nuage Gauche",
    d: "M 320 80 C 310 80 300 90 300 100 C 290 100 280 110 280 125 C 280 140 295 150 310 150 L 390 150 C 405 150 420 140 420 125 C 420 112 410 102 398 100 C 395 88 382 80 370 80 C 362 80 355 84 350 90 C 342 84 332 80 320 80 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 3,
  },
  // Cloud Right
  {
    id: "cloud-right",
    name: "Nuage Droite",
    d: "M 620 60 C 610 60 600 70 600 80 C 590 80 580 90 580 105 C 580 120 595 130 610 130 L 690 130 C 705 130 720 120 720 105 C 720 92 710 82 698 80 C 695 68 682 60 670 60 C 662 60 655 64 650 70 C 642 64 632 60 620 60 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 3,
  },

  // --- ACACIA TREE ---
  // Trunk
  {
    id: "tree-trunk",
    name: "Tronc d'acacia",
    d: "M 660 440 C 660 380 640 350 630 320 L 645 320 C 655 350 675 370 680 435 Z M 680 435 C 685 375 710 350 725 320 L 740 325 C 725 360 700 385 695 440 Z M 670 440 L 685 440 L 685 450 L 670 450 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 4,
  },
  // Foliage
  {
    id: "tree-foliage-left",
    name: "Feuillage Gauche",
    d: "M 620 320 C 590 320 580 300 580 290 C 580 275 600 270 615 270 C 625 250 655 250 665 270 C 680 270 690 280 690 295 C 690 310 670 320 650 320 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 5,
  },
  {
    id: "tree-foliage-right",
    name: "Feuillage Droit",
    d: "M 710 325 C 690 325 680 310 680 300 C 680 285 700 280 715 280 C 725 260 755 260 765 280 C 780 280 790 290 790 305 C 790 320 770 325 750 325 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 5,
  },

  // --- ELEPHANT ---
  // Rear Leg
  {
    id: "ele-leg-back-left",
    name: "Patte Arrière Gauche",
    d: "M 320 360 L 320 440 C 320 445 330 450 345 450 C 360 450 360 440 360 440 L 360 360 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 6,
  },
  // Front Left Leg (Behind)
  {
    id: "ele-leg-front-left",
    name: "Patte Avant Gauche",
    d: "M 480 360 L 480 440 C 480 445 490 450 505 450 C 520 450 520 440 520 440 L 520 360 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 6,
  },
  // Body (incorporates tail)
  {
    id: "ele-body",
    name: "Corps de l'éléphant",
    d: "M 320 370 C 270 370 260 310 260 270 C 260 210 320 180 380 180 C 480 180 500 240 510 270 C 520 300 510 370 480 370 C 470 370 440 365 400 365 C 360 365 330 370 320 370 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 7,
  },
  // Tail
  {
    id: "ele-tail",
    name: "Queue de l'éléphant",
    d: "M 270 260 C 250 270 240 290 240 310 C 240 315 245 315 248 310 C 248 295 255 280 270 270 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 8,
  },
  // Rear Right Leg (In front)
  {
    id: "ele-leg-back-right",
    name: "Patte Arrière Droite",
    d: "M 350 365 L 350 445 C 350 450 360 455 375 455 C 390 455 390 445 390 445 L 390 365 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 9,
  },
  // Front Right Leg (In front)
  {
    id: "ele-leg-front-right",
    name: "Patte Avant Droite",
    d: "M 440 365 L 440 445 C 440 450 450 455 465 455 C 480 455 480 445 480 445 L 480 365 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 9,
  },
  // Head
  {
    id: "ele-head",
    name: "Tête de l'éléphant",
    d: "M 480 230 C 470 200 510 180 540 180 C 570 180 590 200 590 240 C 590 260 575 290 560 300 C 530 310 490 270 480 230 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 10,
  },
  // Ear
  {
    id: "ele-ear",
    name: "Oreille de l'éléphant",
    d: "M 480 200 C 420 190 410 260 430 290 C 450 310 480 300 480 280 C 480 250 490 220 480 200 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 11,
  },
  // Trunk
  {
    id: "ele-trunk",
    name: "Trompe de l'éléphant",
    d: "M 570 240 C 590 250 630 260 640 290 C 645 305 635 315 625 315 C 610 315 600 300 590 290 C 580 280 565 265 560 260 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#FFFFFF",
    zIndex: 12,
  },
  // Eye
  {
    id: "ele-eye",
    name: "Œil de l'éléphant",
    d: "M 550 220 A 4 4 0 1 1 549.9 220 Z",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "#3B2416",
    zIndex: 13,
  },

  // --- NATURE DETAILS ---
  // Grass Blades Left
  {
    id: "grass-left",
    name: "Touffe d'herbe Gauche",
    d: "M 60 450 Q 50 410 30 400 Q 55 420 60 450 M 60 450 Q 70 400 80 390 Q 75 420 60 450 M 60 450 Q 80 420 100 415 Q 85 435 60 450",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "none",
    zIndex: 14,
  },
  // Grass Blades Right
  {
    id: "grass-right",
    name: "Touffe d'herbe Droite",
    d: "M 560 460 Q 550 430 530 420 Q 555 440 560 460 M 560 460 Q 570 420 580 410 Q 575 440 560 460 M 560 460 Q 580 435 600 430 Q 585 450 560 460",
    strokeWidth: 4,
    stroke: "#3B2416",
    fill: "none",
    zIndex: 14,
  },
]
