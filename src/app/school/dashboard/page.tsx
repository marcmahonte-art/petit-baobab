import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";
import DashboardClient from '@/app/school/dashboard/DashboardClient';

export const metadata = {
  title: 'Tableau de bord – École',
};

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await getSupabaseServer();
  const { data: account } = await supabase
    .from("accounts")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  // /school/dashboard est réservé aux comptes école (plan ecole_pro).
  // Un particulier est redirigé vers son espace.
  if (!account || account.plan !== "ecole_pro") {
    redirect("/parents");
  }

  return <DashboardClient />;
}
