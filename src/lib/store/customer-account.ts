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
    // Log non bloquant (ne casse pas le webhook même si notifications échoue)
    if (error) {
      console.error("[store-account] magic link échoué:", error.message);
    } else {
      console.info("[store-account] magic link envoyé à", email);
    }
  } catch (error) {
    console.error("[store-account] magic link après achat:", error);
  }
}
