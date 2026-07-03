import { randomUUID } from 'node:crypto'
import { Service, FIXED_SERVICE_NAMES, type FixedServiceName } from '../../domain/entities/service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { BarbershopRepository } from '../../domain/repositories/barbershop-repository'

export type EnableServiceInput = {
  barbershopId: string
  name: string
}

export type EnableServiceOutput = {
  id: string
  barbershopId: string
  name: string
  durationMinutes: number
  basePrice: number
}

/**
 * Habilita, para uma barbearia, um dos serviços do catálogo fixo (Corte, Barba, Sobrancelha).
 * Não aceita nomes livres. Se o serviço já existiu e foi removido (isActive=false),
 * reativa mantendo o preço/duração customizados anteriormente.
 */
export class EnableServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly barbershopRepository: BarbershopRepository,
  ) {}

  async execute(input: EnableServiceInput): Promise<EnableServiceOutput> {
    const barbershop = await this.barbershopRepository.findById(input.barbershopId)
    if (!barbershop) throw new Error('Barbershop not found.')

    if (!(FIXED_SERVICE_NAMES as readonly string[]).includes(input.name)) {
      throw new Error('Invalid service name. Must be one of: Corte, Barba, Sobrancelha.')
    }
    const name = input.name as FixedServiceName

    const existing = await this.serviceRepository.findByBarbershopIdAndName(input.barbershopId, name)
    if (existing?.isActive) throw new Error('Service already enabled for this barbershop.')

    const service = existing
      ? existing.activate()
      : Service.createDefault({ id: randomUUID(), barbershopId: input.barbershopId, name })

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
