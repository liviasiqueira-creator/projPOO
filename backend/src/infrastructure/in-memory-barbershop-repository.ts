import type { BarbershopRepository } from '../domain/repositories/barbershop-repository'
import type { Barbershop } from '../domain/entities/barbershop'

export class InMemoryBarbershopRepository implements BarbershopRepository {
  private readonly barbershops = new Map<string, Barbershop>()

  async findById(id: string): Promise<Barbershop | null> {
    return this.barbershops.get(id) ?? null
  }

  async findBySlug(slug: string): Promise<Barbershop | null> {
    for (const barbershop of this.barbershops.values()) {
      if (barbershop.slug.value === slug) return barbershop
    }
    return null
  }

  async save(barbershop: Barbershop): Promise<void> {
    this.barbershops.set(barbershop.id, barbershop)
  }
}
