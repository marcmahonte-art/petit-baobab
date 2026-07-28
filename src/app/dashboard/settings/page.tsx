import type { ReactNode } from "react";
import { getAdminSettings } from "@/lib/admin/data";
import { AdminPage } from "@/components/dashboard/admin-page";
import { Settings, ShieldCheck, CheckCircle, XCircle, ShoppingBag, Mail, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

function Row({ icon, label, value, ok }: {
  icon: ReactNode;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-t border-[#F1ECE5] first:border-t-0">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="w-7 h-7 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center">{icon}</span>
        {label}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#3B2416]/70">{value}</span>
        {ok === undefined ? null : ok ? (
          <CheckCircle className="w-4 h-4 text-[#20C997]" />
        ) : (
          <XCircle className="w-4 h-4 text-[#FF5E83]" />
        )}
      </div>
    </div>
  );
}

export default async function AdminSettingsPage() {
  const s = await getAdminSettings();

  return (
    <AdminPage
      title="Paramètres"
      description="Configuration globale de la plateforme (lecture seule, côté serveur)."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-6">
          <h3 className="text-sm font-extrabold mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7D6AF8]" /> Accès & Sécurité
          </h3>
          <Row icon={<ShieldCheck className="w-4 h-4" />} label="Super Admins" value={s.superAdmins.join(", ") || "—"} ok={s.superAdmins.length > 0} />
          <Row icon={<Settings className="w-4 h-4" />} label="Clé service_role" value={s.hasServiceKey ? "Présente" : "Absente"} ok={s.hasServiceKey} />
          <Row icon={<Settings className="w-4 h-4" />} label="Supabase URL" value={s.supabaseUrl ? "Configurée" : "Absente"} ok={!!s.supabaseUrl} />
        </div>

        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-6">
          <h3 className="text-sm font-extrabold mb-2 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#7D6AF8]" /> Boutique & Paiements
          </h3>
          <Row icon={<ShoppingBag className="w-4 h-4" />} label="Boutique (PayDunya)" value={s.boutiqueActive ? "Active" : "Inactive"} ok={s.boutiqueActive} />
          <Row icon={<Settings className="w-4 h-4" />} label="Mode PayDunya" value={s.paydunyaMode === "live" ? "PRODUCTION" : "Sandbox (test)"} ok={s.paydunyaMode !== "live"} />
          <Row icon={<Mail className="w-4 h-4" />} label="Email expéditeur" value={s.emailFrom || "—"} ok={!!s.emailFrom} />
          <Row icon={<Phone className="w-4 h-4" />} label="WhatsApp Business" value={s.whatsappConfigured ? "Configuré" : "Non"} ok={s.whatsappConfigured} />
        </div>
      </div>

      <div className="bg-white/60 border border-dashed border-[#F1ECE5] rounded-[20px] p-6 text-sm text-[#3B2416]/60">
        Les modifications de configuration se font dans Vercel → Settings → Environment Variables.
        Aucun secret n'est affiché ici.
      </div>
    </AdminPage>
  );
}
