"use client"

import { motion } from "framer-motion"
import { Star, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Subscription, PlanId } from "@/lib/billing"
import { PLAN_LABELS } from "@/lib/billing"

interface SubscriptionCardProps {
  subscription: Subscription | null
  accountPlan: string
  starsBalance: number
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  active: { label: "Actif", icon: CheckCircle, color: "text-green-600" },
  expired: { label: "Expiré", icon: AlertCircle, color: "text-red-500" },
  cancelled: { label: "Annulé", icon: Clock, color: "text-orange-500" },
  trial: { label: "Période d'essai", icon: Clock, color: "text-blue-500" },
}

export function SubscriptionCard({ subscription, accountPlan, starsBalance }: SubscriptionCardProps) {
  const planName = PLAN_LABELS[accountPlan as PlanId] || "Gratuit"
  const isFree = accountPlan === "free"
  const status = subscription?.status || (isFree ? "active" : "trial")
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.active
  const StatusIcon = statusConfig.icon

  const starsTotal = subscription?.stars_total || (accountPlan === "decouverte" ? 100 : accountPlan === "super_baobab" ? 250 : accountPlan === "ecole_pro" ? 1000 : 0)
  const progress = starsTotal > 0 ? (starsBalance / starsTotal) * 100 : 0

  const startedAt = subscription?.started_at ? new Date(subscription.started_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null
  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] md:rounded-[28px] border border-[#EFE7DB] bg-white p-5 md:p-8 shadow-sm"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold text-[#3B2416]">{planName}</h3>
          <div className="flex items-center gap-2 mt-2">
            <StatusIcon className={cn("w-5 h-5", statusConfig.color)} />
            <span className={cn("text-sm font-bold", statusConfig.color)}>{statusConfig.label}</span>
          </div>
        </div>
        {!isFree && subscription && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF5CC] border border-[#FFE08A]">
            <Star className="w-4 h-4 text-[#FFB300] fill-[#FFB300]" />
            <span className="text-sm font-extrabold text-[#3B2416]">{starsBalance}</span>
          </div>
        )}
      </div>

      {!isFree && starsTotal > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold text-[#7A6A5E]">Progression</span>
            <span className="font-extrabold text-[#3B2416]">{starsBalance} / {starsTotal} étoiles</span>
          </div>
          <div className="h-3 rounded-full bg-[#EFE7DB] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#FFD95C] to-[#FFB300]"
            />
          </div>
        </div>
      )}

      {startedAt && (
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-[14px] bg-[#FFF9F2]">
          <div>
            <span className="text-xs font-semibold text-[#7A6A5E]">Début</span>
            <p className="text-sm font-bold text-[#3B2416] mt-0.5">{startedAt}</p>
          </div>
          {expiresAt && (
            <div>
              <span className="text-xs font-semibold text-[#7A6A5E]">Expire le</span>
              <p className="text-sm font-bold text-[#3B2416] mt-0.5">{expiresAt}</p>
            </div>
          )}
        </div>
      )}

      {isFree && (
        <div className="p-4 rounded-[14px] bg-[#FFF5CC] border border-[#FFE08A] mb-6">
          <p className="text-sm font-bold text-[#3B2416]">
            Vous êtes actuellement sur le plan Gratuit. Passez à un plan payant pour profiter de toutes les fonctionnalités.
          </p>
        </div>
      )}
    </motion.div>
  )
}
