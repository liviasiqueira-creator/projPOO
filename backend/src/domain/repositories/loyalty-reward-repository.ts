import type { LoyaltyReward } from '../entities/loyalty-reward'

export interface LoyaltyRewardRepository {
  findById(id: string): Promise<LoyaltyReward | null>
  findByClientAndBarbershop(clientUserId: string, barbershopId: string): Promise<LoyaltyReward[]>
  save(reward: LoyaltyReward): Promise<void>
  update(reward: LoyaltyReward): Promise<void>
}
