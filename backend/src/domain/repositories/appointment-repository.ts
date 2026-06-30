import type { Appointment } from '../entities/appointment'

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>
  findByBarberUserId(barberUserId: string): Promise<Appointment[]>
  findByClientUserId(clientUserId: string): Promise<Appointment[]>
  findByBarbershopId(barbershopId: string): Promise<Appointment[]>
  findConflicting(barberUserId: string, start: Date, end: Date): Promise<Appointment[]>
  save(appointment: Appointment): Promise<void>
  update(appointment: Appointment): Promise<void>
}
