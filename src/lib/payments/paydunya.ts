import { PaymentProvider, PaymentCheckoutParams, PaymentCheckoutResult, findPack } from "./types";

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

export class PayDunyaProvider implements PaymentProvider {
  async createCheckout(params: PaymentCheckoutParams): Promise<PaymentCheckoutResult> {
    const { accountId, packId, amountXof, stars, successUrl, cancelUrl } = params;
    const pack = findPack(packId);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://petit-baobab.vercel.app";

    const body = {
      invoice: {
        total_amount: amountXof,
        description: `Achat de ${stars} étoiles - ${pack?.label || packId}`,
        items: {
          item_0: {
            name: pack?.label || `${stars} étoiles`,
            quantity: 1,
            unit_price: String(amountXof),
            total_price: String(amountXof),
          },
        },
      },
      store: {
        name: "Petit Baobab",
      },
      custom_data: {
        account_id: accountId,
        pack_id: packId,
        stars: String(stars),
      },
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
}
