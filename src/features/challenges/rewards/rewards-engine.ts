import type { ChestContent, ChestDefinition, MissionReward, RewardChest } from "../types"
import { CHESTS } from "../constants"
import { emitGameEvent } from "../../gamification/event-bus"
import { challengeEngine } from "../../gamification/challenge-engine"
import type { Challenge, GameEventType } from "../../gamification/types"

export interface ClaimedReward {
  xp: number
  stars: number
  items: ChestContent[]
  badge?: string
}

function buildChestReward(definition: ChestDefinition): ClaimedReward {
  let xp = 0
  let stars = 0
  const items: ChestContent[] = []
  let badge: string | undefined

  for (const content of definition.contents) {
    switch (content.type) {
      case "xp":
        xp += content.quantity
        break
      case "stars":
        stars += content.quantity
        break
      case "badge":
        badge = content.key
        break
      default:
        items.push(content)
    }
  }

  return { xp, stars, items, badge }
}

export function computeMissionReward(reward: MissionReward): ClaimedReward {
  return {
    xp: reward.xp,
    stars: reward.stars,
    items: reward.item ? [{ type: "item", key: reward.item, quantity: 1, label: reward.item }] : [],
    badge: reward.badge,
  }
}

export async function claimChestReward(chest: RewardChest, childId: string): Promise<ClaimedReward | null> {
  const definition = CHESTS.find((c) => c.id === chest.chest_id)
  if (!definition || chest.claimed) return null

  const reward = buildChestReward(definition)

  if (reward.stars > 0) {
    await emitGameEvent("STARS_EARNED", {
      childId,
      amount: reward.stars,
      reason: `calendar_chest_${chest.chest_id}`,
    })
  }

  return reward
}

export async function emitMissionReward(reward: MissionReward, childId: string): Promise<void> {
  if (reward.stars > 0) {
    await emitGameEvent("STARS_EARNED", {
      childId,
      amount: reward.stars,
      reason: "mission_reward",
    })
  }
}

export function toEngineChallenge(
  id: string,
  title: string,
  description: string,
  event: GameEventType,
  target: number,
  reward: MissionReward,
  expiresAt: string | null = null,
): Challenge {
  return {
    id,
    title,
    description,
    requirement: { event, count: target },
    reward: {
      xp: reward.xp,
      stars: reward.stars,
      badges: reward.badge ? [reward.badge] : [],
    },
    progress: 0,
    target,
    completed: false,
    claimed: false,
    expiresAt,
  }
}

export function registerMissionInEngine(challenge: Challenge): void {
  challengeEngine.register(challenge)
}

export function getMissionProgress(childId: string, missionId: string): number {
  return challengeEngine.getProgress(childId, missionId)
}
