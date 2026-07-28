import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getBillingData } from "@/lib/billing/server";
import ParametresClient from "./ParametresClient";

export const metadata = {
  title: "Paramètres – École",
};

export default async function ParametresPage() {
  const user = await getServerUser();
  if (!user) redirect("/login?space=school");

  const supabase = await getSupabaseServer();
  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!account || account.plan !== "ecole_pro") redirect("/parents");

  const billing = await getBillingData();

  const { data: teacherProfile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <ParametresClient
      user={{ id: user.id, email: user.email || "" }}
      account={account}
      billing={billing}
      teacherProfile={teacherProfile}
    />
  );
}
