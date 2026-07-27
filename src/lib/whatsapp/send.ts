// Envoi WhatsApp via l'API Cloud de Meta (WhatsApp Business).
// Nécessite WHATSAPP_API_KEY (token permanent) + WHATSAPP_PHONE_NUMBER_ID.
import { getAppUrl } from "@/lib/paydunya/config";
import type { ShopOrderRow } from "@/lib/paydunya/webhook";

const SUPPORT_PHONE = process.env.SHOP_SUPPORT_PHONE || "+226 XX XX XX XX";

/** Normalise un numéro au format international sans espaces ni + (attendu par Meta). */
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export async function sendWhatsAppConfirmation(
  order: ShopOrderRow
): Promise<void> {
  const token = process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn("[whatsapp] WHATSAPP_API_KEY / WHATSAPP_PHONE_NUMBER_ID manquantes — message non envoyé");
    return;
  }

  const downloadLink = `${getAppUrl()}/boutique/mes-achats?order=${order.id}&token=${order.access_token}`;

  const body = {
    messaging_product: "whatsapp",
    to: normalizePhone(order.phone),
    type: "text",
    text: {
      preview_url: true,
      body:
        `Bonjour ${order.first_name} 👋\n\n` +
        `Merci pour votre achat chez Petit Baobab 🌳\n\n` +
        `Votre commande ${order.order_number} est confirmée.\n\n` +
        `Téléchargement :\n${downloadLink}\n\n` +
        `Support : ${SUPPORT_PHONE}`,
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp API ${res.status}: ${err}`);
  }
}
