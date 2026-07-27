import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendStoreMagicLink } from "@/lib/store/auth";

const Schema = z.object({ email: z.string().email().max(180) });

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const parsed = Schema.safeParse({ email: form.get("email") });
  const origin = new URL(request.url).origin;
  if (!parsed.success) return NextResponse.redirect(`${origin}/store?error=email`, 303);
  await sendStoreMagicLink(parsed.data.email, origin);
  return NextResponse.redirect(`${origin}/store?magic=sent`, 303);
}
