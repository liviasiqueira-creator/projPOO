import type { BarbershopPromotion } from '../entities/barbershop-promotion'
import type { LoyaltyPromotionType } from '../value-objects/loyalty-rule'

export interface BarbershopPromotionRepository {
  findByBarbershopId(barbershopId: string): Promise<BarbershopPromotion[]>
  findByBarbershopIdAndType(barbershopId: string, type: LoyaltyPromotionType): Promise<BarbershopPromotion | null>
  save(promotion: BarbershopPromotion): Promise<void>
}
