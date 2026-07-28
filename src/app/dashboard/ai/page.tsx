import { getAdminAI } from "@/lib/admin/data";
import { AdminPage, AdminTable } from "@/components/dashboard/admin-page";
import { Sparkles, BookOpen, Palette, Cpu, Star } from "lucide-react";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default async function AdminAIPage() {
  const { totalGenerations, totalLivres, totalColoriages, models, recent } = await getAdminAI();

  return (
    <AdminPage
      title="Modèles IA"
      description={`${totalGenerations} générations IA · ${totalLivres} livres · ${totalColoriages} coloriages. Données réelles (saved_drawings / books).`}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Sparkles className="w-4 h-4 text-[#7D6AF8]" /> Générations</div>
          <p className="text-2xl font-extrabold mt-2">{totalGenerations}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><BookOpen className="w-4 h-4 text-[#20C997]" /> Livres</div>
          <p className="text-2xl font-extrabold mt-2">{totalLivres}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Palette className="w-4 h-4 text-[#FF5E83]" /> Coloriages</div>
          <p className="text-2xl font-extrabold mt-2">{totalColoriages}</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase"><Cpu className="w-4 h-4 text-[#1194FF]" /> Modèles</div>
          <p className="text-2xl font-extrabold mt-2">{models.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminTable
          columns={["Modèle", "Générations", "Étoiles conso."]}
          rows={models.map((m) => ({
            cells: [
              <span key="m" className="font-bold">{m.model}</span>,
              <span key="g" className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-[#7D6AF8]" /> {m.generations}</span>,
              <span key="s" className="flex items-center gap-1"><Star className="w-4 h-4 text-[#FFB300]" /> {m.totalStars}</span>,
            ],
          }))}
        />
        <AdminTable
          columns={["Dessin", "Modèle", "Étoiles", "Date"]}
          rows={recent.map((r) => ({
            cells: [
              <span key="n" className="font-semibold">{r.name}</span>,
              <span key="m" className="text-xs text-[#3B2416]/60">{r.model}</span>,
              <span key="s" className="flex items-center gap-1"><Star className="w-4 h-4 text-[#FFB300]" /> {r.stars}</span>,
              <span key="d" className="text-sm text-[#3B2416]/70">{fmtDate(r.createdAt)}</span>,
            ],
          }))}
        />
      </div>
    </AdminPage>
  );
}
