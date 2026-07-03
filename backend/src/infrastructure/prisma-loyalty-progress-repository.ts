import type { PrismaClient } from '../generated/prisma/client'
import type { LoyaltyProgressRepository } from '../domain/repositories/loyalty-progress-repository'
import { LoyaltyProgress } from '../domain/entities/loyalty-progress'
import type { LoyaltyPromotionType } from '../domain/value-objects/loyalty-rule'

export class PrismaLoyaltyProgressRepository implements LoyaltyProgressRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByClientBarbershopAndType(
    clientUserId: string,
    barbershopId: string,
    type: LoyaltyPromotionType,
  ): Promise<LoyaltyProgress | null> {
    const row = await this.db.loyaltyProgress.findUnique({
      where: { clientUserId_barbershopId_type: { clientUserId, barbershopId, type } },
    })
    return row ? this.toEntity(row) : null
  }

  async save(progress: LoyaltyProgress): Promise<void> {
    await this.db.loyaltyProgress.upsert({
      where: { id: progress.id },
      create: {
        id: progress.id,
        clientUserId: progress.clientUserId,
        barbershopId: progress.barbershopId,
        type: progress.type,
        count: progress.count,
        cycleStartedAt: progress.cycleStartedAt ?? null,
      },
      update: {
        count: progress.count,
        cycleStartedAt: progress.cycleStartedAt ?? null,
      },
    })
  }

  private toEntity(row: {
    id: string; clientUserId: string; barbershopId: string
    type: string; count: number; cycleStartedAt: Date | null
  }): LoyaltyProgress {
    return LoyaltyProgress.restore({
      id: row.id,
      clientUserId: row.clientUserId,
      barbershopId: row.barbershopId,
      type: row.type as LoyaltyPromotionType,
      count: row.count,
      ...(row.cycleStartedAt && { cycleStartedAt: row.cycleStartedAt }),
    })
  }
}
