import type { LoyaltyPromotionType } from '../value-objects/loyalty-rule'

const DAY_MS = 24 * 60 * 60 * 1000
const ACTIVATION_LOCK_DAYS = 30

export class BarbershopPromotion {
  private constructor(
    readonly id: string,
    readonly barbershopId: string,
    readonly type: LoyaltyPromotionType,
    readonly active: boolean,
    readonly createdAt: Date,
    readonly activatedAt?: Date,
  ) {}

  static create(props: { id: string; barbershopId: string; type: LoyaltyPromotionType }): BarbershopPromotion {
    return new BarbershopPromotion(props.id, props.barbershopId, props.type, false, new Date(), undefined)
  }

  static restore(props: {
    id: string
    barbershopId: string
    type: LoyaltyPromotionType
    active: boolean
    activatedAt?: Date
  }): BarbershopPromotion {
    return new BarbershopPromotion(props.id, props.barbershopId, props.type, props.active, new Date(), props.activatedAt)
  }

  activate(now: Date = new Date()): BarbershopPromotion {
    if (this.active) throw new Error('Promotion is already active.')
    return new BarbershopPromotion(this.id, this.barbershopId, this.type, true, this.createdAt, now)
  }

  deactivate(now: Date = new Date()): BarbershopPromotion {
    if (!this.active) throw new Error('Promotion is already inactive.')

    const elapsedDays = this.activatedAt ? (now.getTime() - this.activatedAt.getTime()) / DAY_MS : Infinity
    if (elapsedDays < ACTIVATION_LOCK_DAYS) {
      throw new Error(`Cannot deactivate promotion before ${ACTIVATION_LOCK_DAYS} days have passed since activation.`)
    }

    return new BarbershopPromotion(this.id, this.barbershopId, this.type, false, this.createdAt, this.activatedAt)
  }
}
