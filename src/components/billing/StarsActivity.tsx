"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronDown, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { TRANSACTION_LABELS, TRANSACTION_ICONS } from "@/lib/billing"
import type { StarsTransaction, TransactionType } from "@/lib/billing"

type FilterType = "all" | "credit" | "debit"

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "credit", label: "Crédits" },
  { value: "debit", label: "Consommations" },
]

function groupByDate(transactions: StarsTransaction[]): Record<string, StarsTransaction[]> {
  const groups: Record<string, StarsTransaction[]> = {}
  for (const tx of transactions) {
    const date = new Date(tx.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
    if (!groups[date]) groups[date] = []
    groups[date].push(tx)
  }
  return groups
}

function TransactionItem({ tx }: { tx: StarsTransaction }) {
  const isCredit = tx.type === "credit"
  const icon = TRANSACTION_ICONS[tx.reason] || "⭐"
  const label = TRANSACTION_LABELS[tx.reason] || tx.reason
  const time = new Date(tx.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3 px-4 rounded-[14px] hover:bg-[#FFF9F2] transition-colors"
    >
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0",
        isCredit ? "bg-green-100" : tx.reason === "bonus" || tx.reason === "reward" ? "bg-amber-100" : "bg-red-100"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#3B2416] truncate">{label}</p>
        <p className="text-xs font-semibold text-[#7A6A5E]">{time}</p>
      </div>
      <div className="text-right shrink-0">
        <span className={cn(
          "text-sm font-extrabold",
          isCredit ? "text-green-600" : "text-red-500"
        )}>
          {isCredit ? "+" : ""}{tx.amount}
        </span>
        <p className="text-[10px] font-semibold text-[#7A6A5E]">
          {tx.balance_after} ⭐
        </p>
      </div>
    </motion.div>
  )
}

interface StarsActivityProps {
  starsBalance?: number
}

export function StarsActivity({ starsBalance = 0 }: StarsActivityProps) {
  const [transactions, setTransactions] = useState<StarsTransaction[]>([])
  const [filter, setFilter] = useState<FilterType>("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const fetchHistory = useCallback(async (pageNum: number, append: boolean) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "20" })
      const res = await fetch(`/api/stars/history?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (append) {
        setTransactions((prev) => [...prev, ...(data.transactions || [])])
      } else {
        setTransactions(data.transactions || [])
      }
      setHasMore(data.pagination?.page < data.pagination?.pages)
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory(1, false)
  }, [])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchHistory(next, true)
  }

  const filtered = transactions.filter((tx) => {
    if (filter === "credit") return tx.type === "credit"
    if (filter === "debit") return tx.type === "debit"
    return true
  })

  const grouped = groupByDate(filtered)

  return (
    <div>
      <div className="sticky top-0 z-10 bg-[#FFF9F2] pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF5CC] border border-[#FFE08A]">
            <Star className="w-5 h-5 text-[#FFB300] fill-[#FFB300]" />
            <span className="text-lg font-extrabold text-[#3B2416]">{starsBalance} étoiles</span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 h-[44px] px-4 rounded-full border border-[#EFE7DB] bg-white text-sm font-bold text-[#7A6A5E] cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            Filtres
            <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 pb-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      "shrink-0 h-[40px] px-4 rounded-full text-sm font-bold border transition-colors cursor-pointer",
                      filter === f.value
                        ? "bg-[#6D4CFF] text-white border-[#6D4CFF]"
                        : "bg-white text-[#7A6A5E] border-[#EFE7DB]"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLoading && transactions.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#6D4CFF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#7A6A5E] font-bold">Aucune activité</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <h4 className="text-xs font-bold text-[#7A6A5E] uppercase tracking-wider mb-2 px-4">{date}</h4>
              <div className="space-y-0.5">
                {txs.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="flex items-center gap-2 h-[44px] px-6 rounded-full border border-[#EFE7DB] bg-white text-sm font-bold text-[#6D4CFF] hover:bg-[#6D4CFF]/5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[#6D4CFF] border-t-transparent rounded-full animate-spin" />
            ) : null}
            Voir plus
          </button>
        </div>
      )}
    </div>
  )
}
