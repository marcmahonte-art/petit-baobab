import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

/**
 * Creates a request-scoped Supabase client that reads the session cookie and forwards it.
 * This prevents session pollution across concurrent server requests in Next.js.
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
