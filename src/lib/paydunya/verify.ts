// Vérification serveur d'une facture PayDunya (source de vérité).
// Ne JAMAIS faire confiance au body brut d'un IPN : toujours confirmer.
import { paydunyaFetch } from "./client";

export type PaydunyaInvoiceStatus =
  | "pending"
  | "completed"
  | "cancelled"
  | "failed"
  | "expired";

export interface VerifiedInvoice {
  status: PaydunyaInvoiceStatus;
  totalAmount: number;
  transactionId: string | null;
  customData: Record<string, string>;
  raw: Record<string, unknown>;
}

interface PaydunyaConfirmResponse {
  response_code?: string;
  status?: string;
  invoice?: { total_amount?: number | string };
  custom_data?: Record<string, string>;
  transaction_id?: string;
  [k: string]: unknown;
}

/** Confirme une facture auprès de PayDunya et normalise la réponse. */
export async function verifyInvoice(
  invoiceToken: string
): Promise<VerifiedInvoice> {
  const data = await paydunyaFetch<PaydunyaConfirmResponse>(
    `/checkout-invoice/confirm/${encodeURIComponent(invoiceToken)}`
  );

  const rawStatus = String(data.status || "pending").toLowerCase();
  const status: PaydunyaInvoiceStatus = (
    ["completed", "cancelled", "failed", "expired", "pending"] as const
  ).includes(rawStatus as PaydunyaInvoiceStatus)
    ? (rawStatus as PaydunyaInvoiceStatus)
    : "pending";

  return {
    status,
    totalAmount: Number(data.invoice?.total_amount || 0),
    transactionId: data.transaction_id ? String(data.transaction_id) : null,
    customData: (data.custom_data || {}) as Record<string, string>,
    raw: data as Record<string, unknown>,
  };
}
