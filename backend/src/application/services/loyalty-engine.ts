import { randomUUID } from 'node:crypto'
import type { LoyaltyEngine } from '../ports/loyalty-engine'
import type { Appointment } from '../../domain/entities/appointment'
import type { LoyaltyProgressRepository } from '../../domain/repositories/loyalty-progress-repository'
import type { LoyaltyRewardRepository } from '../../domain/repositories/loyalty-reward-repository'
import type { BarbershopPromotionRepository } from '../../domain/repositories/barbershop-promotion-repository'
import { LoyaltyProgress } from '../../domain/entities/loyalty-progress'
import { LoyaltyReward } from '../../domain/entities/loyalty-reward'
import { LOYALTY_RULES } from '../../domain/value-objects/loyalty-rule'

/**
 * Motor único reaproveitado pelas duas trilhas de fidelidade (barba/corte) — a única
 * diferença entre elas é a entrada correspondente em LOYALTY_RULES.
 */
export class DefaultLoyaltyEngine implements LoyaltyEngine {
  constructor(
    private readonly progressRepository: LoyaltyProgressRepository,
    private readonly rewardRepository: LoyaltyRewardRepository,
    private readonly promotionRepository: BarbershopPromotionRepository,
  ) {}

  async processCompletedAppointment(appointment: Appointment): Promise<void> {
    if (appointment.isRedemption) return

    for (const rule of Object.values(LOYALTY_RULES)) {
      const existing = await this.progressRepository.findByClientBarbershopAndType(
        appointment.clientUserId,
        appointment.barbershopId,
        rule.type,
      )

      const progress = existing ?? LoyaltyProgress.create({
        id: randomUUID(),
        clientUserId: appointment.clientUserId,
        barbershopId: appointment.barbershopId,
        type: rule.type,
      })

      const { progress: updated, thresholdReached } = progress.registerAppointment(appointment.scheduledAt, rule)
      await this.progressRepository.save(updated)

      if (!thresholdReached) continue

      const promotion = await this.promotionRepository.findByBarbershopIdAndType(appointment.barbershopId, rule.type)
      if (!promotion?.active) continue

      const reward = LoyaltyReward.create({
        id: randomUUID(),
        clientUserId: appointment.clientUserId,
        barbershopId: appointment.barbershopId,
        type: rule.type,
        earnedAt: appointment.scheduledAt,
      })
      await this.rewardRepository.save(reward)
    }
  }
}
