// Template email — paiement échoué / annulé.
// Fichier: src/emails/payment-failed.tsx

import type { ShopOrderRow } from "@/lib/paydunya/webhook";

const BRAND = "#7D6AF8";
const DANGER = "#FF5E83";

export function paymentFailedHtml(order: ShopOrderRow, retryUrl: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FFF9F2;font-family:'Segoe UI',Arial,sans-serif;color:#3B2416;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;padding:16px 0;">
      <span style="font-size:22px;font-weight:800;color:${BRAND};">🌳 Petit Baobab</span>
    </div>
    <div style="background:#ffffff;border-radius:16px;border:1px solid #E5E0D5;padding:28px;">
      <h1 style="font-size:20px;margin:0 0 6px;color:${DANGER};">Paiement non abouti</h1>
      <p style="font-size:13px;color:#7A6A5E;">
        Bonjour ${order.first_name}, le paiement de votre commande
        <strong>${order.order_number}</strong>
        (${order.total.toLocaleString("fr-FR")} FCFA) n'a pas pu être finalisé.
      </p>
      <p style="font-size:13px;color:#7A6A5E;">
        Aucun montant n'a été débité. Vous pouvez réessayer à tout moment :
      </p>
      <div style="text-align:center;margin:24px 0 8px;">
        <a href="${retryUrl}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:14px 32px;border-radius:999px;">
          Réessayer le paiement
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}
