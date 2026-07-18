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
    const { accountId, type, packId, planId, amountXof, stars, successUrl, cancelUrl } = params;
    const pack = type === "pack" ? findPack(packId || "") : undefined;
    const plan = type === "plan" ? findPlan(planId || "") : undefined;
    const label = pack?.label || plan?.name || `${stars} étoiles`;
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://petit-baobab.vercel.app";

    const customData: Record<string, string> = {
      account_id: accountId,
      type,
      stars: String(stars),
    };
    if (type === "pack" && packId) customData.pack_id = packId;
    if (type === "plan" && planId) customData.plan_id = planId;

    const body = {
      invoice: {
        total_amount: amountXof,
        description: `Achat ${type === "plan" ? "du plan" : "de"} ${label}`,
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
}
