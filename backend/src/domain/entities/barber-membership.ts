export type AllowedShift = 'morning' | 'afternoon' | 'evening'

export class BarberMembership {
  private constructor(
    readonly id: string,
    readonly barbershopId: string,
    readonly barberUserId: string,
    readonly isExclusive: boolean,
    readonly createdAt: Date,
    readonly allowedShift?: AllowedShift,
  ) {}

  static create(props: {
    id: string
    barbershopId: string
    barberUserId: string
    isExclusive: boolean
    allowedShift?: AllowedShift
  }): BarberMembership {
    return new BarberMembership(
      props.id,
      props.barbershopId,
      props.barberUserId,
      props.isExclusive,
      new Date(),
      props.allowedShift,
    )
  }

  withExclusivity(isExclusive: boolean): BarberMembership {
    return new BarberMembership(
      this.id,
      this.barbershopId,
      this.barberUserId,
      isExclusive,
      this.createdAt,
      this.allowedShift,
    )
  }
}
