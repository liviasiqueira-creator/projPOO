export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = domingo, 6 = sábado

export class BarberAvailability {
  private constructor(
    readonly id: string,
    readonly barberUserId: string,
    readonly barbershopId: string,
    readonly weekday: Weekday,
    readonly startTime: string, // HH:MM
    readonly endTime: string,   // HH:MM
  ) {}

  static create(props: {
    id: string
    barberUserId: string
    barbershopId: string
    weekday: Weekday
    startTime: string
    endTime: string
  }): BarberAvailability {
    if (!BarberAvailability.isValidTime(props.startTime)) {
      throw new Error('Invalid startTime format. Expected HH:MM.')
    }
    if (!BarberAvailability.isValidTime(props.endTime)) {
      throw new Error('Invalid endTime format. Expected HH:MM.')
    }
    if (props.startTime >= props.endTime) {
      throw new Error('startTime must be before endTime.')
    }

    return new BarberAvailability(
      props.id,
      props.barberUserId,
      props.barbershopId,
      props.weekday,
      props.startTime,
      props.endTime,
    )
  }

  overlapsWith(other: BarberAvailability): boolean {
    if (this.barberUserId !== other.barberUserId) return false
    if (this.weekday !== other.weekday) return false
    return this.startTime < other.endTime && this.endTime > other.startTime
  }

  private static isValidTime(time: string): boolean {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  }
}
