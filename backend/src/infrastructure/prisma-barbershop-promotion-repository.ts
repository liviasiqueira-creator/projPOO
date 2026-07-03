import type { PrismaClient } from '../generated/prisma/client'
import type { BarbershopPromotionRepository } from '../domain/repositories/barbershop-promotion-repository'
import { BarbershopPromotion } from '../domain/entities/barbershop-promotion'
import type { LoyaltyPromotionType } from '../domain/value-objects/loyalty-rule'

export class PrismaBarbershopPromotionRepository implements BarbershopPromotionRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByBarbershopId(barbershopId: string): Promise<BarbershopPromotion[]> {
    const rows = await this.db.barbershopPromotion.findMany({ where: { barbershopId } })
    return rows.map((r) => this.toEntity(r))
  }

  async findByBarbershopIdAndType(barbershopId: string, type: LoyaltyPromotionType): Promise<BarbershopPromotion | null> {
    const row = await this.db.barbershopPromotion.findUnique({
      where: { barbershopId_type: { barbershopId, type } },
    })
    return row ? this.toEntity(row) : null
  }

  async save(promotion: BarbershopPromotion): Promise<void> {
    await this.db.barbershopPromotion.upsert({
      where: { id: promotion.id },
      create: {
        id: promotion.id,
        barbershopId: promotion.barbershopId,
        type: promotion.type,
        active: promotion.active,
        activatedAt: promotion.activatedAt ?? null,
      },
      update: {
        active: promotion.active,
        activatedAt: promotion.activatedAt ?? null,
      },
    })
  }

  private toEntity(row: {
    id: string; barbershopId: string; type: string; active: boolean; activatedAt: Date | null
  }): BarbershopPromotion {
    return BarbershopPromotion.restore({
      id: row.id,
      barbershopId: row.barbershopId,
      type: row.type as LoyaltyPromotionType,
      active: row.active,
      ...(row.activatedAt && { activatedAt: row.activatedAt }),
    })
  }
}
