"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useBillingStore } from "@/stores/billing-store"
import { Sidebar } from "@/components/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Receipt, Star, ArrowLeft, ShoppingCart } from "lucide-react"
import StarPurchaseModal from "@/components/school/StarPurchaseModal"
import { cn } from "@/lib/utils"
import { SubscriptionCard } from "@/components/billing/SubscriptionCard"
import { SubscriptionStatus } from "@/components/billing/SubscriptionStatus"
import { PaymentHistory } from "@/components/billing/PaymentHistory"
import { StarsActivity } from "@/components/billing/StarsActivity"
import Image from "next/image"

type Tab = "subscription" | "payments" | "stars"

const TABS: { id: Tab; label: string; icon: typeof CreditCard }[] = [
  { id: "subscription", label: "Mon abonnement", icon: CreditCard },
  { id: "payments", label: "Paiements", icon: Receipt },
  { id: "stars", label: "Étoiles", icon: Star },
]

function BillingContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("subscription")
  const [showBuyStars, setShowBuyStars] = useState(false)
  const {
    subscription,
    accountPlan,
    starsBalance,
    isLoadingSubscription,
    fetchSubscription,
    fetchPlans,
    plans,
  } = useBillingStore()

  useEffect(() => {
    fetchSubscription()
    fetchPlans()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 w-full select-none"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/parents")}
          className="w-9 h-9 rounded-full bg-white border border-[#EFE7DB] flex items-center justify-center cursor-pointer shrink-0 hover:bg-[#FFF9F2]"
        >
          <ArrowLeft className="w-4 h-4 text-[#7A6A5E]" />
        </button>
        <div>
          <h1 className="text-[22px] sm:text-[28px] md:text-[32px] font-extrabold text-[#3B2416] leading-tight">
            Facturation
          </h1>
          <p className="text-[13px] font-semibold text-[#7A6A5E]">
            Gérez votre abonnement, vos paiements et vos étoiles
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-[16px] bg-white border border-[#EFE7DB] shadow-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center justify-center gap-2 flex-1 h-[48px] rounded-[12px] text-sm font-bold transition-all cursor-pointer",
                activeTab === tab.id
                  ? "bg-[#6D4CFF] text-white shadow-sm"
                  : "text-[#7A6A5E] hover:text-[#3B2416] hover:bg-[#FFF9F2]"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "subscription" && (
          <motion.div
            key="subscription"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            {isLoadingSubscription ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#6D4CFF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <SubscriptionCard
                  subscription={subscription}
                  accountPlan={accountPlan}
                  starsBalance={starsBalance}
                />
                <SubscriptionStatus
                  subscription={subscription}
                  accountPlan={accountPlan}
                />

                {plans.length > 0 && (
                  <div>
                    <h3 className="text-lg font-extrabold text-[#3B2416] mb-4">Nos offres</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {plans.map((plan, i) => {
                        const isActive = accountPlan === plan.id
                        return (
                          <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                              "relative rounded-[20px] border bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
                              isActive ? "border-[#6D4CFF] ring-2 ring-[#6D4CFF]/10" : "border-[#EFE7DB]"
                            )}
                          >
                            {isActive && (
                              <div className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-[#6D4CFF] text-white text-[10px] font-extrabold">
                                Actuel
                              </div>
                            )}
                            <h4 className="text-base font-extrabold text-[#3B2416] mb-1">{plan.name}</h4>
                            <p className="text-2xl font-extrabold text-[#3B2416] mb-3">
                              {plan.price}
                              <span className="text-xs font-semibold text-[#7A6A5E]"> {plan.period}</span>
                            </p>
                            <div className="flex items-center gap-1.5 mb-4">
                              <span className="text-sm font-bold text-[#7A6A5E]">{plan.credits}</span>
                              <Star className="w-3.5 h-3.5 text-[#FFB300] fill-[#FFB300]" />
                              <span className="text-xs font-semibold text-[#7A6A5E]">{plan.creditsLabel}</span>
                            </div>
                            <ul className="flex flex-col gap-2 mb-5">
                              {plan.features.map((f, fi) => (
                                <li key={fi} className="flex items-start gap-2 text-xs font-semibold text-[#64748B]">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {activeTab === "payments" && (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PaymentHistory />
          </motion.div>
        )}

        {activeTab === "stars" && (
          <motion.div
            key="stars"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#3B2416]">Acheter des étoiles</h3>
                <p className="text-xs font-semibold text-[#7A6A5E]">
                  Rechargez votre solde d'étoiles
                </p>
              </div>
              <button
                onClick={() => setShowBuyStars(true)}
                className="flex items-center gap-1.5 h-[44px] px-5 rounded-full bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-sm shadow-sm cursor-pointer transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                Acheter
              </button>
            </div>

            {isLoadingSubscription ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#6D4CFF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#EFE7DB] flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FFF5CC] flex items-center justify-center">
                    <Star className="w-6 h-6 text-[#FFB300] fill-[#FFB300]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#7A6A5E]">Solde actuel</p>
                    <p className="text-xl font-extrabold text-[#3B2416]">{starsBalance} étoiles</p>
                  </div>
                </div>
                <StarsActivity starsBalance={starsBalance} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <StarPurchaseModal open={showBuyStars} onClose={() => setShowBuyStars(false)} />
    </motion.div>
  )
}

export default function BillingPage() {
  const router = useRouter()
  const { user, isInitialized, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/login")
    }
  }, [isInitialized, user, router])

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#3B2416] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#3B2416] font-bold text-sm">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <BillingContent />
        </main>
      </div>

      <MobileBottomNav />

      <div className="absolute bottom-0 left-0 right-0 w-full z-0 hidden lg:block select-none pointer-events-none">
        <Image
          src="/illustrations/footer_bas.webp"
          alt="Grass Footer"
          width={1920}
          height={346}
          className="w-full h-auto block"
          priority
        />
      </div>
    </div>
  )
}
