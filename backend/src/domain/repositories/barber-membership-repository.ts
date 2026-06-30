import type { BarberMembership } from '../entities/barber-membership'

export interface BarberMembershipRepository {
  findByBarberUserId(barberUserId: string): Promise<BarberMembership[]>
  findByBarbershopId(barbershopId: string): Promise<BarberMembership[]>
  findByBarberAndBarbershop(barberUserId: string, barbershopId: string): Promise<BarberMembership | null>
  save(membership: BarberMembership): Promise<void>
  update(membership: BarberMembership): Promise<void>
}
