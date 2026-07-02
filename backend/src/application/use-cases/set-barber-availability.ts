import { randomUUID } from 'node:crypto'
import { BarberAvailability } from '../../domain/entities/barber-availability'
import type { Weekday } from '../../domain/entities/barber-availability'
import type { BarberAvailabilityRepository } from '../../domain/repositories/barber-availability-repository'
import type { BarberMembershipRepository } from '../../domain/repositories/barber-membership-repository'

export type SetBarberAvailabilityInput = {
  barberUserId: string
  barbershopId: string
  weekday: Weekday
  startTime: string
  endTime: string
}

export type SetBarberAvailabilityOutput = {
  id: string
  weekday: Weekday
  startTime: string
  endTime: string
}

export class SetBarberAvailabilityUseCase {
  constructor(
    private readonly availabilityRepository: BarberAvailabilityRepository,
    private readonly membershipRepository: BarberMembershipRepository,
  ) {}

  async execute(input: SetBarberAvailabilityInput): Promise<SetBarberAvailabilityOutput> {
    const membership = await this.membershipRepository.findByBarberAndBarbershop(
      input.barberUserId,
      input.barbershopId,
    )
    if (!membership) throw new Error('Barber is not a member of this barbershop.')

    const newBlock = BarberAvailability.create({ id: randomUUID(), ...input })

    // Cross-barbershop overlap check: verifica todos os vínculos do barbeiro
    const allBlocks = await this.availabilityRepository.findByBarberUserId(input.barberUserId)
    const conflict = allBlocks.find((block) => newBlock.overlapsWith(block))
    if (conflict) throw new Error('Availability block overlaps with an existing block.')

    await this.availabilityRepository.save(newBlock)

    return {
      id: newBlock.id,
      weekday: newBlock.weekday,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
    }
  }
}
