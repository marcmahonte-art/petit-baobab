"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Wallet,
  Star,
  Calendar,
  Receipt,
  ShoppingCart,
  Download,
  FileText,
  CreditCard,
  HelpCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react"
import { useBillingStore } from "@/stores/billing-store"
import StarPurchaseModal from "@/components/school/StarPurchaseModal"
import { PLAN_LABELS } from "@/lib/billing"
import type { PlanId, PaymentStatus } from "@/lib/billing"
import Image from "next/image"

const STAGGER = 0.05

const STATUS_BADGES: Record<PaymentStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  success: { label: "Payé", icon: CheckCircle, color: "bg-green-100 text-green-700" },
  pending: { label: "En attente", icon: Clock, color: "bg-amber-100 text-amber-700" },
  failed: { label: "Échoué", icon: XCircle, color: "bg-red-100 text-red-700" },
  cancelled: { label: "Annulé", icon: XCircle, color: "bg-gray-100 text-gray-600" },
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
  icon: typeof Wallet
  title: string
  value: string
  badge?: string
  badgeColor?: string
  progress?: boolean
  progressValue?: number
  subtext?: string
  cta?: string
  ctaAction?: () => void
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * STAGGER, duration: 0.3 }}
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
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              badgeColor === "green"
                ? "bg-green-100 text-green-700"
                : badgeColor === "yellow"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
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
  )
}

function DonutChart({ value, total }: { value: number; total: number }) {
  const percentage = total > 0 ? value / total : 0
  const circumference = 2 * Math.PI * 54
  const offset = circumference * (1 - percentage)

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
  )
}

function ConsumptionChart() {
  const [period, setPeriod] = useState<"7d" | "30d" | "12m">("30d")
  const data = {
    "7d": [
      { day: "Lun", livres: 8, dessins: 12, histoires: 4, activites: 6 },
      { day: "Mar", livres: 6, dessins: 15, histoires: 3, activites: 8 },
      { day: "Mer", livres: 10, dessins: 10, histoires: 5, activites: 4 },
      { day: "Jeu", livres: 7, dessins: 18, histoires: 2, activites: 7 },
      { day: "Ven", livres: 12, dessins: 14, histoires: 6, activites: 5 },
      { day: "Sam", livres: 4, dessins: 8, histoires: 2, activites: 3 },
      { day: "Dim", livres: 3, dessins: 6, histoires: 1, activites: 2 },
    ],
    "30d": [
      { day: "S1", livres: 45, dessins: 60, histoires: 20, activites: 30 },
      { day: "S2", livres: 38, dessins: 55, histoires: 18, activites: 25 },
      { day: "S3", livres: 50, dessins: 70, histoires: 22, activites: 35 },
      { day: "S4", livres: 42, dessins: 65, histoires: 15, activites: 28 },
    ],
    "12m": [
      { day: "Août", livres: 120, dessins: 180, histoires: 50, activites: 90 },
      { day: "Sep", livres: 150, dessins: 220, histoires: 65, activites: 110 },
      { day: "Oct", livres: 140, dessins: 200, histoires: 55, activites: 100 },
      { day: "Nov", livres: 160, dessins: 240, histoires: 70, activites: 120 },
      { day: "Déc", livres: 130, dessins: 190, histoires: 60, activites: 95 },
      { day: "Jan", livres: 170, dessins: 250, histoires: 75, activites: 130 },
    ],
  }

  const chartData = data[period]
  const maxVal = Math.max(...chartData.flatMap((d) => [d.livres, d.dessins, d.histoires, d.activites]))
  const categories = [
    { key: "dessins" as const, label: "Dessins", color: "#7D6AF8" },
    { key: "livres" as const, label: "Livres", color: "#FFB300" },
    { key: "histoires" as const, label: "Histoires", color: "#FF5E83" },
    { key: "activites" as const, label: "Activités", color: "#1D9E75" },
  ]

  const totalConsumed = chartData.reduce((acc, d) => acc + d.dessins + d.livres + d.histoires + d.activites, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-extrabold text-[#3B2416]">Consommation d'étoiles</h3>
        <div className="flex gap-1 p-0.5 rounded-full bg-[#F5F0EB]">
          {(["7d", "30d", "12m"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                period === p ? "bg-white text-[#3B2416] shadow-sm" : "text-[#7A6A5E] hover:text-[#3B2416]"
              }`}
            >
              {p === "7d" ? "7 jours" : p === "30d" ? "30 jours" : "12 mois"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        {categories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-xs font-semibold text-[#7A6A5E]">{cat.label}</span>
          </div>
        ))}
      </div>

      <div className="relative h-[200px]">
        <svg className="w-full h-full" viewBox={`0 0 ${chartData.length * 80} 200`} preserveAspectRatio="none">
          {chartData.map((d, i) => {
            const x = i * 80 + 40
            const dessinsH = (d.dessins / maxVal) * 160
            const livresH = (d.livres / maxVal) * 160
            const histoiresH = (d.histoires / maxVal) * 160
            const activitesH = (d.activites / maxVal) * 160
            const stack = [dessinsH, livresH, histoiresH, activitesH]
            const colors = ["#7D6AF8", "#FFB300", "#FF5E83", "#1D9E75"]
            let yOffset = 200

            return (
              <g key={i}>
                {stack.map((h, si) => {
                  yOffset -= h
                  return (
                    <motion.rect
                      key={si}
                      x={x - 12}
                      y={yOffset}
                      width={24}
                      height={h}
                      rx={4}
                      fill={colors[si]}
                      initial={{ height: 0, y: 200 }}
                      animate={{ height: h, y: yOffset }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.05 + si * 0.05, ease: "easeOut" }}
                    />
                  )
                })}
                <text x={x} y={195} textAnchor="middle" className="text-[10px]" fill="#7A6A5E" fontSize="10">
                  {d.day}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 pt-4 border-t border-[#F0E7DA]">
        <p className="text-sm font-bold text-[#3B2416]">
          <span className="text-[#7D6AF8]">{totalConsumed} étoiles</span> utilisées {period === "7d" ? "cette semaine" : period === "30d" ? "ce mois" : "cette année"}
        </p>
      </div>
    </motion.div>
  )
}

function TransactionsTimeline() {
  const transactions = useMemo(
    () => [
      { date: "Aujourd'hui", items: [
        { time: "14:30", desc: "Création d'un livre", stars: -15, color: "bg-red-100" },
        { time: "10:15", desc: "Achat d'étoiles", stars: 100, color: "bg-green-100" },
      ]},
      { date: "Hier", items: [
        { time: "16:45", desc: "Coloriage IA", stars: -3, color: "bg-red-100" },
        { time: "09:20", desc: "Dessin magique", stars: -5, color: "bg-red-100" },
      ]},
      { date: "22 juil. 2026", items: [
        { time: "11:00", desc: "Récompense quotidienne", stars: 10, color: "bg-amber-100" },
      ]},
    ],
    []
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm"
    >
      <h3 className="text-lg font-extrabold text-[#3B2416] mb-5">Dernières transactions</h3>
      <div className="space-y-5">
        {transactions.map((group) => (
          <div key={group.date}>
            <p className="text-xs font-bold text-[#7A6A5E] uppercase tracking-wider mb-2">{group.date}</p>
            <div className="space-y-1">
              {group.items.map((item, i) => (
                <motion.div
                  key={`${group.date}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[#FFF9F2] transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${item.color}`}>
                    <Star className="w-3.5 h-3.5 text-[#FFB300]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#3B2416] truncate">{item.desc}</p>
                    <p className="text-[11px] font-semibold text-[#7A6A5E]">{item.time}</p>
                  </div>
                  <span
                    className={`text-sm font-extrabold shrink-0 ${
                      item.stars > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {item.stars > 0 ? "+" : ""}{item.stars}★
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function InvoiceGrid() {
  const invoices = useMemo(
    () => [
      { number: "INV-00125", date: "01 juil. 2026", amount: "25 000 FCFA" },
      { number: "INV-00120", date: "01 juin 2026", amount: "25 000 FCFA" },
      { number: "INV-00115", date: "01 mai 2026", amount: "25 000 FCFA" },
    ],
    []
  )

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
            key={inv.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="rounded-[16px] border border-[#F0E7DA] p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-full bg-[#F5F0EB] flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#7A6A5E]" />
              </div>
              <a
                href="#"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] text-[11px] font-bold hover:bg-[#7D6AF8]/20 transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" />
                PDF
              </a>
            </div>
            <p className="text-xs font-semibold text-[#7A6A5E]">{inv.number}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-[#7A6A5E]">{inv.date}</span>
              <span className="text-sm font-extrabold text-[#3B2416]">{inv.amount}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function PaymentMethodCard() {
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
            <p className="text-[11px] font-semibold text-[#7A6A5E]">Connecté</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
          Connecté
        </span>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F5F0EB] mb-4">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#3B2416]">PD</span>
        </div>
        <div>
          <p className="text-sm font-bold text-[#3B2416]">PayDunya</p>
          <p className="text-[11px] font-semibold text-[#7A6A5E]">Orange Money, Wave, Moov Money, Carte</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 h-[38px] px-4 rounded-full border border-[#F0E7DA] text-sm font-bold text-[#7A6A5E] hover:bg-[#F5F0EB] transition-colors cursor-pointer">
          <Pencil className="w-3.5 h-3.5" />
          Modifier
        </button>
        <button className="flex items-center gap-1.5 h-[38px] px-4 rounded-full border border-red-200 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer
        </button>
        <button className="flex items-center gap-1.5 h-[38px] px-4 rounded-full bg-[#7D6AF8] text-sm font-bold text-white hover:bg-[#6552E8] transition-colors cursor-pointer ml-auto">
          <Plus className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </div>
    </motion.div>
  )
}

function HelpSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm text-center"
    >
      <div className="mb-4">
        <Image
          src="/illustrations/awa.webp"
          alt="Aide Petit Baobab"
          width={120}
          height={120}
          className="mx-auto w-auto h-[100px] object-contain"
        />
      </div>
      <h4 className="text-base font-extrabold text-[#3B2416] mb-1">Besoin d'aide ?</h4>
      <p className="text-xs font-semibold text-[#7A6A5E] mb-4">
        Notre équipe vous accompagne pour toutes vos questions.
      </p>
      <a
        href="mailto:support@petitbaobab.com"
        className="inline-flex items-center gap-2 h-[44px] px-6 rounded-full bg-[#7D6AF8] text-white text-sm font-bold hover:bg-[#6552E8] transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
        Contacter le support
      </a>
    </motion.div>
  )
}

export default function FacturationClient() {
  const [showBuyStars, setShowBuyStars] = useState(false)
  const {
    subscription,
    accountPlan,
    starsBalance,
    isLoadingSubscription,
    fetchSubscription,
    fetchPlans,
  } = useBillingStore()

  useEffect(() => {
    fetchSubscription()
    fetchPlans("school")
  }, [])

  const planName = PLAN_LABELS[accountPlan as PlanId] || "École Pro"
  const starsTotal = subscription?.stars_total || 1000
  const progressValue = starsTotal > 0 ? (starsBalance / starsTotal) * 100 : 0

  const expiresAt = subscription?.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "01 août 2026"

  const startedAt = subscription?.started_at
    ? new Date(subscription.started_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "01 juil. 2026"

  const status = subscription?.status || "active"

  const recentPayments = useMemo(
    () => [
      { id: "1", plan: "École Pro", amount: 25000, status: "success" as PaymentStatus, date: "01/07/2026", ref: "INV-202607-00001", provider: "PayDunya" },
      { id: "2", plan: "École Pro", amount: 25000, status: "success" as PaymentStatus, date: "01/06/2026", ref: "INV-202606-00003", provider: "PayDunya" },
      { id: "3", plan: "Pack 500 ★", amount: 8000, status: "pending" as PaymentStatus, date: "15/06/2026", ref: "INV-202606-00002", provider: "PayDunya" },
    ],
    []
  )

  const features = [
    "1 000 étoiles / mois",
    "Livres illimités",
    "Dessins illimités",
    "Histoires",
    "Activités",
    "Gestion multi-classes",
    "Support prioritaire",
  ]

  if (isLoadingSubscription) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7D6AF8] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-[#7A6A5E]">Chargement de votre facturation...</span>
        </div>
      </div>
    )
  }

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
            Facturation & Abonnement
          </h1>
          <p className="text-[15px] font-semibold text-[#7A6A5E] mt-0.5">
            Gérez votre abonnement, vos paiements et votre consommation d'étoiles.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowBuyStars(true)}
            className="flex items-center gap-1.5 h-[44px] px-5 rounded-full bg-[#7D6AF8] text-white text-sm font-bold hover:bg-[#6552E8] shadow-sm transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            Acheter des étoiles
          </button>
          <button className="flex items-center gap-1.5 h-[44px] px-5 rounded-full border border-[#F0E7DA] bg-white text-sm font-bold text-[#7A6A5E] hover:bg-[#F5F0EB] transition-all cursor-pointer">
            <Download className="w-4 h-4" />
            Télécharger une facture
          </button>
        </div>
      </motion.div>

      {/* Section 1: Résumé - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Wallet}
          title="Plan actuel"
          value={planName}
          badge="Actif"
          badgeColor="green"
          index={0}
        />
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
        <SummaryCard
          icon={Calendar}
          title="Prochain renouvellement"
          value={expiresAt}
          index={2}
        />
        <SummaryCard
          icon={Receipt}
          title="Montant payé ce mois"
          value="25 000 FCFA"
          subtext="Paiement réussi"
          index={3}
        />
      </div>

      {/* Sections 2+3: Plan actif + Solde d'étoiles */}
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
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
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
          <ul className="my-4 space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm font-semibold text-[#3B2416]">
                <CheckCircle className="w-4 h-4 text-[#1D9E75] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-4 p-4 rounded-[14px] bg-[#FFF9F2] mb-4">
            <div>
              <span className="text-[11px] font-semibold text-[#7A6A5E]">Date d'activation</span>
              <p className="text-sm font-bold text-[#3B2416]">{startedAt}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#7A6A5E]">Date d'expiration</span>
              <p className="text-sm font-bold text-[#3B2416]">{expiresAt}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#7A6A5E]">Renouvellement</span>
              <p className="text-sm font-bold text-[#3B2416]">Automatique</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 h-[42px] px-5 rounded-full border border-[#F0E7DA] text-sm font-bold text-[#7A6A5E] hover:bg-[#F5F0EB] transition-colors cursor-pointer">
              Modifier le plan
            </button>
            <button className="flex items-center gap-1.5 h-[42px] px-5 rounded-full bg-[#7D6AF8] text-white text-sm font-bold hover:bg-[#6552E8] transition-colors cursor-pointer">
              Renouveler
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm flex flex-col items-center"
        >
          <h3 className="text-lg font-extrabold text-[#3B2416] mb-4">Solde d'étoiles</h3>
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
            <button className="w-full flex items-center justify-center gap-2 h-[44px] rounded-full border border-[#F0E7DA] text-sm font-bold text-[#7A6A5E] hover:bg-[#F5F0EB] transition-colors cursor-pointer">
              Voir l'historique
            </button>
          </div>
        </motion.div>
      </div>

      {/* Section 4: Historique des paiements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-[#3B2416]">Historique des paiements</h3>
        </div>
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
              {recentPayments.map((p, i) => {
                const badge = STATUS_BADGES[p.status]
                const Icon = badge.icon
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-[#F0E7DA]/50 last:border-0"
                  >
                    <td className="py-3 text-sm font-semibold text-[#3B2416]">{p.date}</td>
                    <td className="py-3 text-sm font-semibold text-[#7A6A5E]">{p.ref}</td>
                    <td className="py-3 text-sm font-extrabold text-[#3B2416]">{p.amount.toLocaleString("fr-FR")} FCFA</td>
                    <td className="py-3 text-sm font-semibold text-[#7A6A5E]">{p.provider}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="flex items-center gap-1 text-xs font-bold text-[#7D6AF8] hover:text-[#6552E8] cursor-pointer">
                        <Download className="w-3 h-3" />
                        Télécharger PDF
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Section 5: Consommation d'étoiles */}
      <ConsumptionChart />

      {/* Section 6+8: Dernières transactions + Moyen de paiement */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
        <TransactionsTimeline />
        <div className="space-y-4">
          <PaymentMethodCard />
        </div>
      </div>

      {/* Section 7: Factures */}
      <InvoiceGrid />

      {/* Section Aide */}
      <HelpSection />

      {/* Star Purchase Modal */}
      <StarPurchaseModal open={showBuyStars} onClose={() => setShowBuyStars(false)} />
    </div>
  )
}
