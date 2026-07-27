// Templates d'emails boutique (HTML strings — rendus côté serveur).
// Fichier: src/emails/order-confirmation.tsx

import type { ShopOrderRow } from "@/lib/paydunya/webhook";

const BRAND = "#7D6AF8";
const DARK = "#3B2416";
const BG = "#FFF9F2";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Arial,sans-serif;color:${DARK};">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;padding:16px 0;">
      <span style="font-size:22px;font-weight:800;color:${BRAND};">🌳 Petit Baobab</span>
    </div>
    <div style="background:#ffffff;border-radius:16px;border:1px solid #E5E0D5;padding:28px;">
      ${content}
    </div>
    <p style="text-align:center;font-size:11px;color:#9b8a7d;margin-top:16px;">
      Petit Baobab — Éveillez la créativité de vos enfants.<br>
      Besoin d'aide ? Répondez simplement à cet email.
    </p>
  </div>
</body>
</html>`;
}

function itemsTable(order: ShopOrderRow): string {
  const rows = order.items
    .map(
      (it) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0E7DA;font-size:13px;">${it.title} × ${it.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #F0E7DA;font-size:13px;text-align:right;font-weight:700;">${(
          it.unitPrice * it.quantity
        ).toLocaleString("fr-FR")} FCFA</td>
      </tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0;">${rows}
    <tr><td style="padding:12px 0;font-size:15px;font-weight:800;">Total</td>
    <td style="padding:12px 0;font-size:15px;font-weight:800;text-align:right;color:${BRAND};">${order.total.toLocaleString("fr-FR")} FCFA</td></tr>
  </table>`;
}

export function orderConfirmationHtml(
  order: ShopOrderRow,
  downloadUrl: string,
  invoiceUrl: string | null
): string {
  return layout(`
    <h1 style="font-size:20px;margin:0 0 6px;">Merci pour votre achat, ${order.first_name} ! 🎉</h1>
    <p style="font-size:13px;color:#7A6A5E;margin:0 0 18px;">
      Votre paiement a bien été reçu. Voici le récapitulatif de votre commande.
    </p>
    <p style="font-size:13px;margin:0 0 4px;"><strong>Commande :</strong> ${order.order_number}</p>
    ${order.invoice_number ? `<p style="font-size:13px;margin:0 0 4px;"><strong>Facture :</strong> ${order.invoice_number}</p>` : ""}
    ${itemsTable(order)}
    <div style="text-align:center;margin:24px 0 8px;">
      <a href="${downloadUrl}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:14px 32px;border-radius:999px;">
        📥 Télécharger mes produits
      </a>
    </div>
    <p style="font-size:11px;color:#9b8a7d;text-align:center;margin:8px 0 0;">
      Lien valable 30 jours — 20 téléchargements maximum.
    </p>
    ${
      invoiceUrl
        ? `<p style="font-size:12px;text-align:center;margin-top:16px;"><a href="${invoiceUrl}" style="color:${BRAND};">Télécharger ma facture PDF</a></p>`
        : ""
    }
  `);
}
