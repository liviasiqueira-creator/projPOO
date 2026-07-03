import type { BarberAvailability, Weekday } from '../entities/barber-availability'

export interface BarberAvailabilityRepository {
  findByBarberAndBarbershop(barberUserId: string, barbershopId: string): Promise<BarberAvailability[]>
  findByBarberUserId(barberUserId: string): Promise<BarberAvailability[]>
  findByBarbershopId(barbershopId: string): Promise<BarberAvailability[]>
  findAvailableBarbers(barbershopId: string, weekday: Weekday): Promise<BarberAvailability[]>
  save(availability: BarberAvailability): Promise<void>
  delete(id: string): Promise<void>
}
