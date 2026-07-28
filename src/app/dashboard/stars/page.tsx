import { getAdminStars } from "@/lib/admin/data";
import { AdminPage, AdminTable } from "@/components/dashboard/admin-page";
import { Star, Download, Package } from "lucide-react";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

export default async function AdminStarsPage() {
  const { rows, totalRestant, totalDistribue, totalConsomme, packs } = await getAdminStars();

  return (
    <AdminPage
      title="Étoiles"
      description={`Solde restant : ${fmt(totalRestant)} · Distribuées : ${fmt(totalDistribue)} · Consommées : ${fmt(totalConsomme)}.`}
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Star className="w-4 h-4 text-[#FFB300]" /> Restant</div>
          <p className="text-2xl font-extrabold mt-2">{fmt(totalRestant)}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Star className="w-4 h-4 text-[#20C997]" /> Distribuées</div>
          <p className="text-2xl font-extrabold mt-2">{fmt(totalDistribue)}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Download className="w-4 h-4 text-[#1194FF]" /> Consommées</div>
          <p className="text-2xl font-extrabold mt-2">{fmt(totalConsomme)}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Package className="w-4 h-4 text-[#7D6AF8]" /> Packs achetés</div>
          <p className="text-2xl font-extrabold mt-2">{fmt(packs.reduce((a, p) => a + p.count, 0))}</p>
        </div>
      </div>

      {/* Packs */}
      {packs.length > 0 && (
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <h3 className="text-sm font-extrabold mb-3">Packs d'étoiles achetés</h3>
          <div className="flex flex-wrap gap-2">
            {packs.map((p) => (
              <span key={p.label} className="px-3 py-1 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] text-xs font-bold">
                {p.label} × {p.count}
              </span>
            ))}
          </div>
        </div>
      )}

      <AdminTable
        columns={["Compte", "Plan", "Solde", "Distribué", "Consommé"]}
        rows={rows.map((r) => ({
          cells: [
            <span key="e" className="text-xs text-[#3B2416]/60">{r.email}</span>,
            <span key="p" className="text-sm font-semibold capitalize">{r.plan}</span>,
            <span key="b" className="flex items-center gap-1"><Star className="w-4 h-4 text-[#FFB300]" /> {fmt(r.balance)}</span>,
            <span key="d" className="text-sm">{fmt(r.totalDistribue)}</span>,
            <span key="c" className="text-sm">{fmt(r.totalConsomme)}</span>,
          ],
        }))}
      />
    </AdminPage>
  );
}
