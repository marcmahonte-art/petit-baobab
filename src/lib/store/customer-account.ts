import { sendStoreMagicLink } from "@/lib/store/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAppUrl } from "@/lib/paydunya/config";
import { normalizeEmail } from "@/lib/store/format";
import type { ShopOrderRow } from "@/lib/paydunya/webhook";

export async function triggerCustomerMagicLinkAfterPurchase(order: ShopOrderRow) {
  const email = normalizeEmail(order.email);
  const supabase = getSupabaseAdmin();

  try {
    const { data: existingProfile } = await supabase
      .from("shop_customer_profiles")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile?.user_id) {
      await supabase.from("shop_orders").update({ customer_user_id: existingProfile.user_id }).eq("id", order.id);
    }

    const { error } = await sendStoreMagicLink(email, getAppUrl());
    await supabase.from("notifications").insert({
      user_id: existingProfile?.user_id ?? null,
      channel: "email",
      title: "Lien magique espace client",
      body: error
        ? `Lien magique non envoyé à ${email}: ${error.message}`
        : `Lien magique envoyé à ${email} après la commande ${order.order_number}.`,
      status: error ? "failed" : "sent",
      metadata: { order_id: order.id, order_number: order.order_number },
    });
  } catch (error) {
    console.error("[store-account] magic link après achat:", error);
  }
}
