import type { ServiceRepository } from '../../domain/repositories/service-repository'

export type RemoveServiceInput = {
  barbershopId: string
  serviceId: string
}

export type RemoveServiceOutput = {
  id: string
  isActive: boolean
}

/** Remove (soft delete) um serviço da barbearia — o histórico de agendamentos é preservado. */
export class RemoveServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(input: RemoveServiceInput): Promise<RemoveServiceOutput> {
    const service = await this.serviceRepository.findById(input.serviceId)
    if (!service) throw new Error('Service not found.')
    if (service.barbershopId !== input.barbershopId) throw new Error('Service does not belong to this barbershop.')
    if (!service.isActive) throw new Error('Service already removed.')

    const removed = service.deactivate()
    await this.serviceRepository.save(removed)

    return { id: removed.id, isActive: removed.isActive }
  }
}
