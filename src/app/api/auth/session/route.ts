import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser, adjustStars } from "@/lib/auth"

function getDisplayNameFromEmail(email: string): string {
  if (!email) return "Mon Enfant"
  const username = email.split("@")[0]
  return username
    .split(/[\._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export async function GET() {
  try {
    const supabase = await getSupabaseServer()
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value
    const refreshToken = cookieStore.get("sb-refresh-token")?.value

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

    // Renouvellement gratuit : basé sur la date calendaire GMT (minuit passé),
    // PAS sur une fenêtre glissante de 24h. Le solde repasse à 5, jamais plus
    // (pas de cumul). Le cron pg_cron fait le vrai travail à minuit GMT ; ce
    // bloc est un filet de sécurité pour les utilisateurs qui se connectent
    // avant que le cron n'ait tourné.
    if (account.plan === "free" && starsBalance < 5) {
      const startOfTodayUtc = new Date(Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate()
      )).toISOString()

      const { data: recentResets, error: resetErr } = await supabase
        .from("stars_transactions")
        .select("created_at")
        .eq("account_id", account.id)
        .in("reason", ["signup_bonus", "daily_reset"])
        .gte("created_at", startOfTodayUtc)
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

    // Dynamic fix: If an existing profile is named "Mon Enfant", rename it to the email-derived name
    if (profiles && profiles.length > 0) {
      const emailDisplayName = getDisplayNameFromEmail(user.email || "")
      for (const p of profiles) {
        if (p.name === "Mon Enfant") {
          const { error: renameErr } = await supabase
            .from("child_profiles")
            .update({ name: emailDisplayName })
            .eq("id", p.id)
          if (!renameErr) {
            p.name = emailDisplayName
          }
        }
      }
    }

    return NextResponse.json({
      authenticated: true,
      accessToken,
      refreshToken,
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
