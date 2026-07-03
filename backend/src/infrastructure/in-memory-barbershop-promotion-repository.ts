import type { BarbershopPromotionRepository } from '../domain/repositories/barbershop-promotion-repository'
import type { BarbershopPromotion } from '../domain/entities/barbershop-promotion'
import type { LoyaltyPromotionType } from '../domain/value-objects/loyalty-rule'

export class InMemoryBarbershopPromotionRepository implements BarbershopPromotionRepository {
  private readonly promotions = new Map<string, BarbershopPromotion>()

  async findByBarbershopId(barbershopId: string): Promise<BarbershopPromotion[]> {
    return [...this.promotions.values()].filter((p) => p.barbershopId === barbershopId)
  }

  async findByBarbershopIdAndType(barbershopId: string, type: LoyaltyPromotionType): Promise<BarbershopPromotion | null> {
    return (
      [...this.promotions.values()].find((p) => p.barbershopId === barbershopId && p.type === type) ?? null
    )
  }

  async save(promotion: BarbershopPromotion): Promise<void> {
    this.promotions.set(promotion.id, promotion)
  }
}
