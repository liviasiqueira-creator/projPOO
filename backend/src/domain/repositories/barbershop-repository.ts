import type { Barbershop } from '../entities/barbershop'

export type BarbershopFilters = {
  city?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
  serviceId?: string
}

export interface BarbershopRepository {
  findById(id: string): Promise<Barbershop | null>
  findBySlug(slug: string): Promise<Barbershop | null>
  findAll(filters?: BarbershopFilters): Promise<Barbershop[]>
  save(barbershop: Barbershop): Promise<void>
}
