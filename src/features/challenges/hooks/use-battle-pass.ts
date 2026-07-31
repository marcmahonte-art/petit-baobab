"use client"

import { useCallback, useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { useChallengesStore } from "../store/challenges-store"
import { loadBattlePassState, claimBattlePassReward, getClaimableTiers, battlePassProgress } from "../services/battle-pass-service"
import { getSeasonForDate } from "../services/season-service"
import { emitMissionReward } from "../rewards/rewards-engine"
import type { BattlePassState, BattlePassTier } from "../types"

export function useBattlePass(childId?: string, plan: string = "free") {
  const store = useChallengesStore()
  const [tiers, setTiers] = useState<{ free: BattlePassTier[]; premium: BattlePassTier[] }>({ free: [], premium: [] })
  const [claiming, setClaiming] = useState(false)

  const seasonId = getSeasonForDate().id
  const state = store.battlePass

  useEffect(() => {
    if (!childId) return
    const supabase = getSupabaseClient()
    void loadBattlePassState(supabase, childId, seasonId).then((loaded) => {
      if (loaded) store.setBattlePass(loaded)
    })
  }, [childId, seasonId, store])

  useEffect(() => {
    if (state) {
      setTiers(getClaimableTiers(state, plan))
    }
  }, [state, plan])

  const progress = state ? battlePassProgress(state, 0) : battlePassProgress(null, 0)

  const claimReward = useCallback(
    async (tier: BattlePassTier, track: "free" | "premium"): Promise<boolean> => {
      if (!childId || !state || claiming) return false
      setClaiming(true)
      try {
        const supabase = getSupabaseClient()
        const updated = await claimBattlePassReward(supabase, state, tier, track)
        store.setBattlePass(updated)
        const rewards = track === "premium" ? tier.premiumRewards : tier.freeRewards
        const stars = rewards.reduce((sum, r) => sum + (r.type === "stars" ? r.quantity : 0), 0)
        if (stars > 0) {
          await emitMissionReward({ xp: 0, stars }, childId)
        }
        return true
      } finally {
        setClaiming(false)
      }
    },
    [childId, state, claiming, store],
  )

  return {
    state,
    tiers,
    progress,
    seasonId,
    claiming,
    claimReward,
    isPremium: plan === "super-baobab",
  }
}
