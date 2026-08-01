// src/features/studio/types/blocks.ts

/**
 * Types de blocs utilisables dans l'éditeur du Studio.
 * Chaque bloc possède un `id` unique et un `type` qui détermine sa forme de données.
 */
export type BlockType =
  | "TEXT"
  | "IMAGE"
  | "COLORING"
  | "AI"
  | "STICKER"
  | "SHAPE"
  | "QR_CODE"
  | "AUDIO"
  | "PUZZLE"
  | "ALPHABET";

/** Bloc texte */
export interface TextBlock {
  id: string;
  type: "TEXT";
  content: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  /** Position sur le canvas (Fabric.js) */
  left: number;
  top: number;
}

/** Bloc image */
export interface ImageBlock {
  id: string;
  type: "IMAGE";
  src: string; // URL de l'image
  width?: number;
  height?: number;
  left: number;
  top: number;
}

/** Bloc coloriage (dessin à colorier) */
export interface ColoringBlock {
  id: string;
  type: "COLORING";
  lineArtSvg: string; // SVG du dessin à colorier
  left: number;
  top: number;
}

/** Bloc IA – génération de texte ou d'illustration */
export interface AIBlock {
  id: string;
  type: "AI";
  prompt: string; // texte fourni par l'enfant
  generatedContent?: string; // texte ou URL de l'image générée
  left: number;
  top: number;
}

/** Bloc autocollant */
export interface StickerBlock {
  id: string;
  type: "STICKER";
  assetId: string; // référence à un StudioAsset
  left: number;
  top: number;
}

/** Bloc forme géométrique */
export interface ShapeBlock {
  id: string;
  type: "SHAPE";
  shape: "rectangle" | "circle" | "triangle" | "star";
  fill?: string;
  stroke?: string;
  left: number;
  top: number;
}

/** Bloc QR Code */
export interface QRCodeBlock {
  id: string;
  type: "QR_CODE";
  data: string; // texte/URL encodé
  size?: number;
  left: number;
  top: number;
}

/** Bloc audio */
export interface AudioBlock {
  id: string;
  type: "AUDIO";
  src: string; // URL du fichier audio
  left: number;
  top: number;
}

/** Bloc puzzle (image découpée) */
export interface PuzzleBlock {
  id: string;
  type: "PUZZLE";
  src: string; // image source du puzzle
  pieces: number; // nombre de pièces
  left: number;
  top: number;
}

/** Bloc alphabet (lettres à placer) */
export interface AlphabetBlock {
  id: string;
  type: "ALPHABET";
  letters: string[]; // lettres à afficher
  left: number;
  top: number;
}

/** Union de tous les blocs */
export type StudioBlock =
  | TextBlock
  | ImageBlock
  | ColoringBlock
  | AIBlock
  | StickerBlock
  | ShapeBlock
  | QRCodeBlock
  | AudioBlock
  | PuzzleBlock
  | AlphabetBlock;
