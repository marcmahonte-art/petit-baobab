import type { BattlePassState, BattlePassTier } from "../types"
import { BATTLE_PASS_TIERS } from "../constants"
import type { GameEventType } from "../../gamification/types"

type Supabase = ReturnType<typeof import("@/lib/supabase-client").getSupabaseClient>

const XP_PER_TIER = 100
const PREMIUM_PLAN = "super-baobab"

export function getBattlePassTier(level: number): BattlePassTier {
  return BATTLE_PASS_TIERS[Math.min(level, BATTLE_PASS_TIERS.length) - 1] ?? BATTLE_PASS_TIERS[BATTLE_PASS_TIERS.length - 1]
}

export function isPremium(plan: string): boolean {
  return plan === PREMIUM_PLAN
}

export function computeBattlePassXp(event: GameEventType): number {
  switch (event) {
    case "DRAWING_COMPLETED":
      return 25
    case "BOOK_CREATED":
      return 40
    case "GAME_COMPLETED":
      return 20
    case "QUIZ_COMPLETED":
      return 20
    case "MAGIC_DRAWING_CREATED":
      return 35
    case "COLORING_COMPLETED":
      return 20
    default:
      return 10
  }
}

export function battlePassProgress(
  state: BattlePassState | null,
  xp: number,
): { level: number; xpIntoLevel: number; xpToNext: number; progress: number; tier: BattlePassTier } {
  const currentLevel = state?.level ?? 1
  const currentXp = state?.xp ?? 0
  const totalXp = currentXp + xp
  const level = Math.min(Math.floor(totalXp / XP_PER_TIER) + 1, BATTLE_PASS_TIERS.length)
  const xpIntoLevel = totalXp % XP_PER_TIER
  return {
    level,
    xpIntoLevel,
    xpToNext: XP_PER_TIER - xpIntoLevel,
    progress: xpIntoLevel / XP_PER_TIER,
    tier: getBattlePassTier(level),
  }
}

export async function createBattlePassState(supabase: Supabase, childId: string, seasonId: string): Promise<BattlePassState> {
  const state: BattlePassState = {
    id: `bp_${childId}_${seasonId}`,
    child_id: childId,
    season_id: seasonId,
    level: 1,
    xp: 0,
    premium: false,
    claimedFree: [],
    claimedPremium: [],
  }
  await supabase.from("battle_pass_state").upsert({
    child_id: childId,
    season_id: seasonId,
    level: 1,
    xp: 0,
    premium: false,
    claimed_free: [],
    claimed_premium: [],
  }, { onConflict: "child_id,season_id" })
  return state
}

export async function loadBattlePassState(supabase: Supabase, childId: string, seasonId: string): Promise<BattlePassState | null> {
  const { data } = await supabase.from("battle_pass_state").select("*").eq("child_id", childId).eq("season_id", seasonId).maybeSingle()
  if (!data) return null
  const row = data as Record<string, unknown>
  return {
    id: String(row.id),
    child_id: String(row.child_id),
    season_id: String(row.season_id),
    level: Number(row.level),
    xp: Number(row.xp),
    premium: Boolean(row.premium),
    claimedFree: Array.isArray(row.claimed_free) ? (row.claimed_free as string[]) : [],
    claimedPremium: Array.isArray(row.claimed_premium) ? (row.claimed_premium as string[]) : [],
  }
}

export async function addBattlePassXp(
  supabase: Supabase,
  state: BattlePassState,
  xp: number,
): Promise<BattlePassState> {
  const totalXp = state.xp + xp
  const level = Math.min(Math.floor(totalXp / XP_PER_TIER) + 1, BATTLE_PASS_TIERS.length)
  const updated: BattlePassState = { ...state, xp: totalXp % XP_PER_TIER, level }
  await supabase
    .from("battle_pass_state")
    .upsert({
      child_id: state.child_id,
      season_id: state.season_id,
      level: updated.level,
      xp: updated.xp,
      premium: state.premium,
    })
  return updated
}

export async function claimBattlePassReward(
  supabase: Supabase,
  state: BattlePassState,
  tier: BattlePassTier,
  track: "free" | "premium",
): Promise<BattlePassState> {
  const list = track === "free" ? [...state.claimedFree] : [...state.claimedPremium]
  const key = `${tier.level}_${track}`
  if (list.includes(key)) return state

  list.push(key)
  const updated: BattlePassState = {
    ...state,
    claimedFree: track === "free" ? list : state.claimedFree,
    claimedPremium: track === "premium" ? list : state.claimedPremium,
  }

  await supabase.from("battle_pass_state").upsert({
    child_id: state.child_id,
    season_id: state.season_id,
    claimed_free: updated.claimedFree,
    claimed_premium: updated.claimedPremium,
  })
  return updated
}

export function getClaimableTiers(state: BattlePassState | null, plan: string): { free: BattlePassTier[]; premium: BattlePassTier[] } {
  const level = state?.level ?? 1
  const tiers = BATTLE_PASS_TIERS.filter((t) => t.level <= level)
  const claimedFree = new Set(state?.claimedFree ?? [])
  const claimedPremium = new Set(state?.claimedPremium ?? [])

  return {
    free: tiers.filter((t) => !claimedFree.has(`${t.level}_free`)),
    premium: isPremium(plan) ? tiers.filter((t) => t.premiumRewards.length > 0 && !claimedPremium.has(`${t.level}_premium`)) : [],
  }
}
