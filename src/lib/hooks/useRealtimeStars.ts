"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Abonne le client au canal Supabase Realtime sur accounts.stars_balance.
 * Dès qu'une mise à jour du solde survient pour l'account donné, le store
 * d'auth (parent OU élève) est rafraîchi en temps réel, remplaçant le
 * polling 30s côté enseignant et comblant l'absence de MAJ côté élève.
 *
 * @param accountId Identifiant du compte à surveiller (école ou famille).
 *                  Si null, l'abonnement n'est pas créé.
 * @param onBalance Callback optionnel recevant le nouveau solde (ex: pour
 *                  rafraîchir un autre store que useAuthStore).
 */
export function useRealtimeStars(
  accountId: string | null | undefined,
  onBalance?: (balance: number) => void
) {
  const setStarsBalance = useAuthStore((s) => s.setStarsBalance);

  useEffect(() => {
    if (!accountId) return;

    const channel = supabase
      .channel(`stars-balance-${accountId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "accounts",
          filter: `id=eq.${accountId}`,
        },
        (payload: any) => {
          const newBalance = payload?.new?.stars_balance;
          if (typeof newBalance === "number") {
            setStarsBalance(newBalance);
            onBalance?.(newBalance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId, setStarsBalance, onBalance]);
}
