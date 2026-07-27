import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureStoreProfile, getCurrentStoreUser } from "@/lib/store/auth";

const Schema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  phone: z.string().max(40).optional(),
  country: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  language: z.enum(["fr", "en"]).default("fr"),
  newsletterEnabled: z.string().optional(),
  whatsappEnabled: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentStoreUser();
  const origin = new URL(request.url).origin;
  if (!user) return NextResponse.redirect(`${origin}/store`, 303);
  await ensureStoreProfile(user);
  const parsed = Schema.safeParse(Object.fromEntries((await request.formData()).entries()));
  if (!parsed.success) return NextResponse.redirect(`${origin}/store/profile?error=invalid`, 303);
  await getSupabaseAdmin()
    .from("shop_customer_profiles")
    .update({
      first_name: parsed.data.firstName || null,
      last_name: parsed.data.lastName || null,
      phone: parsed.data.phone || null,
      country: parsed.data.country || null,
      city: parsed.data.city || null,
      language: parsed.data.language,
      newsletter_enabled: parsed.data.newsletterEnabled === "on",
      whatsapp_enabled: parsed.data.whatsappEnabled === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  return NextResponse.redirect(`${origin}/store/profile?saved=1`, 303);
}
