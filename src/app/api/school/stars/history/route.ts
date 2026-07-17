// ============================================================
// Petit Baobab — API Historique des étoiles (Espace Enseignant)
// ============================================================
// GET /api/school/stars/history
// Retourne l'historique des transactions d'étoiles du compte école
// avec les libellés traduits, la pagination et un résumé.

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";

const REASON_LABELS: Record<string, string> = {
  generation: "Génération de dessin IA",
  book_created: "Création de livre",
  drawing_saved: "Coloriage sauvegardé",
  badge_reward: "Récompense badge",
  refund: "Remboursement automatique",
  signup_bonus: "Bonus de bienvenue",
  subscription_renewal: "Renouvellement mensuel",
  admin_grant: "Crédit administrateur",
};

export async function GET(request: Request) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const accountId = account.id;

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const offset = (page - 1) * limit;

    // 1. Transactions paginées du compte école
    let query = supabase
      .from("stars_transactions")
      .select("*", { count: "exact" })
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data: transactions, error: txError, count } = await query;

    if (txError) {
      console.error("School stars history query error:", txError);
      return NextResponse.json(
        { error: "Impossible de récupérer l'historique des étoiles." },
        { status: 500 }
      );
    }

    const txList = transactions || [];
    const total = count || 0;
    const hasMore = offset + limit < total;

    // 2. Résoudre le nom de l'élève pour chaque transaction liée à un dessin
    const referenceIds = txList
      .map((t: any) => t.reference_id)
      .filter((id: any) => !!id);

    const drawingToStudentName: Record<string, string | null> = {};
    if (referenceIds.length > 0) {
      // dessins référencés
      const { data: drawings } = await supabase
        .from("saved_drawings")
        .select("id, profile_id")
        .in("id", referenceIds);

      const profileIds = (drawings || []).map((d: any) => d.profile_id).filter(Boolean);
      const drawMap: Record<string, string> = {};
      (drawings || []).forEach((d: any) => {
        drawMap[d.id] = d.profile_id;
      });

      if (profileIds.length > 0) {
        const { data: profiles } = await supabase
          .from("child_profiles")
          .select("id, student_id, name")
          .in("id", profileIds);

        const studentIds = (profiles || []).map((p: any) => p.student_id).filter(Boolean);
        const profileMap: Record<string, { student_id: string | null; name: string }> = {};
        (profiles || []).forEach((p: any) => {
          profileMap[p.id] = { student_id: p.student_id, name: p.name };
        });

        let studentMap: Record<string, string> = {};
        if (studentIds.length > 0) {
          const { data: students } = await supabase
            .from("school_students")
            .select("id, first_name, display_name")
            .in("id", studentIds);
          (students || []).forEach((s: any) => {
            studentMap[s.id] = s.display_name || s.first_name;
          });
        }

        // Reconstruire le nom élève par transaction
        txList.forEach((t: any) => {
          const profileId = drawMap[t.reference_id];
          if (profileId && profileMap[profileId]) {
            const { student_id, name } = profileMap[profileId];
            drawingToStudentName[t.id] =
              (student_id && studentMap[student_id]) || name || null;
          } else {
            drawingToStudentName[t.id] = null;
          }
        });
      }
    }

    const formatted = txList.map((tx: any) => {
      const rawReason = tx.reason || "";
      return {
        id: tx.id,
        amount: tx.amount,
        reason: rawReason,
        reason_label: REASON_LABELS[rawReason] || rawReason,
        student_name: drawingToStudentName[tx.id] ?? null,
        reference_id: tx.reference_id || null,
        created_at: tx.created_at,
      };
    });

    // 3. Résumé : totaux débités/crédités + solde actuel
    const { data: summaryRows, error: sumErr } = await supabase
      .from("stars_transactions")
      .select("amount")
      .eq("account_id", accountId);

    let totalDebited = 0;
    let totalCredited = 0;
    if (summaryRows && !sumErr) {
      summaryRows.forEach((r: any) => {
        const amt = Number(r.amount) || 0;
        if (amt < 0) totalDebited += amt;
        else totalCredited += amt;
      });
    }

    return NextResponse.json({
      transactions: formatted,
      pagination: {
        page,
        limit,
        total,
        has_more: hasMore,
      },
      summary: {
        total_debited: totalDebited,
        total_credited: totalCredited,
        balance: account.stars_balance || 0,
      },
    });
  } catch (error: any) {
    console.error("School stars history API error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de l'historique." },
      { status: 500 }
    );
  }
}
