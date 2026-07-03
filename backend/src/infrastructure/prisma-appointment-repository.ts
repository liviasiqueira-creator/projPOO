import type { PrismaClient } from '../generated/prisma/client'
import type { AppointmentRepository } from '../domain/repositories/appointment-repository'
import { Appointment, type AppointmentStatus } from '../domain/entities/appointment'

export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Appointment | null> {
    const row = await this.db.appointment.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByBarberUserId(barberUserId: string): Promise<Appointment[]> {
    const rows = await this.db.appointment.findMany({ where: { barberUserId } })
    return rows.map((r) => this.toEntity(r))
  }

  async findByClientUserId(clientUserId: string): Promise<Appointment[]> {
    const rows = await this.db.appointment.findMany({ where: { clientUserId } })
    return rows.map((r) => this.toEntity(r))
  }

  async findByBarbershopId(barbershopId: string): Promise<Appointment[]> {
    const rows = await this.db.appointment.findMany({ where: { barbershopId } })
    return rows.map((r) => this.toEntity(r))
  }

  async findConflicting(barberUserId: string, start: Date, end: Date): Promise<Appointment[]> {
    const rows = await this.db.appointment.findMany({
      where: {
        barberUserId,
        status: { notIn: ['cancelled', 'no_show'] },
        scheduledAt: { lt: end },
      },
    })
    return rows
      .map((r) => this.toEntity(r))
      .filter((a) => a.scheduledAt < end && a.endsAt > start)
  }

  async save(appointment: Appointment): Promise<void> {
    await this.db.appointment.upsert({
      where: { id: appointment.id },
      create: {
        id: appointment.id,
        barbershopId: appointment.barbershopId,
        barberUserId: appointment.barberUserId,
        clientUserId: appointment.clientUserId,
        serviceId: appointment.serviceId,
        scheduledAt: appointment.scheduledAt,
        durationMinutes: appointment.durationMinutes,
        priceSnapshot: appointment.priceSnapshot,
        status: appointment.status,
      },
      update: { status: appointment.status },
    })
  }

  async update(appointment: Appointment): Promise<void> {
    await this.db.appointment.update({
      where: { id: appointment.id },
      data: { status: appointment.status },
    })
  }

  private toEntity(row: {
    id: string; barbershopId: string; barberUserId: string; clientUserId: string
    serviceId: string; scheduledAt: Date; durationMinutes: number
    priceSnapshot: number; status: string
  }): Appointment {
    return Appointment.restore({
      id: row.id,
      barbershopId: row.barbershopId,
      barberUserId: row.barberUserId,
      clientUserId: row.clientUserId,
      serviceId: row.serviceId,
      scheduledAt: row.scheduledAt,
      durationMinutes: row.durationMinutes,
      priceSnapshot: row.priceSnapshot,
      status: row.status as AppointmentStatus,
    })
  }
}
