"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CancelSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function CancelSubscriptionDialog({ open, onOpenChange, onConfirm }: CancelSubscriptionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    await onConfirm()
    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-[22px] max-w-md w-full p-6 shadow-xl"
          >
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#EFE7DB] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4 text-[#7A6A5E]" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-extrabold text-[#3B2416] mb-2">Annuler l&apos;abonnement</h3>
              <p className="text-sm font-semibold text-[#7A6A5E] mb-6">
                Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez l&apos;accès aux fonctionnalités premium à la fin de la période en cours.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-[48px] rounded-[14px] border-2 border-[#EFE7DB] text-sm font-bold text-[#7A6A5E] bg-white cursor-pointer"
                >
                  Conserver
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 h-[48px] rounded-[14px] text-sm font-bold text-white bg-red-500 hover:bg-red-600 cursor-pointer disabled:opacity-50",
                    isLoading && "flex items-center justify-center gap-2"
                  )}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Annuler"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
