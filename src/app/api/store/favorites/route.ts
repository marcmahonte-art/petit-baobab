import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentStoreUser } from "@/lib/store/auth";

const Schema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("add"),
    productId: z.string().min(1),
    productTitle: z.string().min(1),
    productPrice: z.coerce.number().optional(),
  }),
  z.object({ intent: z.literal("delete"), productId: z.string().min(1) }),
]);

export async function POST(request: NextRequest) {
  const user = await getCurrentStoreUser();
  const origin = new URL(request.url).origin;
  if (!user) return NextResponse.redirect(`${origin}/store`, 303);
  const form = Object.fromEntries((await request.formData()).entries());
  const parsed = Schema.safeParse(form);
  if (!parsed.success) return NextResponse.redirect(`${origin}/store/favorites?error=invalid`, 303);
  const supabase = getSupabaseAdmin();

  if (parsed.data.intent === "delete") {
    await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", parsed.data.productId);
  } else {
    await supabase.from("wishlists").upsert(
      {
        user_id: user.id,
        product_id: parsed.data.productId,
        product_title: parsed.data.productTitle,
        product_price: parsed.data.productPrice ?? null,
      },
      { onConflict: "user_id,product_id" }
    );
  }
  return NextResponse.redirect(`${origin}/store/favorites`, 303);
}
