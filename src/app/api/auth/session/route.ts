import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { getServerUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    // Fetch account details
    const { data: account, error: accError } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (accError || !account) {
      return NextResponse.json({ authenticated: false })
    }

    // Fetch child profiles
    const { data: profiles, error: profError } = await supabase
      .from("child_profiles")
      .select("*")
      .eq("account_id", account.id)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      account: {
        id: account.id,
        stars_balance: account.stars_balance,
        plan: account.plan,
      },
      profiles: (profiles || []).map((p) => ({
        id: p.id,
        name: p.name,
        mascot: p.mascot,
        pin_required: p.pin_required,
      })),
    })
  } catch (err: any) {
    console.error("Session check API route error:", err)
    return NextResponse.json(
      { authenticated: false, error: err.message },
      { status: 500 }
    )
  }
}
