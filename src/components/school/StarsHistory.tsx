// src/components/school/StarsHistory.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";

interface StarsTransaction {
  id: string;
  amount: number;
  reason: string;
  reason_label: string;
  student_name: string | null;
  reference_id: string | null;
  created_at: string;
}

interface StarsHistoryResponse {
  transactions: StarsTransaction[];
  pagination: { page: number; limit: number; total: number; has_more: boolean };
  summary: { total_debited: number; total_credited: number; balance: number };
}

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function StarsHistory() {
  const [data, setData] = useState<StarsHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async (p: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/school/stars/history?page=${p}&limit=${PAGE_SIZE}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Impossible de charger l'historique.");
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(page);
  }, [fetchHistory, page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.pagination.total / PAGE_SIZE)) : 1;

  return (
    <section className="bg-white rounded-2xl border border-[#F0E7DA] shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[#F59E0B]" />
          <h2 className="text-lg font-extrabold text-[#3B2416]">Historique des étoiles</h2>
        </div>
        <button
          onClick={() => fetchHistory(page)}
          className="p-2 rounded-lg hover:bg-[#F5F0EB] transition-colors cursor-pointer"
          aria-label="Rafraîchir"
        >
          <RefreshCw className={`w-4 h-4 text-[#7A6A5E] ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#FFFDF7] rounded-xl p-3 border border-[#F0E7DA] text-center">
            <p className="text-xl font-black text-[#3B2416]">{data.summary.balance}</p>
            <p className="text-[11px] text-[#7A6A5E] font-medium">Solde actuel</p>
          </div>
          <div className="bg-[#FFFDF7] rounded-xl p-3 border border-[#F0E7DA] text-center">
            <p className="text-xl font-black text-[#10B981]">+{data.summary.total_credited}</p>
            <p className="text-[11px] text-[#7A6A5E] font-medium">Crédités</p>
          </div>
          <div className="bg-[#FFFDF7] rounded-xl p-3 border border-[#F0E7DA] text-center">
            <p className="text-xl font-black text-[#EF4444]">{data.summary.total_debited}</p>
            <p className="text-[11px] text-[#7A6A5E] font-medium">Débités</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[#F5F0EB] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && data && data.transactions.length === 0 && (
        <div className="text-center text-[#7A6A5E] text-sm py-6">
          Aucune transaction pour le moment.
        </div>
      )}

      {!loading && !error && data && data.transactions.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {data.transactions.map((tx, idx) => {
              const isCredit = tx.amount >= 0;
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#F0E7DA] bg-[#FFFDF7]"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#3B2416] text-sm truncate">{tx.reason_label}</p>
                    <p className="text-xs text-[#7A6A5E]">
                      {tx.student_name ? `Élève : ${tx.student_name} · ` : ""}
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 font-black text-sm ${
                      isCredit ? "text-[#10B981]" : "text-[#EF4444]"
                    }`}
                  >
                    {isCredit ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {isCredit ? "+" : ""}
                    {tx.amount} ⭐
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[#7A6A5E] font-medium">
              {data.pagination.total} transaction{data.pagination.total > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-[#F0E7DA] bg-white flex items-center justify-center disabled:opacity-40 hover:bg-[#F5F0EB] transition-colors cursor-pointer text-sm font-bold text-[#3B2416]"
              >
                ←
              </button>
              <span className="text-xs font-bold text-[#3B2416] px-2">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-[#F0E7DA] bg-white flex items-center justify-center disabled:opacity-40 hover:bg-[#F5F0EB] transition-colors cursor-pointer text-sm font-bold text-[#3B2416]"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
