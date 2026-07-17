"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBillingStore } from "@/stores/billing-store"
import { InvoiceButton } from "./InvoiceButton"
import type { Payment, PaymentStatus } from "@/lib/billing"

const STATUS_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "success", label: "Réussis" },
  { value: "pending", label: "En attente" },
  { value: "failed", label: "Échoués" },
]

const STATUS_BADGES: Record<PaymentStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  success: { label: "Réussi", icon: CheckCircle, color: "bg-green-100 text-green-700" },
  pending: { label: "En attente", icon: Clock, color: "bg-amber-100 text-amber-700" },
  failed: { label: "Échoué", icon: XCircle, color: "bg-red-100 text-red-700" },
  cancelled: { label: "Annulé", icon: Ban, color: "bg-gray-100 text-gray-600" },
}

function PaymentCard({ payment }: { payment: Payment }) {
  const badge = STATUS_BADGES[payment.status]
  const Icon = badge.icon
  const date = new Date(payment.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[16px] border border-[#EFE7DB] bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-extrabold text-[#3B2416]">{payment.plan}</h4>
          <p className="text-xs font-semibold text-[#7A6A5E] mt-0.5">{payment.provider} · {payment.transaction_id?.slice(0, 12)}...</p>
        </div>
        <span className="text-lg font-extrabold text-[#3B2416]">{payment.amount.toLocaleString()} FCFA</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold", badge.color)}>
            <Icon className="w-3.5 h-3.5" />
            {badge.label}
          </span>
          <span className="text-xs font-semibold text-[#7A6A5E]">{date}</span>
        </div>
        <InvoiceButton invoiceNumber={payment.invoice_number} receiptUrl={payment.receipt_url} />
      </div>
    </motion.div>
  )
}

export function PaymentHistory() {
  const {
    payments,
    paymentsPagination,
    paymentsStatus,
    paymentsSearch,
    isLoadingPayments,
    fetchPayments,
    setPaymentsStatus,
    setPaymentsSearch,
  } = useBillingStore()

  const [searchInput, setSearchInput] = useState(paymentsSearch)

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleSearch = () => {
    setPaymentsSearch(searchInput)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6A5E]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Numéro facture ou transaction..."
            className="w-full h-[46px] pl-10 pr-4 rounded-full border border-[#EFE7DB] bg-white text-sm font-medium text-[#3B2416] placeholder-[#7A6A5E]/60 focus-visible:ring-1 focus-visible:ring-[#FFD95C] outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setPaymentsStatus(f.value)}
              className={cn(
                "shrink-0 h-[46px] px-4 rounded-full text-sm font-bold border transition-colors cursor-pointer",
                paymentsStatus === f.value
                  ? "bg-[#6D4CFF] text-white border-[#6D4CFF]"
                  : "bg-white text-[#7A6A5E] border-[#EFE7DB] hover:border-[#6D4CFF]/30"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoadingPayments ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#6D4CFF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#7A6A5E] font-bold">Aucun paiement trouvé</p>
        </div>
      ) : (
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-[#7A6A5E] border-b border-[#EFE7DB]">
                <th className="pb-3 pl-4">Date</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Montant</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3">Méthode</th>
                <th className="pb-3">Facture</th>
                <th className="pb-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => {
                const badge = STATUS_BADGES[p.status]
                const Icon = badge.icon
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[#EFE7DB]/50 last:border-0"
                  >
                    <td className="py-3 pl-4 text-sm font-semibold text-[#3B2416] whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 text-sm font-bold text-[#3B2416]">{p.plan}</td>
                    <td className="py-3 text-sm font-extrabold text-[#3B2416]">{p.amount.toLocaleString()} FCFA</td>
                    <td className="py-3">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold", badge.color)}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-semibold text-[#7A6A5E]">{p.provider}</td>
                    <td className="py-3 text-xs font-semibold text-[#7A6A5E]">{p.invoice_number}</td>
                    <td className="py-3 pr-4">
                      <InvoiceButton invoiceNumber={p.invoice_number} receiptUrl={p.receipt_url} />
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoadingPayments && payments.length > 0 && (
        <div className="md:hidden flex flex-col gap-3 mt-4">
          {payments.map((p) => (
            <PaymentCard key={p.id} payment={p} />
          ))}
        </div>
      )}

      {paymentsPagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => fetchPayments(paymentsPagination.page - 1)}
            disabled={paymentsPagination.page <= 1}
            className="flex items-center gap-1 px-4 h-[44px] rounded-full border border-[#EFE7DB] bg-white text-sm font-bold text-[#3B2416] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Précédent
          </button>
          <span className="text-sm font-bold text-[#7A6A5E]">
            {paymentsPagination.page} / {paymentsPagination.pages}
          </span>
          <button
            onClick={() => fetchPayments(paymentsPagination.page + 1)}
            disabled={paymentsPagination.page >= paymentsPagination.pages}
            className="flex items-center gap-1 px-4 h-[44px] rounded-full border border-[#EFE7DB] bg-white text-sm font-bold text-[#3B2416] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
