import type { GameEventType, Difficulty, PlanType, Reward } from "./types"
import {
  XP_PER_EVENT,
  STARS_PER_EVENT,
  DIFFICULTY_MULTIPLIER,
  PLAN_XP_BONUS,
  PLAN_STARS_MULTIPLIER,
  DURATION_BONUS_THRESHOLD,
  DURATION_BONUS_XP,
  DURATION_BONUS_STARS,
} from "./constants"

export interface RewardInput {
  event: GameEventType
  difficulty?: Difficulty
  duration?: number
  plan: PlanType
}

export class RewardEngine {
  calculate(input: RewardInput): Reward {
    const { event, difficulty = "easy", duration = 0, plan } = input

    const baseXp = XP_PER_EVENT[event] ?? 0
    const baseStars = STARS_PER_EVENT[event] ?? 0

    const difficultyMult = DIFFICULTY_MULTIPLIER[difficulty]
    const planXpBonus = PLAN_XP_BONUS[plan]
    const planStarsMult = PLAN_STARS_MULTIPLIER[plan]

    let xp = Math.round(baseXp * difficultyMult * (1 + planXpBonus))
    let stars = Math.round(baseStars * planStarsMult)

    if (duration >= DURATION_BONUS_THRESHOLD) {
      xp += DURATION_BONUS_XP
      stars += DURATION_BONUS_STARS
    }

    return { xp, stars, badges: [] }
  }

  addStreakBonus(reward: Reward, streakDays: number): Reward {
    const { STREAK_BONUSES } = require("./constants")
    let bonus = STREAK_BONUSES[0]
    for (const b of STREAK_BONUSES) {
      if (streakDays >= b.days) bonus = b
    }
    return {
      xp: reward.xp + (bonus?.xp ?? 0),
      stars: reward.stars + (bonus?.stars ?? 0),
      badges: reward.badges,
    }
  }
}

export const rewardEngine = new RewardEngine()
