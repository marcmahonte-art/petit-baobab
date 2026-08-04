// ============================================================
// Petit Baobab — Coach IA (Phase 10)
// Service OpenAI du coach pédagogique (côté serveur uniquement).
//
// Règles strictes :
//  - Toutes les réponses sont positives, courtes et adaptées
//    aux enfants (toujours filtrées).
//  - Aucun contenu libre : le prompt force l'intention reconnue
//    et le filtre `filterContent` bloque tout mot dangereux.
//  - En l'absence de clé API ou en cas d'erreur, un repli
//    déterministe (basé sur les vraies données) est renvoyé.
//    Le module fonctionne donc sans OpenAI mais se personnalise
//    quand la clé est présente.
// ============================================================

import {
  buildFallbackReply,
  detectIntent,
  type ChatContext,
  type CoachIntent,
} from "@/features/adaptive-ai/engine/coach-engine"
import type {
  CoachStatistics,
  LearningProfile,
  LearningSession,
} from "@/features/adaptive-ai/types/coach"

const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini"

const BLOCKED_WORDS = [
  "mort",
  "tue",
  "tuer",
  "violence",
  "arme",
  "sang",
  "peur",
  "colère",
  "haine",
  "méchant",
  "echoue",
  "échoue",
  "moche",
  "bête",
  "stupide",
  "triste",
  "dangereux",
  "horrible",
]

interface ChatMessage {
  role: "system" | "user"
  content: string
}

/** Appelle OpenAI en chat completion. Renvoie null en cas d'échec (jamais d'exception). */
async function chat(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_CHAT_MODEL,
        messages,
        temperature: 0.6,
        max_tokens: 120,
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) return null
    const data = await response.json().catch(() => null)
    const content = data?.choices?.[0]?.message?.content
    return typeof content === "string" ? content : null
  } catch {
    return null
  }
}

/**
 * Filtre de sécurité : supprime les mots interdits, force un ton positif,
 * borne la longueur. Renvoie null si le contenu devient inutilisable.
 */
export function filterContent(text: string | null | undefined): string | null {
  if (!text) return null
  let clean = text.trim().replace(/\s+/g, " ")

  for (const word of BLOCKED_WORDS) {
    const re = new RegExp(`\\b${word}\\b`, "gi")
    clean = clean.replace(re, "…")
  }

  // Supprime toute ponctuation négative / consigne de danger.
  clean = clean.replace(/!{3,}/g, "!")
  clean = clean.replace(/\*\*/g, "")
  clean = clean.replace(/[#*_~`<>]/g, "")

  if (clean.length > 280) {
    clean = clean.slice(0, 277).trimEnd() + "..."
  }
  if (clean.length < 8) return null
  return clean
}

function systemPrompt(): string {
  return `Tu es le coach pédagogique de Petit Baobab, une application pour enfants de 3 à 8 ans.
Règles absolues :
- Réponds TOUJOURS en français, en 1 à 3 phrases courtes.
- Ton TOUJOURS positif, bienveillant, encourageant. Jamais de reproche ni de négativité.
- Ne parle jamais de notes, d'échec, de comparaison avec d'autres enfants, de danger ou de peur.
- Utilise des mots simples, chaleureux, adaptés aux enfants.
- Si la question ne correspond pas à une intention pédagogique, propose simplement une activité amusante.`
}

// ---------------------------------------------------------------------------
// Dialogue du coach (Section 10)
// ---------------------------------------------------------------------------

/** Génère la réponse du coach à partir de l'intention reconnue + données réelles. */
export async function generateCoachReply(
  childMessage: string,
  context: ChatContext,
): Promise<{ reply: string; intent: CoachIntent; filtered: boolean }> {
  const intent = detectIntent(childMessage)

  const raw = await chat([
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: `L'enfant ${context.childName || "du groupe"} demande : « ${childMessage.slice(0, 120)} ».
Contexte réel : niveau ${context.level}, ${context.totalXp} XP, recommandation en cours : ${context.nextRecommendation?.title ?? "aucune"}.
Réponds de façon encourageante en restant dans le sujet.`,
    },
  ])

  const clean = filterContent(raw)
  if (!clean) {
    return { reply: buildFallbackReply(intent, context), intent, filtered: false }
  }
  return { reply: clean, intent, filtered: true }
}

// ---------------------------------------------------------------------------
// Conseils / recommandations / programme (sections 4, 5, 7)
// ---------------------------------------------------------------------------

/** Génère un conseil personnalisé supplémentaire (Section 7). */
export async function generateAdvice(
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
  sessions: LearningSession[],
): Promise<string | null> {
  const raw = await chat([
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: `Profil réel de l'enfant : créativité ${statistics?.creativity ?? 50}, lecture ${statistics?.reading ?? 50}, logique ${statistics?.logic ?? 50}, préférence ${profile?.preferred_topics?.join(", ") ?? "inconnue"}, ${sessions.length} activités récentes. Donne UN conseil d'une phrase pour l'encourager à progresser.`,
    },
  ])
  return filterContent(raw)
}

/** Génère des idées d'activités adaptées (Section 4 enrichie). */
export async function recommendActivities(
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
): Promise<string[]> {
  const raw = await chat([
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: `Profil réel : l'enfant aime ${profile?.preferred_topics?.join(", ") || "beaucoup de choses"}, niveau créativité ${statistics?.creativity ?? 50}, lecture ${statistics?.reading ?? 50}. Propose 3 activités courtes, précises et adaptées à un enfant. Liste à puces simples.`,
    },
  ])
  const clean = filterContent(raw)
  if (!clean) return []
  const items = clean
    .split(/\n|-|•/)
    .map((s) => s.replace(/^[\s*0-9.)]+/, "").trim())
    .filter((s) => s.length > 4 && s.length < 80)
  return items.slice(0, 3)
}

/** Génère le programme hebdomadaire personnalisé (Section 5). */
export async function generateWeeklyProgram(
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
): Promise<string[] | null> {
  const raw = await chat([
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: `Profil réel de l'enfant : préférences ${profile?.preferred_topics?.join(", ") ?? "variées"}, activité préférée ${profile?.preferred_activity ?? "COLORING"}, forces lecture ${statistics?.reading ?? 0}%, créativité ${statistics?.creativity ?? 0}%. Propose 4 activités pour la semaine, courtes et adaptées. Liste à puces.`,
    },
  ])
  const clean = filterContent(raw)
  if (!clean) return null
  return clean
    .split(/\n|-|•/)
    .map((s) => s.replace(/^[\s*0-9.)]+/, "").trim())
    .filter((s) => s.length > 4 && s.length < 90)
    .slice(0, 4)
}

// ---------------------------------------------------------------------------
// Rapports (parent / enseignant)
// ---------------------------------------------------------------------------

/** Génère le rapport hebdomadaire destiné au parent (exportable PDF). */
export async function generateParentReport(
  childName: string,
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
  sessions: LearningSession[],
): Promise<string> {
  const raw = await chat([
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: `Rédige un court rapport hebdomadaire positif pour le parent de ${childName || "l'enfant"} (4 à 5 phrases). Données réelles : ${sessions.length} activités, lecture ${statistics?.reading ?? 0}%, créativité ${statistics?.creativity ?? 0}%, logique ${statistics?.logic ?? 0}%. Toujours positif et concret.`,
    },
  ])
  const clean = filterContent(raw)
  if (clean) return clean
  return `Cette semaine, ${childName || "ton enfant"} a participé à ${sessions.length} activité(s). Sa lecture et sa créativité progressent, continue à l'encourager chaque jour !`
}

/** Génère le rapport destiné à l'enseignant (exportable PDF). */
export async function generateTeacherReport(
  childName: string,
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
  sessions: LearningSession[],
  classroomName?: string,
): Promise<string> {
  const raw = await chat([
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: `Rédige un bref rapport pédagogique positif pour l'enseignant de ${childName || "l'élève"} (classe ${classroomName ?? "non précisée"}). Données réelles : ${sessions.length} activités, lecture ${statistics?.reading ?? 0}%, créativité ${statistics?.creativity ?? 0}%, logique ${statistics?.logic ?? 0}%. Mets en avant les forces et une piste d'accompagnement positive.`,
    },
  ])
  const clean = filterContent(raw)
  if (clean) return clean
  return `${childName || "L'élève"} s'investit régulièrement (${sessions.length} activités). On observe de belles avancées en lecture et en créativité : encourageons ce rythme !`
}

// ---------------------------------------------------------------------------
// Analyse (Section 2 / /api/coach/analyze)
// ---------------------------------------------------------------------------

/** Analyse synthétique de l'enfant (résumé court, positif). */
export async function analyzeChild(
  childName: string,
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
): Promise<string | null> {
  const raw = await chat([
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: `Analyse en 2 phrases le profil réel de ${childName || "l'enfant"} : préférences ${profile?.preferred_topics?.join(", ") ?? "variées"}, créativité ${statistics?.creativity ?? 50}, lecture ${statistics?.reading ?? 50}, logique ${statistics?.logic ?? 50}, concentration ${statistics?.concentration ?? 50}. Toujours positif.`,
    },
  ])
  return filterContent(raw)
}
