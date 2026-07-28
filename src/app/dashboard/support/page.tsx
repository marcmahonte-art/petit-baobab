import { AdminPage } from "@/components/dashboard/admin-page";
import { Mail, MessageSquare, Phone, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminSupportPage() {
  return (
    <AdminPage
      title="Support"
      description="Canaux de support Petit Baobab. Aucun ticket n'est stocké en base (espace collaboratif via email/WhatsApp)."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="mailto:support@petitbaobab.com"
          className="bg-white rounded-[20px] border border-[#F1ECE5] p-6 hover:border-[#7D6AF8] transition-colors block"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center mb-3">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold mb-1">Email</h3>
          <p className="text-sm text-[#3B2416]/70">support@petitbaobab.com</p>
        </a>
        <a
          href="https://wa.me/221000000000"
          className="bg-white rounded-[20px] border border-[#F1ECE5] p-6 hover:border-[#20C997] transition-colors block"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#20C997]/10 text-[#20C997] flex items-center justify-center mb-3">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold mb-1">WhatsApp</h3>
          <p className="text-sm text-[#3B2416]/70">Réponse sous 24h</p>
        </a>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-6">
          <div className="w-11 h-11 rounded-2xl bg-[#FF5E83]/10 text-[#FF5E83] flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold mb-1">Bug signalé</h3>
          <p className="text-sm text-[#3B2416]/70">Capture + description → email support</p>
        </div>
      </div>

      <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-6">
        <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#7D6AF8]" /> Formulaire de contact (espace client)
        </h3>
        <p className="text-sm text-[#3B2416]/70">
          Les utilisateurs contactent le support via le lien « Besoin d'aide ? » présent
          sur toutes les pages (pied de page + pages d'erreur paiement). Les demandes
          arrivent par email et WhatsApp — aucune table de tickets n'est nécessaire
          pour le niveau actuel de la plateforme.
        </p>
      </div>
    </AdminPage>
  );
}
