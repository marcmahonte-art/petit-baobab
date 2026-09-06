export type MemoryBookElementType =
  | 'text'
  | 'photo'
  | 'choice'
  | 'drawing'
  | 'sticker'
  | 'decorative';

export interface PhotoElementData {
  url?: string;
  storagePath?: string;
  zoom: number;       // 1 = normal, 1 to 3
  offsetX: number;    // % or px offset
  offsetY: number;    // % or px offset
  caption?: string;
  placeholderText?: string;
}

export interface TextElementData {
  value: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  minRows?: number;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  prefixIcon?: string;
  fontStyle?: 'normal' | 'handwriting';
}

export interface ChoiceElementData {
  options: {
    id: string;
    label: string;
    icon?: string;
    emoji?: string;
  }[];
  selectedId?: string;
}

export interface DrawingElementData {
  drawingDataUrl?: string;
  vectorJson?: string;
  disabledInV1?: boolean;
}

export interface MemoryBookElement {
  id: string;
  type: MemoryBookElementType;
  title?: string;
  subtitle?: string;
  badge?: string;
  // Positionnement relatif en pourcentage (%) pour un redimensionnement vectoriel/responsive parfait
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  photoData?: PhotoElementData;
  textData?: TextElementData;
  choiceData?: ChoiceElementData;
  drawingData?: DrawingElementData;
  customClass?: string;
}

export interface MemoryBookPage {
  id: string;
  pageNumber: number;
  title: string;
  subtitle?: string;
  categoryTag?: string;
  headerIcon?: string;
  headerIllustration?: string;
  backgroundTheme?: 'warm-cream' | 'mint-pastel' | 'lavender-light' | 'sunny-yellow' | 'coral-soft';
  elements: MemoryBookElement[];
}

export interface MemoryBookTemplate {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverBadge: string;
  icon: string;
  previewThumbnail: string;
  totalDefaultPages: number;
  pages: MemoryBookPage[];
}

export type MemoryBookStatus = 'draft' | 'in_progress' | 'completed';

export interface MemoryBookRecord {
  id: string;
  profile_id: string;
  template_id: string;
  title: string;
  school_year: string;
  theme?: string;
  status: MemoryBookStatus;
  cover_color?: string;
  pages_data: MemoryBookPage[];
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}
