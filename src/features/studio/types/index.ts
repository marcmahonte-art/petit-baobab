// src/features/studio/types/index.ts

export type ProjectType =
  | 'BOOK'
  | 'COLORING_BOOK'
  | 'STORY'
  | 'COMIC'
  | 'POSTER'
  | 'WORKSHEET'
  | 'FLASHCARD'
  | 'CERTIFICATE'
  | 'INVITATION'
  | 'CARD'
  | 'SCRAPBOOK'
  | 'COLOR_BY_NUMBER'
  | 'COLOR_BY_CODE';

export interface StudioProject {
  id: string;
  child_id: string;
  title: string;
  type: ProjectType;
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  updated_at: string;
  created_at: string;
}

export interface StudioPage {
  id: string;
  project_id: string;
  page_number: number;
  json: any; // Fabric.js canvas JSON
  preview?: string;
  created_at: string;
}

export interface StudioTemplate {
  id: string;
  category: string;
  title: string;
  thumbnail?: string;
  json: any; // default blocks definition
  premium: boolean;
  created_at: string;
}

export interface StudioAsset {
  id: string;
  child_id: string;
  type: string;
  url: string;
  tags?: string[];
  created_at: string;
}
