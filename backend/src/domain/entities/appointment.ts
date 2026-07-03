export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['in_progress', 'cancelled'],
  in_progress: ['completed', 'no_show'],
  completed:  [],
  cancelled:  [],
  no_show:    [],
}

export class Appointment {
  private constructor(
    readonly id: string,
    readonly barbershopId: string,
    readonly barberUserId: string,
    readonly clientUserId: string,
    readonly serviceId: string,
    readonly scheduledAt: Date,
    readonly durationMinutes: number,
    readonly priceSnapshot: number,
    readonly status: AppointmentStatus,
    readonly createdAt: Date,
  ) {}

  get endsAt(): Date {
    return new Date(this.scheduledAt.getTime() + this.durationMinutes * 60 * 1000)
  }

  static restore(props: {
    id: string
    barbershopId: string
    barberUserId: string
    clientUserId: string
    serviceId: string
    scheduledAt: Date
    durationMinutes: number
    priceSnapshot: number
    status: AppointmentStatus
  }): Appointment {
    return new Appointment(
      props.id, props.barbershopId, props.barberUserId, props.clientUserId, props.serviceId,
      props.scheduledAt, props.durationMinutes, props.priceSnapshot, props.status, new Date(),
    )
  }

  static create(props: {
    id: string
    barbershopId: string
    barberUserId: string
    clientUserId: string
    serviceId: string
    scheduledAt: Date
    durationMinutes: number
    priceSnapshot: number
  }): Appointment {
    if (props.scheduledAt <= new Date()) throw new Error('Appointment must be scheduled in the future.')
    if (props.durationMinutes <= 0) throw new Error('Duration must be greater than zero.')
    if (props.priceSnapshot < 0) throw new Error('Price cannot be negative.')

    return new Appointment(
      props.id,
      props.barbershopId,
      props.barberUserId,
      props.clientUserId,
      props.serviceId,
      props.scheduledAt,
      props.durationMinutes,
      props.priceSnapshot,
      'pending',
      new Date(),
    )
  }

  transition(to: AppointmentStatus): Appointment {
    const allowed = TRANSITIONS[this.status]
    if (!allowed.includes(to)) {
      throw new Error(`Cannot transition from '${this.status}' to '${to}'.`)
    }

    return new Appointment(
      this.id, this.barbershopId, this.barberUserId, this.clientUserId, this.serviceId,
      this.scheduledAt, this.durationMinutes, this.priceSnapshot, to, this.createdAt,
    )
  }
}
