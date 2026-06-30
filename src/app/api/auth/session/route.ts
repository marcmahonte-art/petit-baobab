import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { getServerUser, adjustStars } from "@/lib/auth"

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

    let starsBalance = account.stars_balance || 0

    // Automatic rolling 24-hour top up back to 5 stars for Free plans
    if (account.plan === "free" && starsBalance < 5) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data: recentResets, error: resetErr } = await supabase
        .from("stars_transactions")
        .select("created_at")
        .eq("account_id", account.id)
        .in("reason", ["signup_bonus", "daily_reset"])
        .gte("created_at", twentyFourHoursAgo)
        .limit(1)

      if (!resetErr && (!recentResets || recentResets.length === 0)) {
        const topupAmount = 5 - starsBalance
        const { success, newBalance } = await adjustStars(account.id, topupAmount, "daily_reset")
        if (success && newBalance !== undefined) {
          starsBalance = newBalance
        }
      }
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
        stars_balance: starsBalance,
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
