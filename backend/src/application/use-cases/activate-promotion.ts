import { randomUUID } from 'node:crypto'
import { BarbershopPromotion } from '../../domain/entities/barbershop-promotion'
import type { BarbershopPromotionRepository } from '../../domain/repositories/barbershop-promotion-repository'
import type { LoyaltyPromotionType } from '../../domain/value-objects/loyalty-rule'
import type { BarbershopPromotionOutput } from './list-barbershop-promotions'

export type ActivatePromotionInput = {
  barbershopId: string
  type: LoyaltyPromotionType
}

export class ActivatePromotionUseCase {
  constructor(private readonly promotionRepository: BarbershopPromotionRepository) {}

  async execute(input: ActivatePromotionInput): Promise<BarbershopPromotionOutput> {
    let promotion = await this.promotionRepository.findByBarbershopIdAndType(input.barbershopId, input.type)
    if (!promotion) {
      promotion = BarbershopPromotion.create({ id: randomUUID(), barbershopId: input.barbershopId, type: input.type })
    }

    const activated = promotion.activate()
    await this.promotionRepository.save(activated)

    return {
      type: activated.type,
      active: activated.active,
      ...(activated.activatedAt && { activatedAt: activated.activatedAt }),
    }
  }
}
