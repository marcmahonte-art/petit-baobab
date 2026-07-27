// POST /api/payment/create — crée la commande Supabase (pending) puis la
// facture PayDunya, et retourne checkout_url + transaction/invoice tokens.
// Validation Zod + montants recalculés SERVEUR (jamais confiance au client).
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createShopInvoice } from "@/lib/paydunya/checkout";
import { assertPaydunyaConfigured } from "@/lib/paydunya/config";
import { PRODUCTS } from "@/lib/mock/products";

export const runtime = "nodejs";

// --- Rate limiting simple en mémoire (par IP, 10 req / 10 min) ---
const rateBucket = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateBucket.get(ip);
  if (!entry || now > entry.resetAt) {
    rateBucket.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

const CheckoutSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(30),
  country: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  acceptTerms: z.literal(true),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1)
    .max(30),
});

export async function POST(request: NextRequest) {
  try {
    const configError = assertPaydunyaConfigured();
    if (configError) {
      console.error("[payment/create] config:", configError);
      return NextResponse.json(
        { error: "payment_not_configured", message: "Paiement momentanément indisponible." },
        { status: 503 }
      );
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "rate_limited", message: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    const json = await request.json().catch(() => null);
    const parsed = CheckoutSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const input = parsed.data;

    // --- Recalcul SERVEUR des montants depuis le catalogue ---
    const items: Array<{
      productId: string; title: string; quantity: number; unitPrice: number;
    }> = [];
    for (const line of input.items) {
      const product = PRODUCTS.find((p) => p.id === line.productId);
      if (!product) {
        return NextResponse.json(
          { error: "unknown_product", productId: line.productId },
          { status: 400 }
        );
      }
      items.push({
        productId: product.id,
        title: product.title,
        quantity: line.quantity,
        unitPrice: product.price, // prix CATALOGUE, pas celui du client
      });
    }
    const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const totalHT = Math.round(total / 1.18);

    if (total <= 0) {
      return NextResponse.json({ error: "empty_order" }, { status: 400 });
    }

    // --- Créer la commande Supabase (payment_status=pending) ---
    const supabase = getSupabaseAdmin();
    const orderNumber = `PB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const { data: order, error: insErr } = await supabase
      .from("shop_orders")
      .insert({
        order_number: orderNumber,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        country: input.country,
        city: input.city,
        items,
        total,
        total_ht: totalHT,
        payment_status: "pending",
        status: "pending",
      })
      .select("id, order_number, access_token")
      .single();

    if (insErr || !order) {
      console.error("[payment/create] insert:", insErr?.message);
      return NextResponse.json(
        { error: "order_create_failed", message: insErr?.message },
        { status: 500 }
      );
    }

    // --- Créer la facture PayDunya ---
    let invoice;
    try {
      invoice = await createShopInvoice({
        orderId: order.id,
        orderNumber: order.order_number,
        items,
        totalAmount: total,
        customerEmail: input.email,
        customerPhone: input.phone,
      });
    } catch (e) {
      // Nettoyer la commande orpheline pour permettre un retry propre
      await supabase.from("shop_orders").delete().eq("id", order.id);
      console.error("[payment/create] PayDunya:", (e as Error).message);
      return NextResponse.json(
        { error: "paydunya_failed", message: "Impossible de contacter le prestataire de paiement. Réessayez." },
        { status: 502 }
      );
    }

    // --- Lier le token facture à la commande ---
    await supabase
      .from("shop_orders")
      .update({ invoice_token: invoice.invoiceToken })
      .eq("id", order.id);

    return NextResponse.json({
      checkout_url: invoice.checkoutUrl,
      invoice_token: invoice.invoiceToken,
      transaction_id: order.id,
      order_id: order.id,
      order_number: order.order_number,
      access_token: order.access_token,
    });
  } catch (err) {
    console.error("[payment/create] fatal:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
