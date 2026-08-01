// src/features/adaptive-ai/types/index.ts

/** Base API response wrapper used across the Adaptive AI endpoints. */
export interface ApiResponse<T> {
  data: T | null;
  error?: {
    message: string;
    code?: string;
  };
}

/** Profil d’apprentissage dynamique d’un enfant. */
export interface ChildLearningProfile {
  id: string; // uuid
  childId: string; // uuid referencing children(id)
  estimatedAge?: number; // âge pédagogique estimé (en années)
  estimatedLevel?: string; // niveau estimé (ex: "débutant", "intermédiaire")
  preferredTopics?: string[]; // sujets favoris
  preferredStyles?: string[]; // styles d’apprentissage
  learningSpeed?: number; // vitesse d’apprentissage (0‑1)
  attentionSpan?: number; // durée moyenne d’attention en minutes
  confidenceScore?: number; // confiance en soi (0‑1)
  motivationScore?: number; // motivation (0‑1)
  lastAnalysisAt?: string; // ISO timestamp
  createdAt: string;
  updatedAt: string;
}

/** Recommandation générée par l’IA pour un enfant. */
export type RecommendationResourceType =
  | "activity"
  | "book"
  | "quiz"
  | "studio"
  | "challenge"
  | "course";

export interface LearningRecommendation {
  id: string; // uuid
  childId: string; // uuid
  type: RecommendationResourceType; // type générique
  title: string;
  description: string;
  priority: number; // 1 = haute, 5 = basse
  reason: string; // explication exploitable
  resourceType: RecommendationResourceType;
  resourceId?: string; // uuid de la ressource liée
  status: "pending" | "sent" | "accepted" | "rejected";
  createdAt: string;
}

/** Insight synthétique produit chaque nuit. */
export interface AiLearningInsight {
  id: string; // uuid
  childId: string; // uuid
  summary: string; // texte court
  strengths: Record<string, string | number>;
  difficulties: Record<string, string | number>;
  nextGoals: Record<string, string | number>;
  generatedAt: string; // ISO timestamp
}

/** Consentement parental au traitement des données par l’IA. */
export interface AiConsent {
  id: string; // uuid
  childId: string; // uuid
  parentId: string; // uuid
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Message du coach IA (texte + éventuellement image). */
export interface CoachMessage {
  id: string; // uuid
  childId: string; // uuid
  message: string; // texte bienveillant
  imageUrl?: string; // URL d’une image générée par GPT‑Image
  createdAt: string;
}

/** Payload utilisé lorsqu’on crée une recommandation via l’API. */
export interface RecommendationPayload {
  childId: string;
  type: RecommendationResourceType;
  title: string;
  description: string;
  priority?: number;
  reason: string;
  resourceType: RecommendationResourceType;
  resourceId?: string;
}

/** Payload d’insight retourné aux parents ou enseignants. */
export interface InsightPayload {
  summary: string;
  strengths: Record<string, string | number>;
  difficulties: Record<string, string | number>;
  nextGoals: Record<string, string | number>;
}
