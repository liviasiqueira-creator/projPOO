import type { Service } from '../entities/service'

export interface ServiceRepository {
  findById(id: string): Promise<Service | null>
  findByBarbershopId(barbershopId: string): Promise<Service[]>
  save(service: Service): Promise<void>
}
