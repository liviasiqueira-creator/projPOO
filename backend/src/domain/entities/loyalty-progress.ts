import type { LoyaltyPromotionType, LoyaltyRule } from '../value-objects/loyalty-rule'

const DAY_MS = 24 * 60 * 60 * 1000

export class LoyaltyProgress {
  private constructor(
    readonly id: string,
    readonly clientUserId: string,
    readonly barbershopId: string,
    readonly type: LoyaltyPromotionType,
    readonly count: number,
    readonly updatedAt: Date,
    readonly cycleStartedAt?: Date,
  ) {}

  static create(props: {
    id: string
    clientUserId: string
    barbershopId: string
    type: LoyaltyPromotionType
  }): LoyaltyProgress {
    return new LoyaltyProgress(props.id, props.clientUserId, props.barbershopId, props.type, 0, new Date(), undefined)
  }

  static restore(props: {
    id: string
    clientUserId: string
    barbershopId: string
    type: LoyaltyPromotionType
    count: number
    cycleStartedAt?: Date
  }): LoyaltyProgress {
    return new LoyaltyProgress(props.id, props.clientUserId, props.barbershopId, props.type, props.count, new Date(), props.cycleStartedAt)
  }

  /**
   * Registra um agendamento pago e concluído no ciclo de fidelidade (cartão-fidelidade que pode vencer):
   * se a janela do ciclo atual já estourou, o ciclo é descartado e reinicia a partir deste agendamento;
   * ao bater a meta, o ciclo reseta para permitir repetir o benefício enquanto a promoção estiver ativa.
   */
  registerAppointment(scheduledAt: Date, rule: LoyaltyRule): { progress: LoyaltyProgress; thresholdReached: boolean } {
    const cycleExpired =
      this.cycleStartedAt !== undefined &&
      (scheduledAt.getTime() - this.cycleStartedAt.getTime()) / DAY_MS > rule.windowDays

    const startingNewCycle = this.cycleStartedAt === undefined || cycleExpired
    const newCount = startingNewCycle ? 1 : this.count + 1
    const newCycleStartedAt = startingNewCycle ? scheduledAt : this.cycleStartedAt
    const thresholdReached = newCount >= rule.threshold

    const progress = new LoyaltyProgress(
      this.id,
      this.clientUserId,
      this.barbershopId,
      this.type,
      thresholdReached ? 0 : newCount,
      new Date(),
      thresholdReached ? undefined : newCycleStartedAt,
    )

    return { progress, thresholdReached }
  }
}
