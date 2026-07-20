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

export type StarsReason = (typeof STARS_REASONS)[keyof typeof STARS_REASONS]

/**
 * Retrieves the authenticated user from the HTTP-only cookies on the server side.
 * Tries to refresh the token if the access token is expired.
 */
export async function getServerUser() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("sb-access-token")?.value

  if (!accessToken) return null

  try {
    const client = await getSupabaseServer()
    const { data, error } = await client.auth.getUser(accessToken)

    if (error) {
      // Attempt to refresh token
      const refreshToken = cookieStore.get("sb-refresh-token")?.value
      if (!refreshToken) return null

      const refreshClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const { data: refreshData, error: refreshError } =
        await refreshClient.auth.refreshSession({ refresh_token: refreshToken })

      if (refreshError || !refreshData.session) {
        return null
      }

      // Update cookies with new tokens
      await setAuthCookies(refreshData.session.access_token, refreshData.session.refresh_token)

      return refreshData.user
    }

    return data.user
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

  // Purge toute session élève résiduelle : un login parent doit écraser
  // un éventuel cookie sb-student-token (connexion élève précédente)
  // pour éviter la cohabitation des deux sessions.
  cookieStore.delete("sb-student-token")
  cookieStore.delete("sb-student-session-active")

  const secure = process.env.NODE_ENV === "production"

  cookieStore.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })

  cookieStore.set("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
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
  cookieStore.delete("pb-role")
  // Toujours purge aussi la session élève résiduelle pour éviter qu'un
  // cookie sb-student-token (connexion élève précédente) ne cohabite
  // avec la session parent et ne prenne le dessus sur /dashboardstudent.
  cookieStore.delete("sb-student-token")
  cookieStore.delete("sb-student-session-active")
}

/**
 * Pose un cookie public (non httpOnly) indiquant le rôle de l'espace :
 * "parent" (plan free/decouverte/super_baobab) ou "teacher" (plan ecole_pro).
 * Lu par le middleware et le header pour router sans rappel DB.
 */
export async function setRoleCookie(plan: string) {
  const cookieStore = await cookies()
  const role = plan === "ecole_pro" ? "teacher" : "parent"

  const secure = process.env.NODE_ENV === "production"
  cookieStore.set("pb-role", role, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
}

/**
 * Adjusts the stars balance of an account atomically.
 */
export async function adjustStars(
  accountId: string,
  amount: number,
  reason: StarsReason,
  referenceId: string | null = null,
  supabaseClient?: any
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const client = supabaseClient || (await getSupabaseServer())
    const { data, error } = await client.rpc("adjust_stars", {
      p_account_id: accountId,
      p_amount: amount,
      p_reason: reason,
      p_reference_id: referenceId,
    })

    if (!error) {
      return { success: true, newBalance: Number(data) }
    }

    if (
      error.code === "PGRST202" ||
      error.message.includes("function") ||
      error.message.includes("does not exist")
    ) {
      console.warn("RPC 'adjust_stars' not found. Falling back to direct database operations...")
      return await adjustStarsFallback(accountId, amount, reason, referenceId, client)
    }

    return { success: false, error: error.message }
  } catch (err: any) {
    console.error("Failed to adjust stars:", err)
    return { success: false, error: err.message || "Erreur de transaction d'étoiles." }
  }
}

async function adjustStarsFallback(
  accountId: string,
  amount: number,
  reason: StarsReason,
  referenceId: string | null,
  client: any
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  // Fallback atomique : on délègue le calcul conditionnel à une fonction SQL
  // dédiée (adjust_stars_atomic) qui fait un UPDATE .. SET stars_balance =
  // stars_balance + X WHERE id = $1 AND stars_balance >= -X, et renvoie le
  // nouveau solde ou NULL si l'opération a échoué (solde insuffisant / compte
  // absent). Pas de SELECT + UPDATE séparés -> pas de race condition.
  const { data: newBalance, error: rpcErr } = await client.rpc("adjust_stars_atomic", {
    p_account_id: accountId,
    p_amount: amount,
    p_reason: reason,
    p_reference_id: referenceId,
  })

  if (rpcErr) {
    return { success: false, error: rpcErr.message }
  }

  // La fonction renvoie NULL si le solde était insuffisant.
  if (newBalance === null || newBalance === undefined) {
    return { success: false, error: "Solde d'étoiles insuffisant." }
  }

  return { success: true, newBalance: Number(newBalance) }
}
