import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeEmail } from "@/lib/store/format";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export interface StoreUser {
  id: string;
  email: string;
}

export async function getCurrentStoreUser(): Promise<StoreUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  if (!token) return null;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await client.auth.getUser();
  if (error || !data.user?.email) return null;
  return { id: data.user.id, email: normalizeEmail(data.user.email) };
}

export async function ensureStoreProfile(user: StoreUser) {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("shop_customer_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const { data: latestOrder } = await supabase
    .from("shop_orders")
    .select("first_name,last_name,phone,country,city")
    .ilike("email", user.email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data } = await supabase
    .from("shop_customer_profiles")
    .insert({
      user_id: user.id,
      email: user.email,
      first_name: latestOrder?.first_name ?? null,
      last_name: latestOrder?.last_name ?? null,
      phone: latestOrder?.phone ?? null,
      country: latestOrder?.country ?? null,
      city: latestOrder?.city ?? null,
    })
    .select("*")
    .single();

  await supabase
    .from("shop_orders")
    .update({ customer_user_id: user.id })
    .ilike("email", user.email)
    .is("customer_user_id", null);

  return data;
}

export async function sendStoreMagicLink(email: string, origin: string) {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client.auth.signInWithOtp({
    email: normalizeEmail(email),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/api/auth/callback?accountType=store`,
    },
  });
}
