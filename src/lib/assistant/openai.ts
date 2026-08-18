import { getPromptById, buildUserPrompt, GLOBAL_SYSTEM_PROMPT, Persona } from "./prompts";

/**
 * Modèle OpenAI par défaut pour l'Assistant Pédagogique.
 * Isolé dans cette constante pour une modifiabilité immédiate sans éparpiller dans les composants.
 */
export const OPENAI_ASSISTANT_MODEL = process.env.OPENAI_ASSISTANT_MODEL || "gpt-4o-mini";

export interface GenerateContentInput {
  toolId: string;
  persona: Persona;
  inputValues: Record<string, string>;
}

export interface GenerateContentResult {
  success: boolean;
  text?: string;
  toolId?: string;
  error?: string;
}

/**
 * Génère le contenu pédagogique réel en appelant l'API OpenAI Chat Completions.
 * S'exécute EXCLUSIVEMENT côté serveur.
 */
export async function generatePedagogicalContent({
  toolId,
  persona,
  inputValues,
}: GenerateContentInput): Promise<GenerateContentResult> {
  // 1. Récupération du template dans le catalogue isolée
  const template = getPromptById(toolId);
  if (!template) {
    return {
      success: false,
      error: "Outil pédagogique introuvable.",
    };
  }

  // 2. Assemblage des prompts (Système + Utilisatrice)
  const systemPrompt = `${GLOBAL_SYSTEM_PROMPT}\n\nConsignes spécifiques pour ce générateur :\n${template.systemAddition}`;
  const userPrompt = buildUserPrompt(template, inputValues);

  // 3. Vérification de la clé API OpenAI côté serveur
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "La clé API OpenAI n'est pas configurée sur le serveur.",
    };
  }

  try {
    // 4. Appel de l'API OpenAI Chat Completions avec timeout 25s
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_ASSISTANT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 1200,
      }),
      signal: AbortSignal.timeout(25000), // 25 secondes max
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      console.error("[OpenAI Assistant API] Erreur HTTP:", response.status, errJson);
      return {
        success: false,
        error: `Le service IA a rencontré un problème (${response.status}). Veuillez réessayer.`,
      };
    }

    const data = await response.json();
    const generatedText = data?.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      return {
        success: false,
        error: "Aucune réponse valide reçue de l'assistant IA. Veuillez réinterroger.",
      };
    }

    return {
      success: true,
      text: generatedText,
      toolId: template.id,
    };
  } catch (err: any) {
    console.error("[OpenAI Assistant API] Exception:", err);

    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return {
        success: false,
        error: "La connexion a été interrompue (délai dépassé). Veuillez réessayer.",
      };
    }

    return {
      success: false,
      error: "Connexion interrompue. Veuillez vérifier votre connexion et réessayez.",
    };
  }
}
