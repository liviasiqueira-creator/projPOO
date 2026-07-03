import type { PrismaClient } from '../generated/prisma/client'
import type { LoyaltyRewardRepository } from '../domain/repositories/loyalty-reward-repository'
import { LoyaltyReward } from '../domain/entities/loyalty-reward'
import type { LoyaltyPromotionType } from '../domain/value-objects/loyalty-rule'

export class PrismaLoyaltyRewardRepository implements LoyaltyRewardRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<LoyaltyReward | null> {
    const row = await this.db.loyaltyReward.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByClientAndBarbershop(clientUserId: string, barbershopId: string): Promise<LoyaltyReward[]> {
    const rows = await this.db.loyaltyReward.findMany({ where: { clientUserId, barbershopId } })
    return rows.map((r) => this.toEntity(r))
  }

  async save(reward: LoyaltyReward): Promise<void> {
    await this.db.loyaltyReward.create({
      data: {
        id: reward.id,
        clientUserId: reward.clientUserId,
        barbershopId: reward.barbershopId,
        type: reward.type,
        earnedAt: reward.earnedAt,
        expiresAt: reward.expiresAt,
        redeemed: reward.redeemed,
        redeemedAt: reward.redeemedAt ?? null,
        redeemedAppointmentId: reward.redeemedAppointmentId ?? null,
      },
    })
  }

  async update(reward: LoyaltyReward): Promise<void> {
    await this.db.loyaltyReward.update({
      where: { id: reward.id },
      data: {
        redeemed: reward.redeemed,
        redeemedAt: reward.redeemedAt ?? null,
        redeemedAppointmentId: reward.redeemedAppointmentId ?? null,
      },
    })
  }

  private toEntity(row: {
    id: string; clientUserId: string; barbershopId: string; type: string
    earnedAt: Date; expiresAt: Date; redeemed: boolean
    redeemedAt: Date | null; redeemedAppointmentId: string | null
  }): LoyaltyReward {
    return LoyaltyReward.restore({
      id: row.id,
      clientUserId: row.clientUserId,
      barbershopId: row.barbershopId,
      type: row.type as LoyaltyPromotionType,
      earnedAt: row.earnedAt,
      expiresAt: row.expiresAt,
      redeemed: row.redeemed,
      ...(row.redeemedAt && { redeemedAt: row.redeemedAt }),
      ...(row.redeemedAppointmentId && { redeemedAppointmentId: row.redeemedAppointmentId }),
    })
  }
}
