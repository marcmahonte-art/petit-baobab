"use client";

// Contenu de la page merci — statut réel de la commande via /api/payment/status.
// Si le paiement n'est pas encore confirmé (IPN en cours), affiche un état
// "en traitement" avec re-vérification automatique.
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, XCircle, Download, ArrowLeft, FileText, Loader2,
} from "lucide-react";
import { useOrderStatus } from "./useOrderStatus";
import { Price } from "./Price";

export function OrderConfirmation() {
  const { data, loading, error, reload } = useOrderStatus();
  const pollCount = useRef(0);

  const paymentStatus = data?.order?.payment_status;

  // Poll léger tant que le paiement est en cours (max 10 essais / 5s)
  useEffect(() => {
    if (
      (paymentStatus === "pending" || paymentStatus === "processing") &&
      pollCount.current < 10
    ) {
      const t = setTimeout(() => {
        pollCount.current += 1;
        reload();
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [paymentStatus, reload]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-[#3B2416]/70">
        <Loader2 className="w-8 h-8 animate-spin text-[#7D6AF8]" />
        <p className="text-sm font-semibold">Vérification de votre commande...</p>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-8 max-w-lg mx-auto text-center space-y-4">
        <XCircle className="w-12 h-12 text-[#FF5E83] mx-auto" />
        <h1 className="text-xl font-extrabold text-[#3B2416]">Commande introuvable</h1>
        <p className="text-sm text-[#3B2416]/70">
          Nous n'avons pas retrouvé votre commande. Si vous venez de payer,
          vérifiez le lien reçu par email ou WhatsApp.
        </p>
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#7D6AF8] text-white font-bold text-xs rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const order = data.order;
  const isPaid = order.payment_status === "paid";
  const isProcessing =
    order.payment_status === "pending" || order.payment_status === "processing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Bandeau statut */}
      <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-8 text-center space-y-3">
        {isPaid ? (
          <>
            <CheckCircle2 className="w-14 h-14 text-[#1D9E75] mx-auto" />
            <h1 className="text-2xl font-extrabold text-[#3B2416]">
              Merci pour votre achat, {order.first_name} ! 🎉
            </h1>
            <p className="text-sm text-[#3B2416]/70">
              Votre paiement est confirmé. Vos téléchargements sont disponibles ci-dessous
              et vous ont été envoyés par email et WhatsApp.
            </p>
          </>
        ) : isProcessing ? (
          <>
            <Clock className="w-14 h-14 text-[#F59E0B] mx-auto" />
            <h1 className="text-2xl font-extrabold text-[#3B2416]">
              Paiement en cours de traitement
            </h1>
            <p className="text-sm text-[#3B2416]/70">
              Votre paiement sera bientôt traité. Le téléchargement sera disponible
              après confirmation. Cette page se met à jour automatiquement.
            </p>
            <Loader2 className="w-5 h-5 animate-spin text-[#7D6AF8] mx-auto" />
          </>
        ) : (
          <>
            <XCircle className="w-14 h-14 text-[#FF5E83] mx-auto" />
            <h1 className="text-2xl font-extrabold text-[#3B2416]">
              Paiement non abouti
            </h1>
            <p className="text-sm text-[#3B2416]/70">
              Le paiement a été {order.payment_status === "cancelled" ? "annulé" : "refusé"}.
              Aucun montant n'a été débité.
            </p>
            <Link
              href="/boutique/panier"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7D6AF8] text-white font-bold text-xs rounded-full"
            >
              Réessayer le paiement
            </Link>
          </>
        )}

        <p className="text-xs font-bold text-[#3B2416]/60 pt-2">
          Commande <span className="text-[#7D6AF8]">{order.order_number}</span>
          {order.invoice_number ? ` — Facture ${order.invoice_number}` : ""}
        </p>
      </div>

      {/* Résumé produits */}
      <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-[#3B2416] uppercase tracking-wide">
          Résumé de la commande
        </h2>
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
          <span>Montant total</span>
          <Price amount={order.total} size="lg" />
        </div>
      </div>

      {/* Téléchargements */}
      {isPaid && data.downloads.length > 0 && (
        <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-6 space-y-3">
          <h2 className="text-sm font-extrabold text-[#3B2416] uppercase tracking-wide">
            Vos téléchargements
          </h2>
          {data.downloads.map((dl) => (
            <div
              key={dl.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]/70"
            >
              <div>
                <p className="text-sm font-bold text-[#3B2416]">{dl.product_title}</p>
                <p className="text-[11px] text-[#3B2416]/60">
                  {dl.remaining} téléchargement{dl.remaining > 1 ? "s" : ""} restant{dl.remaining > 1 ? "s" : ""} — expire le{" "}
                  {new Date(dl.expires_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <a
                href={`/api/payment/download?token=${dl.token}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-xs rounded-full transition-colors"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </a>
            </div>
          ))}

          {data.invoice_signed_url && (
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
      )}

      <div className="text-center">
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#7D6AF8] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la boutique
        </Link>
      </div>
    </motion.div>
  );
}
