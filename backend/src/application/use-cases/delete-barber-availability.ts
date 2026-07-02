import type { BarberAvailabilityRepository } from '../../domain/repositories/barber-availability-repository'

export type DeleteBarberAvailabilityInput = {
  availabilityId: string
  barberUserId: string
}

export class DeleteBarberAvailabilityUseCase {
  constructor(
    private readonly availabilityRepository: BarberAvailabilityRepository,
  ) {}

  async execute(input: DeleteBarberAvailabilityInput): Promise<void> {
    const blocks = await this.availabilityRepository.findByBarberUserId(input.barberUserId)
    const block = blocks.find((b) => b.id === input.availabilityId)
    if (!block) throw new Error('Availability block not found.')
    if (block.barberUserId !== input.barberUserId) throw new Error('Not authorized.')

    await this.availabilityRepository.delete(input.availabilityId)
  }
}
