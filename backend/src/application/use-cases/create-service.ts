import { randomUUID } from 'node:crypto'
import { Service } from '../../domain/entities/service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { BarbershopRepository } from '../../domain/repositories/barbershop-repository'

export type CreateServiceInput = {
  barbershopId: string
  name: string
  durationMinutes: number
  basePrice: number
  description?: string
}

export type CreateServiceOutput = {
  id: string
  barbershopId: string
  name: string
  durationMinutes: number
  basePrice: number
}

export class CreateServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly barbershopRepository: BarbershopRepository,
  ) {}

  async execute(input: CreateServiceInput): Promise<CreateServiceOutput> {
    const barbershop = await this.barbershopRepository.findById(input.barbershopId)
    if (!barbershop) throw new Error('Barbershop not found.')

    const service = Service.create({
      id: randomUUID(),
      ...input,
    })

    await this.serviceRepository.save(service)

    return {
      id: service.id,
      barbershopId: service.barbershopId,
      name: service.name,
      durationMinutes: service.durationMinutes,
      basePrice: service.basePrice,
    }
  }
}
