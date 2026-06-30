import type { AppointmentRepository } from '../domain/repositories/appointment-repository'
import type { Appointment } from '../domain/entities/appointment'

export class InMemoryAppointmentRepository implements AppointmentRepository {
  private readonly appointments = new Map<string, Appointment>()

  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.get(id) ?? null
  }

  async findByBarberUserId(barberUserId: string): Promise<Appointment[]> {
    return [...this.appointments.values()].filter((a) => a.barberUserId === barberUserId)
  }

  async findByClientUserId(clientUserId: string): Promise<Appointment[]> {
    return [...this.appointments.values()].filter((a) => a.clientUserId === clientUserId)
  }

  async findByBarbershopId(barbershopId: string): Promise<Appointment[]> {
    return [...this.appointments.values()].filter((a) => a.barbershopId === barbershopId)
  }

  async findConflicting(barberUserId: string, start: Date, end: Date): Promise<Appointment[]> {
    return [...this.appointments.values()].filter((a) =>
      a.barberUserId === barberUserId &&
      a.scheduledAt < end &&
      a.endsAt > start &&
      !['cancelled', 'no_show'].includes(a.status)
    )
  }

  async save(appointment: Appointment): Promise<void> {
    this.appointments.set(appointment.id, appointment)
  }

  async update(appointment: Appointment): Promise<void> {
    this.appointments.set(appointment.id, appointment)
  }
}
