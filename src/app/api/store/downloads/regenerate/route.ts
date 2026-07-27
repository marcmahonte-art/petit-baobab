import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentStoreUser } from "@/lib/store/auth";

const Schema = z.object({ downloadId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const user = await getCurrentStoreUser();
  const origin = new URL(request.url).origin;
  if (!user) return NextResponse.redirect(`${origin}/store`, 303);
  const parsed = Schema.safeParse(Object.fromEntries((await request.formData()).entries()));
  if (!parsed.success) return NextResponse.redirect(`${origin}/store/downloads?error=invalid`, 303);

  const supabase = getSupabaseAdmin();
  const { data: download } = await supabase
    .from("shop_downloads")
    .select("id, order_id")
    .eq("id", parsed.data.downloadId)
    .maybeSingle();
  if (download) {
    const { data: order } = await supabase
      .from("shop_orders")
      .select("id")
      .eq("id", download.order_id)
      .or(`customer_user_id.eq.${user.id},email.ilike.${user.email}`)
      .maybeSingle();
    if (order) {
      await supabase
        .from("shop_downloads")
        .update({
          token: crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "").slice(0, 8),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", download.id);
    }
  }
  return NextResponse.redirect(`${origin}/store/downloads?regenerated=1`, 303);
}
