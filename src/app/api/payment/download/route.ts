// GET /api/payment/download?token=<download_token>
// Téléchargement sécurisé : vérifie expiration (30 j) + compteur (20 max),
// incrémente le compteur puis redirige vers une Signed URL Supabase (10 min).
// Les PDF ne sont JAMAIS publics.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const QuerySchema = z.object({ token: z.string().min(20).max(80) });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({ token: searchParams.get("token") });
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: dl } = await supabase
      .from("shop_downloads")
      .select("id, order_id, file_path, expires_at, max_downloads, download_count")
      .eq("token", parsed.data.token)
      .maybeSingle();

    if (!dl) {
      return NextResponse.json({ error: "not_found", message: "Lien de téléchargement invalide." }, { status: 404 });
    }

    if (new Date(dl.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "expired", message: "Ce lien a expiré (30 jours). Contactez le support." },
        { status: 410 }
      );
    }

    if (dl.download_count >= dl.max_downloads) {
      return NextResponse.json(
        { error: "quota_exceeded", message: "Nombre maximum de téléchargements atteint (20)." },
        { status: 429 }
      );
    }

    // La commande liée doit être payée
    const { data: order } = await supabase
      .from("shop_orders")
      .select("payment_status")
      .eq("id", dl.order_id)
      .single();
    if (order?.payment_status !== "paid") {
      return NextResponse.json(
        { error: "not_paid", message: "Téléchargement disponible après confirmation du paiement." },
        { status: 403 }
      );
    }

    // Incrément atomique du compteur AVANT de délivrer l'URL
    const { error: updErr } = await supabase
      .from("shop_downloads")
      .update({ download_count: dl.download_count + 1 })
      .eq("id", dl.id)
      .eq("download_count", dl.download_count); // optimistic lock anti-course

    if (updErr) {
      console.error("[payment/download] compteur:", updErr.message);
    }

    // Signed URL — 10 minutes
    const { data: signed, error: signErr } = await supabase.storage
      .from("shop-files")
      .createSignedUrl(dl.file_path, 600);

    if (signErr || !signed?.signedUrl) {
      console.error("[payment/download] signed url:", signErr?.message);
      return NextResponse.json(
        { error: "file_unavailable", message: "Fichier momentanément indisponible. Contactez le support." },
        { status: 502 }
      );
    }

    return NextResponse.redirect(signed.signedUrl, 302);
  } catch (err) {
    console.error("[payment/download] fatal:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
