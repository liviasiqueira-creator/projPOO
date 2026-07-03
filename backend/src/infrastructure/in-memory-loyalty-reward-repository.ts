import type { LoyaltyRewardRepository } from '../domain/repositories/loyalty-reward-repository'
import type { LoyaltyReward } from '../domain/entities/loyalty-reward'

export class InMemoryLoyaltyRewardRepository implements LoyaltyRewardRepository {
  private readonly rewards = new Map<string, LoyaltyReward>()

  async findById(id: string): Promise<LoyaltyReward | null> {
    return this.rewards.get(id) ?? null
  }

  async findByClientAndBarbershop(clientUserId: string, barbershopId: string): Promise<LoyaltyReward[]> {
    return [...this.rewards.values()].filter(
      (r) => r.clientUserId === clientUserId && r.barbershopId === barbershopId,
    )
  }

  async save(reward: LoyaltyReward): Promise<void> {
    this.rewards.set(reward.id, reward)
  }

  async update(reward: LoyaltyReward): Promise<void> {
    this.rewards.set(reward.id, reward)
  }
}
