export type MemoryBookElementType =
  | 'text'
  | 'photo'
  | 'choice'
  | 'drawing'
  | 'sticker'
  | 'decorative';

export interface PhotoTransform {
  scale: number;
  rotation: number;
  x: number;
  y: number;
}

export interface PhotoElementData {
  url?: string;
  storagePath?: string;
  zoom: number;       // 1 = normal, 0.8 à 1.8
  offsetX: number;    // % or px offset
  offsetY: number;    // % or px offset
  rotation?: number;  // 0, 90, 180, 270 ou rotation fine
  transform?: PhotoTransform;
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
  templateId?: string;
  title: string;
  subtitle?: string;
  categoryTag?: string;
  headerIcon?: string;
  headerIllustration?: string;
  backgroundTheme?: 'warm-cream' | 'mint-pastel' | 'lavender-light' | 'sunny-yellow' | 'coral-soft';
  status?: 'empty' | 'draft' | 'complete';
  data?: Record<string, any>;
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

export interface ChildData {
  id?: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  age?: string | number;
  height?: string | number;
  favoriteColor?: string;
  favoriteFood?: string;
  favoriteAnimal?: string;
  futureDream?: string;
  likes?: string;
  dislikes?: string;
  photoUrl?: string;
  photoTransform?: PhotoTransform;
}

export interface MemoryBookTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    paper: string;
    text: string;
  };
}

export interface MemoryBookRecord {
  id: string;
  profile_id: string;
  template_id: string;
  title: string;
  school_year: string;
  theme?: string;
  themeId?: string;
  status: MemoryBookStatus;
  cover_color?: string;
  current_page?: number;
  child_data?: ChildData;
  pages_data: MemoryBookPage[];
  answers_data?: Record<string, string>;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}
