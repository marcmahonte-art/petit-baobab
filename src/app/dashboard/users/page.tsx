import { getAdminUsers, type AdminUserRow } from "@/lib/admin/data";
import { AdminPage, AdminTable } from "@/components/dashboard/admin-page";
import { Users, GraduationCap, Baby, School, Coins, Star } from "lucide-react";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function RoleBadge({ role }: { role: AdminUserRow["role"] }) {
  if (role === "ecole") {
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#20C997]/15 text-[#20C997]">École</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#7D6AF8]/15 text-[#7D6AF8]">Famille</span>;
}

export default async function AdminUsersPage() {
  const { users, total } = await getAdminUsers({ limit: 200 });

  return (
    <AdminPage
      title="Utilisateurs"
      description={`${total} comptes au total (familles + écoles). Données réeles Supabase.`}
    >
      <AdminTable
        columns={["Utilisateur", "Rôle", "Plan", "Enfants", "Classes", "Élèves", "Étoiles", "Inscription"]}
        rows={users.map((u) => ({
          cells: [
            <div key="u" className="min-w-[180px]">
              <div className="font-bold">{u.fullName || "—"}</div>
              <div className="text-xs text-[#3B2416]/60">{u.email || "—"}</div>
            </div>,
            <RoleBadge key="r" role={u.role} />,
            <span key="p" className="text-sm font-semibold capitalize">{u.plan}</span>,
            <span key="c" className="flex items-center gap-1"><Baby className="w-4 h-4 text-[#FFB300]" /> {u.childrenCount}</span>,
            <span key="cl" className="flex items-center gap-1"><School className="w-4 h-4 text-[#20C997]" /> {u.classroomsCount}</span>,
            <span key="s" className="flex items-center gap-1"><GraduationCap className="w-4 h-4 text-[#1194FF]" /> {u.studentsCount}</span>,
            <span key="st" className="flex items-center gap-1"><Star className="w-4 h-4 text-[#FFB300]" /> {u.starsBalance}</span>,
            <span key="d" className="text-sm text-[#3B2416]/70">{fmtDate(u.createdAt)}</span>,
          ],
        }))}
      />
    </AdminPage>
  );
}
