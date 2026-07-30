import { eventBus } from "./event-bus"
import { rewardEngine } from "./reward-engine"
import { levelEngine } from "./level-engine"
import { streakEngine } from "./streak-engine"
import { badgeEngine } from "./badge-engine"
import { challengeEngine } from "./challenge-engine"
import { notificationEngine } from "./notification-engine"
import { XP_PER_EVENT } from "./constants"
import type {
  GameEventType,
  EventPayload,
  RewardResult,
  Badge,
  ProfileState,
  PlanType,
  ChallengeProgress,
  Notification,
} from "./types"

interface EngineProfile {
  childId: string
  xp: number
  totalXpEarned: number
  level: number
  starsBalance: number
  badges: string[]
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  plan: PlanType
}

class Engine {
  private profiles = new Map<string, EngineProfile>()

  register(profile: EngineProfile): void {
    this.profiles.set(profile.childId, profile)
    streakEngine.set(profile.childId, {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      lastActivityDate: profile.lastActivityDate,
    })
    badgeEngine.setCounters(profile.childId, {})
  }

  getProfile(childId: string): EngineProfile | undefined {
    return this.profiles.get(childId)
  }

  async processEvent(event: GameEventType, payload: EventPayload): Promise<RewardResult> {
    const profile = this.profiles.get(payload.childId)
    if (!profile) throw new Error(`Profile ${payload.childId} not registered. Call engine.register() first.`)

    const difficulty = payload.difficulty ?? "easy"
    const plan = payload.plan ?? "free"
    const duration = payload.duration ?? 0

    let reward = rewardEngine.calculate({ event, difficulty, duration, plan })

    const streakResult = streakEngine.record(payload.childId)
    profile.currentStreak = streakResult.streak.currentStreak
    profile.longestStreak = streakResult.streak.longestStreak
    profile.lastActivityDate = streakResult.streak.lastActivityDate

    reward = rewardEngine.addStreakBonus(reward, streakResult.streak.currentStreak)

    const levelResult = levelEngine.addXp(profile.xp, reward.xp)
    profile.xp = levelResult.xp
    profile.totalXpEarned += reward.xp

    if (levelResult.levelUp) {
      profile.level = levelResult.level
      for (const levelReward of levelResult.newRewards) {
        if (levelReward.type === "stars") {
          profile.starsBalance += (levelReward.value as number)
        }
      }
    }

    const newBadges = badgeEngine.check(payload.childId, event, profile.badges, streakResult.streak.currentStreak)
    for (const badge of newBadges) {
      if (!profile.badges.includes(badge.id)) {
        profile.badges.push(badge.id)
      }
    }

    const challengeResult = challengeEngine.processEvent(payload.childId, event)
    for (const completed of challengeResult.completed) {
      profile.xp += completed.reward.xp
      profile.totalXpEarned += completed.reward.xp
      profile.starsBalance += completed.reward.stars
      for (const badgeId of completed.reward.badges) {
        if (!profile.badges.includes(badgeId)) {
          profile.badges.push(badgeId)
        }
      }
    }

    const notifications = this.buildNotifications(payload.childId, levelResult, newBadges, challengeResult.completed, streakResult.newMilestone)

    profile.starsBalance += reward.stars

    await eventBus.emit(event, payload)

    return {
      xp: reward.xp,
      stars: reward.stars,
      newBadges,
      levelUp: levelResult.levelUp,
      newLevel: levelResult.level,
      newChallenges: challengeResult.completed.map((c) => ({
        challengeId: c.id,
        completed: true,
        reward: c.reward,
      })),
      notifications,
    }
  }

  private buildNotifications(
    childId: string,
    levelResult: { levelUp: boolean; level: number },
    newBadges: Badge[],
    completedChallenges: { id: string; title: string }[],
    streakMilestone: boolean,
  ): Notification[] {
    const result: Notification[] = []

    if (levelResult.levelUp) {
      result.push(
        notificationEngine.add(childId, {
          type: "level_up",
          title: "Niveau supérieur !",
          description: `Félicitations ! Tu es passé au niveau ${levelResult.level} !`,
        }),
      )
    }

    for (const badge of newBadges) {
      result.push(
        notificationEngine.add(childId, {
          type: "badge_unlocked",
          title: "Badge débloqué !",
          description: `Tu as obtenu le badge "${badge.name}" !`,
          icon: badge.iconUrl,
        }),
      )
    }

    for (const challenge of completedChallenges) {
      result.push(
        notificationEngine.add(childId, {
          type: "challenge",
          title: "Défi relevé !",
          description: `Tu as terminé le défi "${challenge.title}" !`,
        }),
      )
    }

    if (streakMilestone) {
      const s = streakEngine.get(childId)
      result.push(
        notificationEngine.add(childId, {
          type: "streak",
          title: `Série de ${s.currentStreak} jours !`,
          description: `Tu es à ${s.currentStreak} jours d'affilée ! Continue comme ça !`,
        }),
      )
    }

    return result
  }
}

export const engine = new Engine()
