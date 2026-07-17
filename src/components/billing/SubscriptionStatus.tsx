"use client"

import { CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Subscription } from "@/lib/billing"

interface SubscriptionStatusProps {
  subscription: Subscription | null
  accountPlan: string
}

export function SubscriptionStatus({ subscription, accountPlan }: SubscriptionStatusProps) {
  const isFree = accountPlan === "free"
  if (isFree) return null

  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null
  const isExpiringSoon = expiresAt && expiresAt.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && expiresAt > new Date()

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-[12px] text-sm font-bold",
      isExpiringSoon ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-700"
    )}>
      {isExpiringSoon ? (
        <AlertTriangle className="w-5 h-5 shrink-0" />
      ) : (
        <CheckCircle className="w-5 h-5 shrink-0" />
      )}
      {isExpiringSoon
        ? `Votre abonnement expire le ${expiresAt?.toLocaleDateString("fr-FR")}`
        : "Votre abonnement est actif"}
    </div>
  )
}
