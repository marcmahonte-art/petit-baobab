// Envoi d'emails boutique via Resend.
import { Resend } from "resend";
import { orderConfirmationHtml } from "@/emails/order-confirmation";
import { paymentFailedHtml } from "@/emails/payment-failed";
import { welcomeHtml } from "@/emails/welcome";
import { getAppUrl } from "@/lib/paydunya/config";
import type { ShopOrderRow } from "@/lib/paydunya/webhook";

const FROM = process.env.SHOP_EMAIL_FROM || "Petit Baobab <onboarding@resend.dev>";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[emails] RESEND_API_KEY manquante — email non envoyé");
    return null;
  }
  return new Resend(key);
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenue chez Petit Baobab 🌳",
    html: welcomeHtml(email, name),
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendOrderConfirmationEmail(
  order: ShopOrderRow,
  invoiceUrl: string | null
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const downloadUrl = `${getAppUrl()}/boutique/mes-achats?order=${order.id}&token=${order.access_token}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Merci pour votre achat ! Commande ${order.order_number} — Petit Baobab`,
    html: orderConfirmationHtml(order, downloadUrl, invoiceUrl),
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendPaymentFailedEmail(order: ShopOrderRow): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const retryUrl = `${getAppUrl()}/boutique/panier`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Paiement non abouti — Commande ${order.order_number}`,
    html: paymentFailedHtml(order, retryUrl),
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
