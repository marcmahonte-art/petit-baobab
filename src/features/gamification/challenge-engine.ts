import type { Challenge, GameEventType, Reward } from "./types"
import { XP_PER_EVENT } from "./constants"

export class ChallengeEngine {
  private challenges = new Map<string, Challenge>()
  private progressMap = new Map<string, Map<string, number>>()

  register(challenge: Challenge): void {
    this.challenges.set(challenge.id, challenge)
  }

  registerMany(challenges: Challenge[]): void {
    for (const c of challenges) {
      this.challenges.set(c.id, c)
    }
  }

  getActive(childId: string): Challenge[] {
    const now = new Date()
    return Array.from(this.challenges.values()).filter((c) => {
      if (c.claimed) return false
      if (c.expiresAt && new Date(c.expiresAt) < now) return false
      return true
    })
  }

  getById(id: string): Challenge | undefined {
    return this.challenges.get(id)
  }

  processEvent(childId: string, event: GameEventType): { completed: Challenge[]; reward: Reward } {
    const completed: Challenge[] = []
    const accumulated: Reward = { xp: 0, stars: 0, badges: [] }

    const childProgress = this.progressMap.get(childId) ?? new Map()
    const eventKey = `${childId}_${event}`
    const currentCount = (childProgress.get(eventKey) ?? 0) + 1
    childProgress.set(eventKey, currentCount)
    this.progressMap.set(childId, childProgress)

    for (const challenge of this.challenges.values()) {
      if (challenge.completed || challenge.claimed) continue
      if (challenge.requirement.event !== event) continue

      challenge.progress = currentCount

      if (currentCount >= challenge.target) {
        challenge.completed = true
        completed.push(challenge)
        accumulated.xp += challenge.reward.xp
        accumulated.stars += challenge.reward.stars
        accumulated.badges.push(...challenge.reward.badges)
      }
    }

    return { completed, reward: accumulated }
  }

  claim(childId: string, challengeId: string): Challenge | null {
    const challenge = this.challenges.get(challengeId)
    if (!challenge || !challenge.completed || challenge.claimed) return null
    challenge.claimed = true
    return challenge
  }

  getProgress(childId: string, challengeId: string): number {
    const challenge = this.challenges.get(challengeId)
    if (!challenge) return 0
    const childProgress = this.progressMap.get(childId) ?? new Map()
    return childProgress.get(`${childId}_${challenge.requirement.event}`) ?? 0
  }

  reset(): void {
    this.challenges.clear()
    this.progressMap.clear()
  }
}

export const challengeEngine = new ChallengeEngine()
