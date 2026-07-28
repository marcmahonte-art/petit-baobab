"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Star,
  Calendar,
  Receipt,
  ShoppingCart,
  Download,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Pencil,
  RefreshCw,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import type { BillingData } from "@/lib/billing/server";
import { PLAN_LABELS, TRANSACTION_LABELS, TRANSACTION_ICONS } from "@/lib/billing";
import StarPurchaseModal from "@/components/school/StarPurchaseModal";
import ChangePlanDialog from "@/components/school/billing/ChangePlanDialog";
import SubscribeDialog from "@/components/school/billing/SubscribeDialog";

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  success: { label: "Payé", color: "bg-green-100 text-green-700" },
  completed: { label: "Payé", color: "bg-green-100 text-green-700" },
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  failed: { label: "Échoué", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Annulé", color: "bg-gray-100 text-gray-600" },
};

function fmtDate(d?: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function fmtXof(n: number): string {
  return `${n.toLocaleString("fr-FR")} FCFA`;
}

export default function BillingClient({ data }: { data: BillingData }) {
  const [showBuyStars, setShowBuyStars] = useState(false);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);

  const { account, subscription, payments, starsTransactions, invoices, monthlyConsumption, amountPaidThisMonth } = data;
  const planName = PLAN_LABELS[(account?.plan as keyof typeof PLAN_LABELS) || "free"] || account?.plan || "École Pro";
  const starsBalance = account?.stars_balance ?? 0;
  const starsTotal = subscription?.renew_at ? 1000 : 1000;
  const progressValue = starsTotal > 0 ? (starsBalance / starsTotal) * 100 : 0;
  const status = subscription?.status || "active";
  const expiresAt = account?.plan_expires_at || subscription?.renew_at;
  const startedAt = account?.plan_started_at || subscription?.created_at;

  const maxConsumption = Math.max(1, ...monthlyConsumption.map((m) => m.total));

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#3B2416] leading-tight">
            Facturation &amp; Abonnement
          </h1>
          <p className="text-[15px] font-semibold text-[#7A6A5E] mt-0.5">
            Gérez votre abonnement, vos paiements et votre consommation d&apos;étoiles.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSubscribe(true)}
            className="flex items-center gap-1.5 h-[44px] px-5 rounded-full bg-[#16A34A] text-white text-sm font-bold hover:bg-[#15803D] shadow-sm transition-all cursor-pointer"
          >
            <Star className="w-4 h-4" />
            S&apos;abonner
          </button>
          <button
            onClick={() => setShowBuyStars(true)}
            className="flex items-center gap-1.5 h-[44px] px-5 rounded-full bg-[#7D6AF8] text-white text-sm font-bold hover:bg-[#6552E8] shadow-sm transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            Acheter des étoiles
          </button>
        </div>
      </motion.div>

      {/* Résumé - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Wallet} title="Plan actuel" value={planName} badge="Actif" badgeColor="green" index={0} />
        <SummaryCard
          icon={Star}
          title="Étoiles disponibles"
          value={`${starsBalance} / ${starsTotal}`}
          progress
          progressValue={progressValue}
          cta="Acheter"
          ctaAction={() => setShowBuyStars(true)}
          index={1}
        />
        <SummaryCard icon={Calendar} title="Prochain renouvellement" value={fmtDate(expiresAt)} index={2} />
        <SummaryCard
          icon={Receipt}
          title="Montant payé ce mois"
          value={fmtXof(amountPaidThisMonth)}
          subtext="Paiements réussis"
          index={3}
        />
      </div>

      {/* Plan actif + Solde */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm"
        >
          <h3 className="text-lg font-extrabold text-[#3B2416] mb-4">Plan actif</h3>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-2xl font-extrabold text-[#3B2416]">{planName}</p>
              <p className="text-sm font-bold text-[#7D6AF8]">25 000 FCFA / mois</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {status === "active" ? "Actif" : "Inactif"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF5CC]">
              <Star className="w-3.5 h-3.5 text-[#FFB300] fill-[#FFB300]" />
              <span className="text-xs font-extrabold text-[#3B2416]">{starsBalance}</span>
            </div>
            <span className="text-xs font-semibold text-[#7A6A5E]">étoiles restantes</span>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 rounded-[14px] bg-[#FFF9F2] mb-4">
            <div>
              <span className="text-[11px] font-semibold text-[#7A6A5E]">Date d&apos;activation</span>
              <p className="text-sm font-bold text-[#3B2416]">{fmtDate(startedAt)}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#7A6A5E]">Date d&apos;expiration</span>
              <p className="text-sm font-bold text-[#3B2416]">{fmtDate(expiresAt)}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#7A6A5E]">Renouvellement</span>
              <p className="text-sm font-bold text-[#3B2416]">{account?.renewal_enabled ? "Automatique" : "Manuel"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChangePlan(true)}
              className="flex items-center gap-1.5 h-[42px] px-5 rounded-full border border-[#F0E7DA] text-sm font-bold text-[#7A6A5E] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier le plan
            </button>
            <a
              href="/api/billing/renew"
              className="flex items-center gap-1.5 h-[42px] px-5 rounded-full bg-[#7D6AF8] text-white text-sm font-bold hover:bg-[#6552E8] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Renouveler
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm flex flex-col items-center"
        >
          <h3 className="text-lg font-extrabold text-[#3B2416] mb-4">Solde d&apos;étoiles</h3>
          <DonutChart value={starsBalance} total={starsTotal} />
          <p className="text-sm font-bold text-[#7A6A5E] mt-2">
            {starsBalance} / {starsTotal} étoiles
          </p>
          <div className="w-full mt-4 space-y-2">
            <button
              onClick={() => setShowBuyStars(true)}
              className="w-full flex items-center justify-center gap-2 h-[44px] rounded-full bg-[#7D6AF8] text-white text-sm font-bold hover:bg-[#6552E8] transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Acheter des étoiles
            </button>
          </div>
        </motion.div>
      </div>

      {/* Historique des paiements */}
      <PaymentHistoryTable payments={payments} />

      {/* Consommation */}
      <ConsumptionSection monthlyConsumption={monthlyConsumption} maxConsumption={maxConsumption} />

      {/* Dernières transactions + Moyen de paiement */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
        <TransactionsTimeline transactions={starsTransactions} />
        <PaymentMethodCard lastPayment={payments[0]} />
      </div>

      {/* Factures */}
      <InvoicesTable invoices={invoices} />

      <StarPurchaseModal open={showBuyStars} onClose={() => setShowBuyStars(false)} />
      <ChangePlanDialog open={showChangePlan} onClose={() => setShowChangePlan(false)} currentPlan={account?.plan || "free"} />
      <SubscribeDialog open={showSubscribe} onClose={() => setShowSubscribe(false)} currentPlan={account?.plan} />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  badge,
  badgeColor,
  progress,
  progressValue,
  subtext,
  cta,
  ctaAction,
  index,
}: {
  icon: typeof Wallet;
  title: string;
  value: string;
  badge?: string;
  badgeColor?: string;
  progress?: boolean;
  progressValue?: number;
  subtext?: string;
  cta?: string;
  ctaAction?: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-[20px] bg-white border border-[#F0E7DA] p-5 shadow-sm flex flex-col justify-between h-[120px]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#FFF5CC] flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-[#FFB300]" />
          </div>
          <span className="text-sm font-semibold text-[#7A6A5E]">{title}</span>
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor === "green" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-[28px] font-extrabold text-[#3B2416] leading-none">{value}</p>
        {subtext && <p className="text-xs font-semibold text-green-600 mt-0.5">{subtext}</p>}
        {progress && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-[#F0E7DA] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressValue || 0, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 + index * 0.1 }}
                className="h-full rounded-full bg-[#FFD95C]"
              />
            </div>
            {cta && (
              <button
                onClick={ctaAction}
                className="text-xs font-bold text-[#7D6AF8] hover:text-[#6552E8] whitespace-nowrap cursor-pointer"
              >
                {cta}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DonutChart({ value, total }: { value: number; total: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - (total > 0 ? value / total : 0));
  return (
    <div className="relative w-[140px] h-[140px] mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#F0E7DA" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#FFD95C"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Star className="w-6 h-6 text-[#FFB300] fill-[#FFB300]" />
        <span className="text-xl font-extrabold text-[#3B2416]">{value}</span>
      </div>
    </div>
  );
}

function PaymentHistoryTable({ payments }: { payments: BillingData["payments"] }) {
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Aucun paiement"
        message="Vos paiements apparaîtront ici dès que vous achetez un plan ou des étoiles."
      />
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm"
    >
      <h3 className="text-lg font-extrabold text-[#3B2416] mb-4">Historique des paiements</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left text-xs font-bold text-[#7A6A5E] border-b border-[#F0E7DA]">
              <th className="pb-3">Date</th>
              <th className="pb-3">Référence</th>
              <th className="pb-3">Montant</th>
              <th className="pb-3">Méthode</th>
              <th className="pb-3">Statut</th>
              <th className="pb-3">Facture</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => {
              const badge = STATUS_BADGES[p.status] || STATUS_BADGES.pending;
              return (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-[#F0E7DA]/50 last:border-0"
                >
                  <td className="py-3 text-sm font-semibold text-[#3B2416]">{fmtDate(p.created_at)}</td>
                  <td className="py-3 text-sm font-semibold text-[#7A6A5E]">{p.invoice_number || p.transaction_id.slice(0, 12)}</td>
                  <td className="py-3 text-sm font-extrabold text-[#3B2416]">{fmtXof(p.amount)}</td>
                  <td className="py-3 text-sm font-semibold text-[#7A6A5E]">{p.provider}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3">
                    {p.receipt_url ? (
                      <a
                        href={p.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-[#7D6AF8] hover:text-[#6552E8] cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-[#B0A092]">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ConsumptionSection({
  monthlyConsumption,
  maxConsumption,
}: {
  monthlyConsumption: BillingData["monthlyConsumption"];
  maxConsumption: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm"
    >
      <h3 className="text-lg font-extrabold text-[#3B2416] mb-6">Consommation d&apos;étoiles (12 derniers mois)</h3>
      <div className="flex items-end gap-2 h-[160px]">
        {monthlyConsumption.map((m, i) => {
          const h = (m.total / maxConsumption) * 140;
          const label = new Date(`${m.month}-01`).toLocaleDateString("fr-FR", { month: "short" });
          return (
            <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: Math.max(h, 2) }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
                className="w-full max-w-[28px] rounded-t-lg bg-[#FFD95C]"
                title={`${m.total} étoiles`}
              />
              <span className="text-[9px] font-semibold text-[#7A6A5E] capitalize">{label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-[#F0E7DA]">
        <p className="text-sm font-bold text-[#3B2416]">
          <span className="text-[#7D6AF8]">{monthlyConsumption.reduce((a, m) => a + m.total, 0)} étoiles</span> consommées sur 12 mois
        </p>
      </div>
    </motion.div>
  );
}

function TransactionsTimeline({ transactions }: { transactions: BillingData["starsTransactions"] }) {
  if (transactions.length === 0) {
    return <EmptyState icon={Star} title="Aucune transaction" message="Vos dessins et achats apparaîtront ici." />;
  }
  // Grouper par jour
  const groups: Record<string, typeof transactions> = {};
  transactions.forEach((t) => {
    const day = new Date(t.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    (groups[day] ||= []).push(t);
  });
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm"
    >
      <h3 className="text-lg font-extrabold text-[#3B2416] mb-5">Dernières transactions</h3>
      <div className="space-y-5">
        {Object.entries(groups).map(([day, items]) => (
          <div key={day}>
            <p className="text-xs font-bold text-[#7A6A5E] uppercase tracking-wider mb-2">{day}</p>
            <div className="space-y-1">
              {items.map((t, i) => {
                const reasonLabel = TRANSACTION_LABELS[(t.reason as keyof typeof TRANSACTION_LABELS)] || t.reason;
                const icon = TRANSACTION_ICONS[(t.reason as keyof typeof TRANSACTION_ICONS)] || "Star";
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[#FFF9F2] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 bg-[#F5F0EB]">
                      <span>{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#3B2416] truncate">{reasonLabel}</p>
                      <p className="text-[11px] font-semibold text-[#7A6A5E]">
                        {new Date(t.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`text-sm font-extrabold shrink-0 ${t.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                      {t.amount > 0 ? "+" : ""}
                      {t.amount}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PaymentMethodCard({ lastPayment }: { lastPayment?: BillingData["payments"][number] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#1D9E75]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#3B2416]">Moyen de paiement</h3>
            <p className="text-[11px] font-semibold text-[#7A6A5E]">Paiement sécurisé</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">Connecté</span>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F5F0EB] mb-4">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#3B2416]">PD</span>
        </div>
        <div>
          <p className="text-sm font-bold text-[#3B2416]">Paiement sécurisé</p>
          <p className="text-[11px] font-semibold text-[#7A6A5E]">Orange Money, Moov Money</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs font-semibold text-[#7A6A5E]">
        <span>Dernière transaction</span>
        <span>{lastPayment ? fmtDate(lastPayment.created_at) : "—"}</span>
      </div>
    </motion.div>
  );
}

function InvoicesTable({ invoices }: { invoices: BillingData["invoices"] }) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Aucune facture"
        message="Vos factures PDF seront disponibles ici après chaque paiement."
      />
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm"
    >
      <h3 className="text-lg font-extrabold text-[#3B2416] mb-5">Factures</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {invoices.map((inv, i) => (
          <motion.div
            key={inv.invoice_number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="rounded-[16px] border border-[#F0E7DA] p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-full bg-[#F5F0EB] flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#7A6A5E]" />
              </div>
              {inv.receipt_url ? (
                <a
                  href={inv.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] text-[11px] font-bold hover:bg-[#7D6AF8]/20 transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  PDF
                </a>
              ) : (
                <span className="px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-400 text-[11px] font-bold">Indisponible</span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#7A6A5E]">{inv.invoice_number}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-[#7A6A5E]">{fmtDate(inv.created_at)}</span>
              <span className="text-sm font-extrabold text-[#3B2416]">{fmtXof(inv.amount)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, message }: { icon: typeof Receipt; title: string; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] bg-white border border-dashed border-[#F0E7DA] p-10 shadow-sm text-center"
    >
      <div className="w-12 h-12 rounded-full bg-[#F5F0EB] flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-[#7A6A5E]" />
      </div>
      <h4 className="text-base font-extrabold text-[#3B2416] mb-1">{title}</h4>
      <p className="text-xs font-semibold text-[#7A6A5E] max-w-xs mx-auto">{message}</p>
    </motion.div>
  );
}
