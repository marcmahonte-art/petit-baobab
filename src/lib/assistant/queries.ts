import { supabase } from "@/lib/supabaseClient";
import { Persona } from "./prompts";

// ---------------------------------------------------------------------------
// Config & Constants
// ---------------------------------------------------------------------------

export const DEFAULT_ASSISTANT_STAR_COST = 5;

/**
 * Mapping isolé pour définir des coûts en étoiles spécifiques par outil à l'avenir.
 * Si un outil n'est pas répertorié ici, il prend la valeur par défaut (5).
 */
export const TOOL_STAR_COSTS: Record<string, number> = {
  // Exemple d'override futur : "conte_traditionnel": 8,
};

export function getToolStarCost(toolId: string): number {
  return TOOL_STAR_COSTS[toolId] ?? DEFAULT_ASSISTANT_STAR_COST;
}

const PERSONA_SHORT_LABELS: Record<Persona, string> = {
  educatrice_creche: "Crèche",
  maitresse_maternelle: "Maternelle",
  directrice: "Gestion",
};

/**
 * Génère un titre court propre pour la fiche (ex: "Séquence d'éveil — Maternelle")
 */
export function buildShortTitle(toolLabel: string, persona: Persona): string {
  const shortPersona = PERSONA_SHORT_LABELS[persona] || "Édition";
  const cleanLabel = toolLabel.replace(/^(Créer|Générer|Proposer)\s+(une\s+|un\s+)?/i, "");
  const capitalized = cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1);
  return `${capitalized} — ${shortPersona}`;
}

// ---------------------------------------------------------------------------
// Types DB
// ---------------------------------------------------------------------------

export interface PedagogicalSheetRow {
  id: string;
  account_id?: string | null;
  teacher_id: string;
  title: string;
  persona: Persona;
  tool_id: string;
  category?: string | null;
  domaine_eveil?: string | null;
  input_values: Record<string, any>;
  generated_content: string;
  stars_cost: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSheetInput {
  accountId?: string | null;
  teacherId: string;
  title: string;
  persona: Persona;
  toolId: string;
  category?: string | null;
  domaineEveil?: string | null;
  inputValues: Record<string, any>;
  generatedContent: string;
  starsCost: number;
}

// ---------------------------------------------------------------------------
// Supabase Queries (Isolées pour l'Assistant Pédagogique)
// ---------------------------------------------------------------------------

/**
 * Récupère la liste des fiches pédagogiques d'un enseignant ordonnées par date décroissante
 */
export async function listSheets(teacherId?: string): Promise<{ data: PedagogicalSheetRow[]; error: string | null }> {
  try {
    let query = supabase
      .from("pedagogical_sheets")
      .select("*")
      .order("created_at", { ascending: false });

    if (teacherId) {
      query = query.eq("teacher_id", teacherId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Assistant Queries] Erreur listSheets:", error);
      return { data: [], error: error.message };
    }

    return { data: (data as PedagogicalSheetRow[]) || [], error: null };
  } catch (err: any) {
    console.error("[Assistant Queries] Exception listSheets:", err);
    return { data: [], error: err.message || "Erreur de chargement de l'historique." };
  }
}

/**
 * Insère une fiche pédagogique générée et déduit les étoiles si un accountId est fourni
 */
export async function createSheet(input: CreateSheetInput): Promise<{
  success: boolean;
  data?: PedagogicalSheetRow;
  newBalance?: number;
  error?: string;
}> {
  try {
    let newBalance: number | undefined = undefined;

    // 1. Vérification et déduction d'étoiles si un compte est spécifié
    if (input.accountId && input.starsCost > 0) {
      // Récupération du solde actuel du compte
      const { data: accData, error: accErr } = await supabase
        .from("accounts")
        .select("stars_balance")
        .eq("id", input.accountId)
        .single();

      if (accErr || !accData) {
        return { success: false, error: "Compte enseignant introuvable." };
      }

      const currentBalance = accData.stars_balance ?? 0;
      if (currentBalance < input.starsCost) {
        return {
          success: false,
          error: `Solde d'étoiles insuffisant (${currentBalance} ✦). Cette génération nécessite ${input.starsCost} ✦.`,
        };
      }

      // Tentative de déduction d'étoiles via l'RPC officielle adjust_stars
      const { data: rpcBalance, error: rpcErr } = await supabase.rpc("adjust_stars", {
        p_account_id: input.accountId,
        p_amount: -input.starsCost,
        p_reason: "pedagogical_assistant",
        p_reference_id: null,
      });

      if (rpcErr) {
        // Fallback update direct si RPC non enregistrée
        const updatedBalance = currentBalance - input.starsCost;
        const { error: updateErr } = await supabase
          .from("accounts")
          .update({ stars_balance: updatedBalance })
          .eq("id", input.accountId);

        if (updateErr) {
          return { success: false, error: "Échec du décompte des étoiles." };
        }
        newBalance = updatedBalance;
      } else {
        newBalance = Number(rpcBalance);
      }
    }

    // 2. Insertion de la fiche pédagogique
    const { data: inserted, error: insertErr } = await supabase
      .from("pedagogical_sheets")
      .insert({
        account_id: input.accountId || null,
        teacher_id: input.teacherId,
        title: input.title,
        persona: input.persona,
        tool_id: input.toolId,
        category: input.category || null,
        domaine_eveil: input.domaineEveil || null,
        input_values: input.inputValues,
        generated_content: input.generatedContent,
        stars_cost: input.starsCost,
        is_favorite: false,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("[Assistant Queries] Erreur insert pedagogical_sheets:", insertErr);
      return { success: false, error: insertErr.message, newBalance };
    }

    return { success: true, data: inserted as PedagogicalSheetRow, newBalance };
  } catch (err: any) {
    console.error("[Assistant Queries] Exception createSheet:", err);
    return { success: false, error: err.message || "Erreur d'enregistrement de la fiche." };
  }
}

/**
 * Alterne l'état favori (is_favorite) d'une fiche pédagogique
 */
export async function toggleFavorite(
  sheetId: string,
  isFavorite: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from("pedagogical_sheets")
      .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
      .eq("id", sheetId);

    if (error) {
      console.error("[Assistant Queries] Erreur toggleFavorite:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error("[Assistant Queries] Exception toggleFavorite:", err);
    return { success: false, error: err.message || "Erreur de mise à jour des favoris." };
  }
}

/**
 * Supprime une fiche pédagogique par son ID
 */
export async function deleteSheet(sheetId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from("pedagogical_sheets")
      .delete()
      .eq("id", sheetId);

    if (error) {
      console.error("[Assistant Queries] Erreur deleteSheet:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error("[Assistant Queries] Exception deleteSheet:", err);
    return { success: false, error: err.message || "Erreur lors de la suppression de la fiche." };
  }
}
