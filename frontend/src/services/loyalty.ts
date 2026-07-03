import api from './api'
import type { PromotionType as LoyaltyPromotionType } from './promotions'

export type { LoyaltyPromotionType }

export interface LoyaltyReward {
  id: string
  type: LoyaltyPromotionType
  earnedAt: string
  expiresAt: string
  redeemed: boolean
  redeemedAt?: string
}

export async function getMyRewards(barbershopId: string): Promise<LoyaltyReward[]> {
  const { data } = await api.get<LoyaltyReward[]>(`/barbershops/${barbershopId}/loyalty/rewards`)
  return data
}
