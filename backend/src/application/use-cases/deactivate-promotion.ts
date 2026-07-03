import type { BarbershopPromotionRepository } from '../../domain/repositories/barbershop-promotion-repository'
import type { LoyaltyPromotionType } from '../../domain/value-objects/loyalty-rule'
import type { BarbershopPromotionOutput } from './list-barbershop-promotions'

export type DeactivatePromotionInput = {
  barbershopId: string
  type: LoyaltyPromotionType
}

export class DeactivatePromotionUseCase {
  constructor(private readonly promotionRepository: BarbershopPromotionRepository) {}

  async execute(input: DeactivatePromotionInput): Promise<BarbershopPromotionOutput> {
    const promotion = await this.promotionRepository.findByBarbershopIdAndType(input.barbershopId, input.type)
    if (!promotion) throw new Error('Promotion not found.')

    const deactivated = promotion.deactivate()
    await this.promotionRepository.save(deactivated)

    return {
      type: deactivated.type,
      active: deactivated.active,
      ...(deactivated.activatedAt && { activatedAt: deactivated.activatedAt }),
    }
  }
}
