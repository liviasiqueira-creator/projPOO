import type { BarberMembershipRepository } from '../domain/repositories/barber-membership-repository'
import type { BarberMembership } from '../domain/entities/barber-membership'

export class InMemoryBarberMembershipRepository implements BarberMembershipRepository {
  private readonly memberships = new Map<string, BarberMembership>()

  async findByBarberUserId(barberUserId: string): Promise<BarberMembership[]> {
    return [...this.memberships.values()].filter((m) => m.barberUserId === barberUserId)
  }

  async findByBarbershopId(barbershopId: string): Promise<BarberMembership[]> {
    return [...this.memberships.values()].filter((m) => m.barbershopId === barbershopId)
  }

  async findByBarberAndBarbershop(barberUserId: string, barbershopId: string): Promise<BarberMembership | null> {
    return [...this.memberships.values()].find(
      (m) => m.barberUserId === barberUserId && m.barbershopId === barbershopId
    ) ?? null
  }

  async save(membership: BarberMembership): Promise<void> {
    this.memberships.set(membership.id, membership)
  }

  async update(membership: BarberMembership): Promise<void> {
    this.memberships.set(membership.id, membership)
  }
}
