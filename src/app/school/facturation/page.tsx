import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";
import FacturationClient from "./FacturationClient";

export const metadata = {
  title: "Facturation – Espace École",
};

export default async function FacturationPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?space=school");
  }

  const supabase = await getSupabaseServer();
  const { data: account } = await supabase
    .from("accounts")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  if (!account || account.plan !== "ecole_pro") {
    redirect("/parents");
  }

  return <FacturationClient />;
}
