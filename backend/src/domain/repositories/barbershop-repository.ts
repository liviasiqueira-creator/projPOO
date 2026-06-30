import type { Barbershop } from '../entities/barbershop'

export interface BarbershopRepository {
  findById(id: string): Promise<Barbershop | null>
  findBySlug(slug: string): Promise<Barbershop | null>
  save(barbershop: Barbershop): Promise<void>
}
