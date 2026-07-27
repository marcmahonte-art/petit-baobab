import { getAdminSchools } from "@/lib/admin/data";
import { AdminPage, AdminTable } from "@/components/dashboard/admin-page";
import { School, GraduationCap, Star } from "lucide-react";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminSchoolsPage() {
  const { schools, total } = await getAdminSchools();

  return (
    <AdminPage
      title="Écoles"
      description={`${total} comptes école (plan ecole_pro). Données réelles Supabase.`}
    >
      <AdminTable
        columns={["École", "Email", "Classes", "Élèves", "Étoiles", "Abonnement", "Inscription"]}
        rows={schools.map((s) => ({
          cells: [
            <div key="name" className="font-bold min-w-[150px]">{s.fullName || "—"}</div>,
            <span key="email" className="text-xs text-[#3B2416]/60">{s.email || "—"}</span>,
            <span key="c" className="flex items-center gap-1"><School className="w-4 h-4 text-[#20C997]" /> {s.classroomsCount}</span>,
            <span key="st" className="flex items-center gap-1"><GraduationCap className="w-4 h-4 text-[#1194FF]" /> {s.studentsCount}</span>,
            <span key="star" className="flex items-center gap-1"><Star className="w-4 h-4 text-[#FFB300]" /> {s.starsBalance}</span>,
            <span key="sub" className="text-sm font-semibold capitalize">{s.subscription || "—"}</span>,
            <span key="d" className="text-sm text-[#3B2416]/70">{fmtDate(s.createdAt)}</span>,
          ],
        }))}
      />
    </AdminPage>
  );
}
