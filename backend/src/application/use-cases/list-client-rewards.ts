import type { LoyaltyRewardRepository } from '../../domain/repositories/loyalty-reward-repository'
import type { LoyaltyPromotionType } from '../../domain/value-objects/loyalty-rule'

export type ListClientRewardsInput = {
  clientUserId: string
  barbershopId: string
}

export type LoyaltyRewardOutput = {
  id: string
  type: LoyaltyPromotionType
  earnedAt: Date
  expiresAt: Date
  redeemed: boolean
  redeemedAt?: Date
}

export class ListClientRewardsUseCase {
  constructor(private readonly rewardRepository: LoyaltyRewardRepository) {}

  async execute(input: ListClientRewardsInput): Promise<LoyaltyRewardOutput[]> {
    const rewards = await this.rewardRepository.findByClientAndBarbershop(input.clientUserId, input.barbershopId)

    return rewards.map((r) => ({
      id: r.id,
      type: r.type,
      earnedAt: r.earnedAt,
      expiresAt: r.expiresAt,
      redeemed: r.redeemed,
      ...(r.redeemedAt && { redeemedAt: r.redeemedAt }),
    }))
  }
}
