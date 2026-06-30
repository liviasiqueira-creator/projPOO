import { randomUUID } from 'node:crypto'
import { Appointment } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { BarberMembershipRepository } from '../../domain/repositories/barber-membership-repository'

export type BookAppointmentInput = {
  barbershopId: string
  barberUserId: string
  clientUserId: string
  serviceId: string
  scheduledAt: Date
}

export type BookAppointmentOutput = {
  id: string
  barbershopId: string
  barberUserId: string
  clientUserId: string
  serviceId: string
  scheduledAt: Date
  endsAt: Date
  durationMinutes: number
  priceSnapshot: number
  status: string
}

export class BookAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly membershipRepository: BarberMembershipRepository,
  ) {}

  async execute(input: BookAppointmentInput): Promise<BookAppointmentOutput> {
    const service = await this.serviceRepository.findById(input.serviceId)
    if (!service) throw new Error('Service not found.')
    if (service.barbershopId !== input.barbershopId) throw new Error('Service does not belong to this barbershop.')

    const membership = await this.membershipRepository.findByBarberAndBarbershop(
      input.barberUserId,
      input.barbershopId,
    )
    if (!membership) throw new Error('Barber is not a member of this barbershop.')

    const endsAt = new Date(input.scheduledAt.getTime() + service.durationMinutes * 60 * 1000)

    // Cross-barbershop conflict check: only by barberUserId, not barbershopId
    const conflicts = await this.appointmentRepository.findConflicting(
      input.barberUserId,
      input.scheduledAt,
      endsAt,
    )
    if (conflicts.length > 0) throw new Error('Barber already has an appointment during this time.')

    const appointment = Appointment.create({
      id: randomUUID(),
      barbershopId: input.barbershopId,
      barberUserId: input.barberUserId,
      clientUserId: input.clientUserId,
      serviceId: input.serviceId,
      scheduledAt: input.scheduledAt,
      durationMinutes: service.durationMinutes,
      priceSnapshot: service.basePrice,
    })

    await this.appointmentRepository.save(appointment)

    return {
      id: appointment.id,
      barbershopId: appointment.barbershopId,
      barberUserId: appointment.barberUserId,
      clientUserId: appointment.clientUserId,
      serviceId: appointment.serviceId,
      scheduledAt: appointment.scheduledAt,
      endsAt: appointment.endsAt,
      durationMinutes: appointment.durationMinutes,
      priceSnapshot: appointment.priceSnapshot,
      status: appointment.status,
    }
  }
}
