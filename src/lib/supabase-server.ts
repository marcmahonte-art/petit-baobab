import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

/**
 * Legacy: creates a client authenticated via the custom sb-access-token cookie.
 * Used by login/session/signup routes and adjustStars.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sb-access-token")?.value

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    },
  })
}

/**
 * SSR client that reads/writes Supabase's own auth cookies.
 * Required for exchangeCodeForSession (PKCE verifier cookie).
 * Use in OAuth callback only.
 */
export async function getSupabaseSsrClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options)
        }
      },
    },
  })
}
