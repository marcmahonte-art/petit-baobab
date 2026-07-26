import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Mail, MessageSquare, Download, ArrowLeft } from "lucide-react";

export function OrderSuccess() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 md:p-12 bg-white rounded-[24px] border border-[#E5E0D5] shadow-lg max-w-xl mx-auto my-8">
      {/* Illustration */}
      <div className="relative w-32 h-32 mb-6">
        <Image
          src="/illustrations/Aperçois.webp"
          alt="Commande réussie"
          fill
          className="object-contain"
        />
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#1D9E75] text-white flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Header */}
      <span className="px-3 py-1 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-bold uppercase tracking-wider mb-2">
        Commande confirmée
      </span>
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#3B2416]">
        Merci pour votre commande !
      </h1>
      <p className="text-sm text-[#3B2416]/70 mt-2 max-w-md">
        Votre paiement a bien été reçu. Vos contenus éducatifs sont en cours d'envoi.
      </p>

      {/* Notifications list */}
      <div className="w-full my-8 space-y-3 text-left">
        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]">
          <div className="w-9 h-9 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#3B2416]">Téléchargement disponible</h4>
            <p className="text-[11px] text-[#3B2416]/70">Vos liens de téléchargement PDF sont prêts.</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]">
          <div className="w-9 h-9 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#3B2416]">Email envoyé</h4>
            <p className="text-[11px] text-[#3B2416]/70">Un récapitulatif ainsi que la facture ont été envoyés sur votre e-mail.</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]">
          <div className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#3B2416]">WhatsApp envoyé</h4>
            <p className="text-[11px] text-[#3B2416]/70">Si vous avez coché la case, une copie a été envoyée sur votre numéro WhatsApp.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <Link
          href="/boutique"
          className="w-full py-3.5 px-6 rounded-full bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7D6AF8]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la boutique</span>
        </Link>
      </div>
    </div>
  );
}
