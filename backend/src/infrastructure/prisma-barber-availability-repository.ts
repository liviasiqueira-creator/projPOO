import type { PrismaClient } from '../generated/prisma/client'
import type { BarberAvailabilityRepository } from '../domain/repositories/barber-availability-repository'
import { BarberAvailability, type Weekday } from '../domain/entities/barber-availability'

export class PrismaBarberAvailabilityRepository implements BarberAvailabilityRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByBarberAndBarbershop(barberUserId: string, barbershopId: string): Promise<BarberAvailability[]> {
    const rows = await this.db.barberAvailability.findMany({ where: { barberUserId, barbershopId } })
    return rows.map((r) => this.toEntity(r))
  }

  async findByBarberUserId(barberUserId: string): Promise<BarberAvailability[]> {
    const rows = await this.db.barberAvailability.findMany({ where: { barberUserId } })
    return rows.map((r) => this.toEntity(r))
  }

  async findByBarbershopId(barbershopId: string): Promise<BarberAvailability[]> {
    const rows = await this.db.barberAvailability.findMany({ where: { barbershopId } })
    return rows.map((r) => this.toEntity(r))
  }

  async findAvailableBarbers(barbershopId: string, weekday: Weekday, time: string): Promise<BarberAvailability[]> {
    const rows = await this.db.barberAvailability.findMany({
      where: { barbershopId, weekday, startTime: { lte: time } },
    })
    return rows.map((r) => this.toEntity(r))
  }

  async save(availability: BarberAvailability): Promise<void> {
    await this.db.barberAvailability.upsert({
      where: { id: availability.id },
      create: {
        id: availability.id,
        barberUserId: availability.barberUserId,
        barbershopId: availability.barbershopId,
        weekday: availability.weekday,
        startTime: availability.startTime,
        endTime: availability.endTime,
      },
      update: {
        weekday: availability.weekday,
        startTime: availability.startTime,
        endTime: availability.endTime,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.barberAvailability.delete({ where: { id } })
  }

  private toEntity(row: {
    id: string; barberUserId: string; barbershopId: string
    weekday: number; startTime: string; endTime: string
  }): BarberAvailability {
    return BarberAvailability.create({
      id: row.id,
      barberUserId: row.barberUserId,
      barbershopId: row.barbershopId,
      weekday: row.weekday as Weekday,
      startTime: row.startTime,
      endTime: row.endTime,
    })
  }
}
