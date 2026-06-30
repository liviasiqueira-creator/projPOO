import type { ServiceRepository } from '../domain/repositories/service-repository'
import type { Service } from '../domain/entities/service'

export class InMemoryServiceRepository implements ServiceRepository {
  private readonly services = new Map<string, Service>()

  async findById(id: string): Promise<Service | null> {
    return this.services.get(id) ?? null
  }

  async findByBarbershopId(barbershopId: string): Promise<Service[]> {
    return [...this.services.values()].filter(
      (s) => s.barbershopId === barbershopId && s.isActive
    )
  }

  async save(service: Service): Promise<void> {
    this.services.set(service.id, service)
  }
}
