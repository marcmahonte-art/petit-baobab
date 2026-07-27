// Création de facture de paiement PayDunya pour la boutique.
// Doc: https://paydunya.com/developers — endpoint /checkout-invoice/create
import { paydunyaFetch } from "./client";
import { getAppUrl } from "./config";

export interface ShopCheckoutItem {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number; // FCFA, validé côté serveur
}

export interface CreateShopInvoiceParams {
  orderId: string;
  orderNumber: string;
  items: ShopCheckoutItem[];
  totalAmount: number; // FCFA — TOUJOURS recalculé serveur
  customerEmail: string;
  customerPhone: string;
}

export interface ShopInvoiceResult {
  checkoutUrl: string;
  invoiceToken: string;
}

interface PaydunyaCreateResponse {
  response_code: string;
  response_text: string;
  description?: string;
  token?: string;
}

/**
 * Crée une facture PayDunya et retourne l'URL de paiement + le token.
 * PayDunya gère Orange Money, Moov Money et carte bancaire sur sa page.
 */
export async function createShopInvoice(
  params: CreateShopInvoiceParams
): Promise<ShopInvoiceResult> {
  const origin = getAppUrl();

  const items: Record<string, unknown> = {};
  params.items.forEach((item, i) => {
    items[`item_${i}`] = {
      name: item.title,
      quantity: item.quantity,
      unit_price: String(item.unitPrice),
      total_price: String(item.unitPrice * item.quantity),
    };
  });

  const body = {
    invoice: {
      total_amount: params.totalAmount,
      description: `Commande ${params.orderNumber} — Boutique Petit Baobab`,
      items,
    },
    store: {
      name: "Petit Baobab — Boutique",
      website_url: origin,
    },
    custom_data: {
      kind: "shop_order", // distingue des paiements d'abonnement existants
      order_id: params.orderId,
      order_number: params.orderNumber,
    },
    actions: {
      callback_url: `${origin}/api/payment/webhook`,
      return_url: `${origin}/boutique/merci?order=${params.orderId}`,
      cancel_url: `${origin}/boutique/paiement-echoue?order=${params.orderId}`,
    },
  };

  const data = await paydunyaFetch<PaydunyaCreateResponse>(
    "/checkout-invoice/create",
    { method: "POST", body: JSON.stringify(body) }
  );

  if (data.response_code !== "00" || !data.token) {
    throw new Error(
      `PayDunya create refusé: ${data.response_text || data.description || "inconnu"}`
    );
  }

  return {
    checkoutUrl: data.response_text, // PayDunya renvoie l'URL dans response_text
    invoiceToken: data.token,
  };
}
