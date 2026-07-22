import { NextResponse } from "next/server";
import { getBillingData } from "@/lib/billing/server";
import { getServerUser } from "@/lib/auth";

// GET /api/school/billing
// Renvoie toutes les données de facturation de l'école connectée
// (plan, étoiles, paiements, transactions, factures, consommation).
export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }
  const data = await getBillingData();
  if (!data) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }
  return NextResponse.json({ success: true, ...data });
}
