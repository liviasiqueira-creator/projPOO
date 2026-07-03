import type { ServiceRepository } from '../../domain/repositories/service-repository'

export type UpdateServiceInput = {
  barbershopId: string
  serviceId: string
  durationMinutes: number
  basePrice: number
}

export type UpdateServiceOutput = {
  id: string
  barbershopId: string
  name: string
  durationMinutes: number
  basePrice: number
}

/** Atualiza só duração/preço de um serviço habilitado — o nome nunca é alterável. */
export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(input: UpdateServiceInput): Promise<UpdateServiceOutput> {
    const service = await this.serviceRepository.findById(input.serviceId)
    if (!service) throw new Error('Service not found.')
    if (service.barbershopId !== input.barbershopId) throw new Error('Service does not belong to this barbershop.')
    if (!service.isActive) throw new Error('Service is not enabled.')

    const updated = service.withDetails({ durationMinutes: input.durationMinutes, basePrice: input.basePrice })
    await this.serviceRepository.save(updated)

    return {
      id: updated.id,
      barbershopId: updated.barbershopId,
      name: updated.name,
      durationMinutes: updated.durationMinutes,
      basePrice: updated.basePrice,
    }
  }
}
