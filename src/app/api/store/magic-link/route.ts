import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendStoreMagicLink } from "@/lib/store/auth";

const Schema = z.object({ email: z.string().email().max(180) });

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin;

  // Accepter form-data OU JSON (le fetch côté client peut envoyer l'un ou l'autre)
  let emailValue: unknown = null;
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const json = await request.json().catch(() => ({}));
      emailValue = json?.email;
    } else {
      const form = await request.formData();
      emailValue = form.get("email");
    }
  } catch {
    return NextResponse.redirect(`${origin}/store?error=email`, 303);
  }

  const parsed = Schema.safeParse({ email: emailValue });
  if (!parsed.success) {
    return NextResponse.redirect(`${origin}/store?error=email`, 303);
  }

  try {
    const { error } = await sendStoreMagicLink(parsed.data.email, origin);
    if (error) {
      console.error("[store/magic-link]", error.message);
      return NextResponse.redirect(`${origin}/store?error=email`, 303);
    }
  } catch (e) {
    console.error("[store/magic-link] fatal:", e);
    return NextResponse.redirect(`${origin}/store?error=server`, 303);
  }

  return NextResponse.redirect(`${origin}/store?magic=sent`, 303);
}
