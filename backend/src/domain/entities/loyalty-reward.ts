import { LOYALTY_RULES, type LoyaltyPromotionType } from '../value-objects/loyalty-rule'

const DAY_MS = 24 * 60 * 60 * 1000

export class LoyaltyReward {
  private constructor(
    readonly id: string,
    readonly clientUserId: string,
    readonly barbershopId: string,
    readonly type: LoyaltyPromotionType,
    readonly earnedAt: Date,
    readonly expiresAt: Date,
    readonly redeemed: boolean,
    readonly redeemedAt?: Date,
    readonly redeemedAppointmentId?: string,
  ) {}

  static create(props: {
    id: string
    clientUserId: string
    barbershopId: string
    type: LoyaltyPromotionType
    earnedAt: Date
  }): LoyaltyReward {
    const expiresAt = new Date(props.earnedAt.getTime() + LOYALTY_RULES[props.type].rewardExpiryDays * DAY_MS)
    return new LoyaltyReward(props.id, props.clientUserId, props.barbershopId, props.type, props.earnedAt, expiresAt, false)
  }

  static restore(props: {
    id: string
    clientUserId: string
    barbershopId: string
    type: LoyaltyPromotionType
    earnedAt: Date
    expiresAt: Date
    redeemed: boolean
    redeemedAt?: Date
    redeemedAppointmentId?: string
  }): LoyaltyReward {
    return new LoyaltyReward(
      props.id,
      props.clientUserId,
      props.barbershopId,
      props.type,
      props.earnedAt,
      props.expiresAt,
      props.redeemed,
      props.redeemedAt,
      props.redeemedAppointmentId,
    )
  }

  isRedeemableAt(now: Date): boolean {
    return !this.redeemed && now.getTime() <= this.expiresAt.getTime()
  }

  redeem(appointmentId: string, now: Date = new Date()): LoyaltyReward {
    if (this.redeemed) throw new Error('Reward already redeemed.')
    if (now.getTime() > this.expiresAt.getTime()) throw new Error('Reward has expired.')

    return new LoyaltyReward(
      this.id,
      this.clientUserId,
      this.barbershopId,
      this.type,
      this.earnedAt,
      this.expiresAt,
      true,
      now,
      appointmentId,
    )
  }
}
