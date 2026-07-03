import { randomUUID } from 'node:crypto'
import { BarbershopPromotion } from '../../domain/entities/barbershop-promotion'
import type { BarbershopPromotionRepository } from '../../domain/repositories/barbershop-promotion-repository'
import { LOYALTY_RULES, type LoyaltyPromotionType } from '../../domain/value-objects/loyalty-rule'

export type ListBarbershopPromotionsInput = {
  barbershopId: string
}

export type BarbershopPromotionOutput = {
  type: LoyaltyPromotionType
  active: boolean
  activatedAt?: Date
}

/** As 2 promoções fixas são criadas sob demanda (inativas) na primeira consulta — sem script de seed. */
export class ListBarbershopPromotionsUseCase {
  constructor(private readonly promotionRepository: BarbershopPromotionRepository) {}

  async execute(input: ListBarbershopPromotionsInput): Promise<BarbershopPromotionOutput[]> {
    const results: BarbershopPromotionOutput[] = []

    for (const type of Object.keys(LOYALTY_RULES) as LoyaltyPromotionType[]) {
      let promotion = await this.promotionRepository.findByBarbershopIdAndType(input.barbershopId, type)
      if (!promotion) {
        promotion = BarbershopPromotion.create({ id: randomUUID(), barbershopId: input.barbershopId, type })
        await this.promotionRepository.save(promotion)
      }
      results.push({
        type: promotion.type,
        active: promotion.active,
        ...(promotion.activatedAt && { activatedAt: promotion.activatedAt }),
      })
    }

    return results
  }
}
