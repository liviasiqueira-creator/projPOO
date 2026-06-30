import type { BarberMembershipRepository } from '../../domain/repositories/barber-membership-repository'

export type UpdateExclusivityInput = {
  barberUserId: string
  barbershopId: string
  isExclusive: boolean
}

export type UpdateExclusivityOutput = {
  id: string
  isExclusive: boolean
}

export class UpdateExclusivityUseCase {
  constructor(
    private readonly membershipRepository: BarberMembershipRepository,
  ) {}

  async execute(input: UpdateExclusivityInput): Promise<UpdateExclusivityOutput> {
    const membership = await this.membershipRepository.findByBarberAndBarbershop(
      input.barberUserId,
      input.barbershopId,
    )
    if (!membership) throw new Error('Membership not found.')

    // Tightening exclusivity: only allowed if barber has no other memberships
    if (input.isExclusive && !membership.isExclusive) {
      const allMemberships = await this.membershipRepository.findByBarberUserId(input.barberUserId)
      const otherMemberships = allMemberships.filter((m) => m.barbershopId !== input.barbershopId)
      if (otherMemberships.length > 0) {
        throw new Error('Cannot set exclusivity: barber already works at another barbershop.')
      }
    }

    const updated = membership.withExclusivity(input.isExclusive)
    await this.membershipRepository.update(updated)

    return { id: updated.id, isExclusive: updated.isExclusive }
  }
}
