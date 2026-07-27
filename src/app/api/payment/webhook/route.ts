// POST /api/payment/webhook — IPN PayDunya boutique.
// Vérifie TOUJOURS le statut auprès de PayDunya (verifyInvoice) : le hash
// éventuel du body n'est jamais considéré comme suffisant. Idempotent.
import { NextRequest, NextResponse } from "next/server";
import { processShopWebhook } from "@/lib/paydunya/webhook";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // PayDunya envoie l'IPN en form-data (clés aplaties "data[...]" ou JSON)
    let invoiceToken: string | null = null;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      invoiceToken =
        body?.invoice_token ||
        body?.data?.invoice?.token ||
        body?.invoice?.token ||
        null;
    } else {
      const formData = await request.formData();
      const flat = Object.fromEntries(formData.entries()) as Record<string, string>;
      invoiceToken =
        flat["invoice_token"] ||
        flat["data[invoice][token]"] ||
        flat["token"] ||
        null;
    }

    if (!invoiceToken) {
      console.warn("[payment/webhook] IPN sans invoice_token");
      return NextResponse.json({ error: "missing_invoice_token" }, { status: 400 });
    }

    // La "signature" de l'IPN est vérifiée de la façon la plus sûre possible :
    // on ignore le contenu du body et on redemande le statut à l'API PayDunya
    // authentifiée par nos clés privées (master/private/token).
    const result = await processShopWebhook(invoiceToken);

    if (!result.ok) {
      // On répond 200 pour les cas métier connus afin d'éviter les retries
      // infinis de PayDunya, sauf erreur interne réelle.
      if (result.error === "order_not_found" || result.error === "amount_mismatch") {
        return NextResponse.json(result);
      }
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[payment/webhook] fatal:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
