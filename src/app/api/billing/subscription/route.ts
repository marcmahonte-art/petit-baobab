import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"

export async function GET() {
  try {
    const supabase = await getSupabaseServer()
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 })
    }

    const { data: account } = await supabase
      .from("accounts")
      .select("id, plan, stars_balance")
      .eq("user_id", user.id)
      .single()

    if (!account) {
      return NextResponse.json({ error: "Compte introuvable" }, { status: 404 })
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      subscription: subscription || null,
      account: {
        plan: account.plan,
        stars_balance: account.stars_balance,
      },
    })
  } catch (err: any) {
    console.error("Subscription API error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
