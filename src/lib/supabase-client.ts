// src/lib/supabase-client.ts
// Client‑side Supabase instance (no next/headers)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabaseClient() {
  return supabaseClient;
}
