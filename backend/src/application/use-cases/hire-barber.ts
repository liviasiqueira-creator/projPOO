import { randomUUID } from 'node:crypto'
import { BarberMembership } from '../../domain/entities/barber-membership'
import { UserRole } from '../../domain/entities/user'
import type { AllowedShift } from '../../domain/entities/barber-membership'
import type { BarberMembershipRepository } from '../../domain/repositories/barber-membership-repository'
import type { BarbershopRepository } from '../../domain/repositories/barbershop-repository'
import type { UserRepository } from '../../domain/repositories/user-repository'

export type HireBarberInput = {
  barberUserId: string
  barbershopId: string
  isExclusive: boolean
  allowedShift?: AllowedShift
}

export type HireBarberOutput = {
  id: string
  barberUserId: string
  barbershopId: string
  isExclusive: boolean
  allowedShift?: AllowedShift
}

export class HireBarberUseCase {
  constructor(
    private readonly membershipRepository: BarberMembershipRepository,
    private readonly userRepository: UserRepository,
    private readonly barbershopRepository: BarbershopRepository,
  ) {}

  async execute(input: HireBarberInput): Promise<HireBarberOutput> {
    const barber = await this.userRepository.findById(input.barberUserId)
    if (!barber) throw new Error('Barber not found.')
    if (barber.role !== UserRole.Barber) throw new Error('User is not a barber.')

    const barbershop = await this.barbershopRepository.findById(input.barbershopId)
    if (!barbershop) throw new Error('Barbershop not found.')

    const alreadyMember = await this.membershipRepository.findByBarberAndBarbershop(
      input.barberUserId,
      input.barbershopId,
    )
    if (alreadyMember) throw new Error('Barber is already a member of this barbershop.')

    const existingMemberships = await this.membershipRepository.findByBarberUserId(input.barberUserId)

    const isExclusiveElsewhere = existingMemberships.some((m) => m.isExclusive)
    if (isExclusiveElsewhere) {
      throw new Error('Barber is exclusive to another barbershop and cannot be hired here.')
    }

    if (input.isExclusive && existingMemberships.length > 0) {
      throw new Error('Cannot hire barber as exclusive: they already work at another barbershop.')
    }

    const membership = BarberMembership.create({
      id: randomUUID(),
      ...input,
    })

    await this.membershipRepository.save(membership)

    return {
      id: membership.id,
      barberUserId: membership.barberUserId,
      barbershopId: membership.barbershopId,
      isExclusive: membership.isExclusive,
      allowedShift: membership.allowedShift,
    }
  }
}
