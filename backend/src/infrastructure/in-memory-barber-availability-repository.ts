import type { BarberAvailabilityRepository } from '../domain/repositories/barber-availability-repository'
import type { Weekday } from '../domain/entities/barber-availability'
import { BarberAvailability } from '../domain/entities/barber-availability'

export class InMemoryBarberAvailabilityRepository implements BarberAvailabilityRepository {
  private blocks: BarberAvailability[] = []

  async findByBarberAndBarbershop(barberUserId: string, barbershopId: string): Promise<BarberAvailability[]> {
    return this.blocks.filter((b) => b.barberUserId === barberUserId && b.barbershopId === barbershopId)
  }

  async findByBarberUserId(barberUserId: string): Promise<BarberAvailability[]> {
    return this.blocks.filter((b) => b.barberUserId === barberUserId)
  }

  async findByBarbershopId(barbershopId: string): Promise<BarberAvailability[]> {
    return this.blocks.filter((b) => b.barbershopId === barbershopId)
  }

  async findAvailableBarbers(barbershopId: string, weekday: Weekday): Promise<BarberAvailability[]> {
    return this.blocks.filter(
      (b) => b.barbershopId === barbershopId && b.weekday === weekday,
    )
  }

  async save(availability: BarberAvailability): Promise<void> {
    this.blocks.push(availability)
  }

  async delete(id: string): Promise<void> {
    this.blocks = this.blocks.filter((b) => b.id !== id)
  }
}
