import { getAdminPayments } from "@/lib/admin/data";
import { AdminPage, AdminTable } from "@/components/dashboard/admin-page";
import { Coins, ShoppingBag, GraduationCap, Baby } from "lucide-react";

export const dynamic = "force-dynamic";

function fmtMontant(n: number, cur: string) {
  const sym = cur === "XOF" ? "FCFA" : cur;
  return `${n.toLocaleString("fr-FR")} ${sym}`;
}
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminPaymentsPage() {
  const { payments, caBoutique, caAbonnements } = await getAdminPayments();

  const pa = payments.filter((p) => p.type === "abonnement").length;
  const pb = payments.filter((p) => p.type === "boutique").length;

  return (
    <AdminPage
      title="Paiements"
      description={`Transactions boutique + abonnements. CA boutique : ${fmtMontant(caBoutique, "XOF")} · CA abonnements : ${fmtMontant(caAbonnements, "XOF")}`}
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><ShoppingBag className="w-4 h-4 text-[#7D6AF8]" /> Boutique</div>
          <p className="text-2xl font-extrabold mt-2">{pb}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><GraduationCap className="w-4 h-4 text-[#1194FF]" /> Abonnements</div>
          <p className="text-2xl font-extrabold mt-2">{pa}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Coins className="w-4 h-4 text-[#FFB300]" /> CA boutique</div>
          <p className="text-2xl font-extrabold mt-2">{fmtMontant(caBoutique, "XOF")}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Coins className="w-4 h-4 text-[#20C997]" /> CA abonnements</div>
          <p className="text-2xl font-extrabold mt-2">{fmtMontant(caAbonnements, "XOF")}</p>
        </div>
      </div>

      <AdminTable
        columns={["Type", "Client", "Email", "Montant", "Méthode", "Statut", "Date"]}
        rows={payments.map((p) => ({
          cells: [
            <span key="t" className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${p.type === "boutique" ? "bg-[#7D6AF8]/15 text-[#7D6AF8]" : "bg-[#1194FF]/15 text-[#1194FF]"}`}>
              {p.type === "boutique" ? "Boutique" : "Abonnement"}
            </span>,
            <span key="c" className="font-semibold">{p.client}</span>,
            <span key="e" className="text-xs text-[#3B2416]/60">{p.email}</span>,
            <span key="m" className="font-bold">{fmtMontant(p.amount, p.currency)}</span>,
            <span key="me" className="text-xs capitalize">{p.method}</span>,
            <span key="s" className="text-sm font-semibold capitalize">{p.status}</span>,
            <span key="d" className="text-sm text-[#3B2416]/70">{fmtDate(p.createdAt)}</span>,
          ],
        }))}
      />
    </AdminPage>
  );
}
