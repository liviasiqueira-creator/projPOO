import type { BarbershopRepository, BarbershopFilters } from '../domain/repositories/barbershop-repository'
import type { Barbershop } from '../domain/entities/barbershop'

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

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

  async findAll(filters?: BarbershopFilters): Promise<Barbershop[]> {
    let results = [...this.barbershops.values()].filter((b) => b.isActive)

    if (filters?.city) {
      const city = filters.city.toLowerCase()
      results = results.filter((b) => b.city?.toLowerCase() === city)
    }

    if (filters?.latitude !== undefined && filters?.longitude !== undefined) {
      const radius = filters.radiusKm ?? 10
      results = results.filter((b) => {
        if (b.latitude === undefined || b.longitude === undefined) return false
        return haversineKm(filters.latitude!, filters.longitude!, b.latitude, b.longitude) <= radius
      })
    }

    return results
  }

  async save(barbershop: Barbershop): Promise<void> {
    this.barbershops.set(barbershop.id, barbershop)
  }
}
