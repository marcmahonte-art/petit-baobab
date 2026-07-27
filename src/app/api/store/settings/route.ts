import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureStoreProfile, getCurrentStoreUser } from "@/lib/store/auth";

export async function POST(request: NextRequest) {
  const user = await getCurrentStoreUser();
  const origin = new URL(request.url).origin;
  if (!user) return NextResponse.redirect(`${origin}/store`, 303);
  await ensureStoreProfile(user);
  const form = await request.formData();
  await getSupabaseAdmin()
    .from("shop_customer_profiles")
    .update({
      email_notifications: form.get("emailNotifications") === "on",
      whatsapp_notifications: form.get("whatsappNotifications") === "on",
      download_notifications: form.get("downloadNotifications") === "on",
      privacy_analytics: form.get("privacyAnalytics") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  return NextResponse.redirect(`${origin}/store/settings?saved=1`, 303);
}
