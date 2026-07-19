import { PayDunyaCheckoutParams, PaymentCheckoutResult } from "./types";

const MODE = process.env.PAYDUNYA_MODE === "live" ? "live" : "test";

const BASE_URL =
  MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY || "",
    "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY || "",
    "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN || "",
  };
}

/**
 * Crée une facture PayDunya et renvoie l'URL de paiement.
 * Fonctionne aussi bien pour un pack d'étoiles (packId) que pour
 * un plan (planId). Le webhook déduit le type à partir de la
 * présence de planId dans custom_data.
 */
export async function createCheckout(
  params: PayDunyaCheckoutParams
): Promise<PaymentCheckoutResult> {
  const { accountId, packId, planId, amountXof, stars, label, successUrl, cancelUrl } = params;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://petit-baobab.vercel.app";

  const customData: Record<string, string> = {
    account_id: accountId,
    stars: String(stars),
  };
  if (packId) customData.pack_id = packId;
  if (planId) customData.plan_id = planId;

  const body = {
    invoice: {
      total_amount: amountXof,
      description: `Achat ${label}`,
      items: {
        item_0: {
          name: label,
          quantity: 1,
          unit_price: String(amountXof),
          total_price: String(amountXof),
        },
      },
    },
    store: {
      name: "Petit Baobab",
    },
    custom_data: customData,
    actions: {
      callback_url: `${origin}/api/billing/webhook/paydunya`,
      return_url: successUrl,
      cancel_url: cancelUrl,
    },
  };

  const res = await fetch(`${BASE_URL}/checkout-invoice/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.response_code !== "00") {
    throw new Error(`PayDunya error: ${data.response_text || data.description}`);
  }

  return { checkoutUrl: data.response_text };
}
