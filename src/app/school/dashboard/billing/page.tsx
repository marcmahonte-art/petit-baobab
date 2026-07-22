import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { getBillingData } from "@/lib/billing/server";
import BillingClient from "./BillingClient";

export const metadata = {
  title: "Facturation – Espace École",
};

export default async function SchoolBillingPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?space=school");
  }

  const data = await getBillingData();

  if (!data || data.account?.plan !== "ecole_pro") {
    redirect("/parents");
  }

  return <BillingClient data={data} />;
}
