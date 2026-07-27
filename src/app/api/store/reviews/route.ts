import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentStoreUser } from "@/lib/store/auth";

const Schema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("upsert"),
    target: z.string().min(3),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(1200).optional(),
    photos: z.string().optional(),
  }),
  z.object({ intent: z.literal("delete"), reviewId: z.string().uuid() }),
]);

export async function POST(request: NextRequest) {
  const user = await getCurrentStoreUser();
  const origin = new URL(request.url).origin;
  if (!user) return NextResponse.redirect(`${origin}/store`, 303);
  const form = Object.fromEntries((await request.formData()).entries());
  const parsed = Schema.safeParse(form);
  if (!parsed.success) return NextResponse.redirect(`${origin}/store/reviews?error=invalid`, 303);
  const supabase = getSupabaseAdmin();

  if (parsed.data.intent === "delete") {
    await supabase.from("reviews").delete().eq("id", parsed.data.reviewId).eq("user_id", user.id);
  } else {
    const [orderId, productId, ...titleParts] = parsed.data.target.split(":");
    const productTitle = titleParts.join(":");
    const { data: order } = await supabase
      .from("shop_orders")
      .select("id")
      .eq("id", orderId)
      .or(`customer_user_id.eq.${user.id},email.ilike.${user.email}`)
      .eq("payment_status", "paid")
      .maybeSingle();
    if (order) {
      await supabase.from("reviews").upsert(
        {
          user_id: user.id,
          order_id: orderId,
          product_id: productId,
          product_title: productTitle,
          rating: parsed.data.rating,
          comment: parsed.data.comment || null,
          photos: parsed.data.photos ? parsed.data.photos.split(",").map((p) => p.trim()).filter(Boolean) : [],
          status: "pending",
        },
        { onConflict: "user_id,order_id,product_id" }
      );
    }
  }
  return NextResponse.redirect(`${origin}/store/reviews`, 303);
}
