import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseServer } from "@/lib/supabaseServer"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const STARS_REASONS = {
  SIGNUP_BONUS: "signup_bonus",
  DAILY_RESET: "daily_reset",
  GENERATION: "generation",
  REFUND: "refund",
  PURCHASE: "purchase",
  SUBSCRIPTION_RENEWAL: "subscription_renewal",
  ADMIN_GRANT: "admin_grant",
} as const

export type StarsReason = typeof STARS_REASONS[keyof typeof STARS_REASONS]

/**
 * Retrieves the authenticated user from the HTTP-only cookies on the server side.
 */
export async function getServerUser() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("sb-access-token")?.value

  if (!accessToken) return null

  try {
    const client = await getSupabaseServer()
    const { data: { user }, error } = await client.auth.getUser(accessToken)
    if (error || !user) return null
    return user
  } catch (err) {
    console.error("Error retrieving server user from cookies:", err)
    return null
  }
}

/**
 * Sets HTTP-only auth cookies on login/signup.
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()

  const secure = process.env.NODE_ENV === "production"

  cookieStore.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  cookieStore.set("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

/**
 * Clears the auth cookies on logout.
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete("sb-access-token")
  cookieStore.delete("sb-refresh-token")
}

/**
 * Adjusts the stars balance of an account atomically.
 * Calls the Supabase RPC function 'adjust_stars' or falls back to direct select/insert if unavailable.
 * Accepts an optional authenticated Supabase client; if omitted, uses cookie-based auth.
 */
export async function adjustStars(
  accountId: string,
  amount: number,
  reason: StarsReason,
  referenceId: string | null = null,
  supabaseClient?: any
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const client = supabaseClient || await getSupabaseServer()
    // 1. Try invoking the database function
    const { data, error } = await client.rpc("adjust_stars", {
      p_account_id: accountId,
      p_amount: amount,
      p_reason: reason,
      p_reference_id: referenceId,
    })

    if (!error) {
      return { success: true, newBalance: Number(data) }
    }

    // If RPC does not exist (e.g. before migration is run), fallback to manual transaction
    if (error.code === "PGRST202" || error.message.includes("function") || error.message.includes("does not exist")) {
      console.warn("RPC 'adjust_stars' not found. Falling back to direct database operations...")
      return await adjustStarsFallback(accountId, amount, reason, referenceId, client)
    }

    return { success: false, error: error.message }
  } catch (err: any) {
    console.error("Failed to adjust stars:", err)
    return { success: false, error: err.message || "Erreur de transaction d'étoiles." }
  }
}

/**
 * Fallback direct client query if 'adjust_stars' RPC is not registered yet.
 */
async function adjustStarsFallback(
  accountId: string,
  amount: number,
  reason: StarsReason,
  referenceId: string | null,
  client: any
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  // Fetch current balance
  const { data: account, error: fetchErr } = await client
    .from("accounts")
    .select("stars_balance")
    .eq("id", accountId)
    .single()

  if (fetchErr || !account) {
    return { success: false, error: "Compte introuvable." }
  }

  const currentBalance = account.stars_balance || 0
  const nextBalance = currentBalance + amount

  if (nextBalance < 0) {
    return { success: false, error: "Solde d'étoiles insuffisant." }
  }

  // Update balance
  const { error: updateErr } = await client
    .from("accounts")
    .update({ stars_balance: nextBalance })
    .eq("id", accountId)

  if (updateErr) {
    return { success: false, error: updateErr.message }
  }

  // Log transaction
  const { error: txErr } = await client
    .from("stars_transactions")
    .insert({
      account_id: accountId,
      amount,
      reason,
      reference_id: referenceId,
    })

  if (txErr) {
    console.error("Warning: stars transaction log failed:", txErr.message)
  }

  return { success: true, newBalance: nextBalance }
}
