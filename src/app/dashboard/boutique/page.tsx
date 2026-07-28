import { getAdminShopOrders } from "@/lib/admin/data";
import { AdminPage, AdminTable } from "@/components/dashboard/admin-page";
import { ShoppingBag, Coins, Download, CheckCircle, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtMontant(n: number, cur: string) {
  const sym = cur === "XOF" ? "FCFA" : cur;
  return `${n.toLocaleString("fr-FR")} ${sym}`;
}
function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    paid: "bg-[#20C997]/15 text-[#20C997]",
    pending: "bg-[#FFB300]/15 text-[#FFB300]",
    processing: "bg-[#1194FF]/15 text-[#1194FF]",
    failed: "bg-[#FF5E83]/15 text-[#FF5E83]",
    cancelled: "bg-[#9CA3AF]/15 text-[#9CA3AF]",
    expired: "bg-[#9CA3AF]/15 text-[#9CA3AF]",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${map[s] || "bg-gray-100 text-gray-600"}`}>
      {s}
    </span>
  );
}

export default async function AdminBoutiquePage() {
  const { orders, total, caTotal } = await getAdminShopOrders({ status: "all" });

  const paid = orders.filter((o) => o.paymentStatus === "paid").length;

  return (
    <AdminPage
      title="Boutique"
      description={`${total} commandes au total. CA payé : ${fmtMontant(caTotal, "XOF")}.`}
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><ShoppingBag className="w-4 h-4 text-[#7D6AF8]" /> Commandes</div>
          <p className="text-2xl font-extrabold mt-2">{total}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><CheckCircle className="w-4 h-4 text-[#20C997]" /> Payées</div>
          <p className="text-2xl font-extrabold mt-2">{paid}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Coins className="w-4 h-4 text-[#FFB300]" /> CA payé</div>
          <p className="text-2xl font-extrabold mt-2">{fmtMontant(caTotal, "XOF")}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Clock className="w-4 h-4 text-[#FFB300]" /> En attente</div>
          <p className="text-2xl font-extrabold mt-2">{total - paid}</p>
        </div>
      </div>

      <AdminTable
        columns={["N° commande", "Client", "Email", "Articles", "Montant", "Méthode", "Paiement", "Statut", "Date"]}
        rows={orders.map((o) => ({
          cells: [
            <span key="n" className="font-mono text-xs">{o.orderNumber}</span>,
            <span key="c" className="font-semibold">{o.client}</span>,
            <span key="e" className="text-xs text-[#3B2416]/60">{o.email}</span>,
            <span key="i" className="flex items-center gap-1"><ShoppingBag className="w-4 h-4 text-[#7D6AF8]" /> {o.itemsCount}</span>,
            <span key="m" className="font-bold">{fmtMontant(o.total, o.currency)}</span>,
            <span key="me" className="text-xs capitalize">{o.method}</span>,
            <StatusBadge key="p" s={o.paymentStatus} />,
            <StatusBadge key="s" s={o.status} />,
            <span key="d" className="text-sm text-[#3B2416]/70">{fmtDate(o.createdAt)}</span>,
          ],
        }))}
      />
    </AdminPage>
  );
}
