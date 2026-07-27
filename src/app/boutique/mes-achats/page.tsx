"use client";

// Espace "Mes achats" — accès INVITÉ via lien magique (?order=&token=)
// reçu par email/WhatsApp, ou via le dernier achat mémorisé en localStorage.
// Affiche : statut, date, produits, téléchargements restants, facture.
import { Suspense } from "react";
import Link from "next/link";
import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Footer } from "@/components/boutique/Footer";
import { MiniCart } from "@/components/boutique/MiniCart";
import { Breadcrumb } from "@/components/boutique/Breadcrumb";
import { Price } from "@/components/boutique/Price";
import { useOrderStatus } from "@/components/boutique/useOrderStatus";
import {
  Download, FileText, Loader2, PackageOpen, ShoppingBag, Clock, CheckCircle2, XCircle,
} from "lucide-react";

const STATUS_LABEL: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  paid: { label: "Payée", cls: "bg-[#1D9E75]/10 text-[#1D9E75]", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pending: { label: "En attente", cls: "bg-[#F59E0B]/10 text-[#F59E0B]", icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: "En traitement", cls: "bg-[#F59E0B]/10 text-[#F59E0B]", icon: <Clock className="w-3.5 h-3.5" /> },
  failed: { label: "Échouée", cls: "bg-[#FF5E83]/10 text-[#FF5E83]", icon: <XCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Annulée", cls: "bg-[#FF5E83]/10 text-[#FF5E83]", icon: <XCircle className="w-3.5 h-3.5" /> },
  expired: { label: "Expirée", cls: "bg-gray-100 text-gray-500", icon: <XCircle className="w-3.5 h-3.5" /> },
};

function MesAchatsContent() {
  const { data, loading, error } = useOrderStatus();

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-[#3B2416]/70">
        <Loader2 className="w-8 h-8 animate-spin text-[#7D6AF8]" />
        <p className="text-sm font-semibold">Chargement de vos achats...</p>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-8 md:p-10 max-w-lg mx-auto text-center space-y-5">
        <PackageOpen className="w-14 h-14 text-[#3B2416]/30 mx-auto" />
        <div>
          <h1 className="text-xl font-extrabold text-[#3B2416]">Aucun achat trouvé</h1>
          <p className="text-sm text-[#3B2416]/70 mt-2">
            Vos achats sont accessibles via le lien sécurisé reçu par email ou
            WhatsApp après votre commande. Retrouvez ce lien dans votre boîte de
            réception (objet : « Merci pour votre achat »).
          </p>
        </div>
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#7D6AF8] text-white font-bold text-xs rounded-full"
        >
          <ShoppingBag className="w-4 h-4" />
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  const order = data.order;
  const badge = STATUS_LABEL[order.payment_status] || STATUS_LABEL.pending;
  const isPaid = order.payment_status === "paid";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Commande */}
      <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E0D5]">
          <div>
            <h2 className="text-lg font-extrabold text-[#3B2416]">
              Commande {order.order_number}
            </h2>
            <p className="text-xs text-[#3B2416]/60">
              {new Date(order.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
              {order.invoice_number ? ` — Facture ${order.invoice_number}` : ""}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${badge.cls}`}>
            {badge.icon}
            {badge.label}
          </span>
        </div>

        {/* Produits */}
        <div className="space-y-2">
          {order.items.map((it) => (
            <div
              key={it.productId}
              className="flex items-center justify-between text-sm border-b border-[#F0E7DA] pb-2 last:border-0"
            >
              <span className="text-[#3B2416]">
                {it.title} <span className="text-[#3B2416]/50">× {it.quantity}</span>
              </span>
              <Price amount={it.unitPrice * it.quantity} size="sm" />
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 font-extrabold text-[#3B2416]">
            <span>Total</span>
            <Price amount={order.total} size="md" />
          </div>
        </div>
      </div>

      {/* Téléchargements */}
      <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-6 md:p-8 space-y-3">
        <h3 className="text-sm font-extrabold text-[#3B2416] uppercase tracking-wide">
          Mes téléchargements
        </h3>

        {!isPaid ? (
          <p className="text-sm text-[#3B2416]/60">
            Les téléchargements seront disponibles après confirmation du paiement.
          </p>
        ) : data.downloads.length === 0 ? (
          <p className="text-sm text-[#3B2416]/60">Aucun fichier téléchargeable pour cette commande.</p>
        ) : (
          data.downloads.map((dl) => {
            const expired = new Date(dl.expires_at).getTime() < Date.now();
            const exhausted = dl.remaining <= 0;
            return (
              <div
                key={dl.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]/70"
              >
                <div>
                  <p className="text-sm font-bold text-[#3B2416]">{dl.product_title}</p>
                  <p className="text-[11px] text-[#3B2416]/60">
                    {expired
                      ? "Lien expiré"
                      : exhausted
                      ? "Quota de téléchargements atteint"
                      : `${dl.remaining} téléchargement${dl.remaining > 1 ? "s" : ""} restant${dl.remaining > 1 ? "s" : ""} — expire le ${new Date(dl.expires_at).toLocaleDateString("fr-FR")}`}
                  </p>
                </div>
                {expired || exhausted ? (
                  <span className="text-xs font-bold text-[#3B2416]/40 px-4 py-2">Indisponible</span>
                ) : (
                  <a
                    href={`/api/payment/download?token=${dl.token}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-xs rounded-full transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </a>
                )}
              </div>
            );
          })
        )}

        {isPaid && data.invoice_signed_url && (
          <a
            href={data.invoice_signed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#7D6AF8] hover:underline pt-1"
          >
            <FileText className="w-4 h-4" />
            Télécharger ma facture PDF
          </a>
        )}
      </div>
    </div>
  );
}

export default function MesAchatsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <BoutiqueHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-4">
        <Breadcrumb items={[{ label: "Boutique", href: "/boutique" }, { label: "Mes achats" }]} />
        <div className="my-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3B2416]">Mes achats</h1>
          <p className="text-xs md:text-sm text-[#3B2416]/70 mt-1">
            Historique, téléchargements et factures de vos commandes.
          </p>
        </div>

        <Suspense fallback={null}>
          <MesAchatsContent />
        </Suspense>
      </main>

      <Footer />
      <MiniCart />
    </div>
  );
}
