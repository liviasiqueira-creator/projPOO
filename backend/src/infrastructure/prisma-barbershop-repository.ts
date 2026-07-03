import type { PrismaClient } from '../generated/prisma/client'
import type { BarbershopRepository, BarbershopFilters } from '../domain/repositories/barbershop-repository'
import { Barbershop } from '../domain/entities/barbershop'

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export class PrismaBarbershopRepository implements BarbershopRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Barbershop | null> {
    const row = await this.db.barbershop.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findBySlug(slug: string): Promise<Barbershop | null> {
    const row = await this.db.barbershop.findUnique({ where: { slug } })
    return row ? this.toEntity(row) : null
  }

  async findByOwnerUserId(ownerUserId: string): Promise<Barbershop | null> {
    const row = await this.db.barbershop.findFirst({ where: { ownerUserId } })
    return row ? this.toEntity(row) : null
  }

  async findAll(filters?: BarbershopFilters): Promise<Barbershop[]> {
    const rows = filters?.city !== undefined
      ? await this.db.barbershop.findMany({ where: { city: filters.city } })
      : await this.db.barbershop.findMany()

    let results = rows.map((r) => this.toEntity(r))

    if (filters?.latitude !== undefined && filters.longitude !== undefined && filters.radiusKm !== undefined) {
      results = results.filter((b) =>
        b.latitude !== undefined && b.longitude !== undefined &&
        haversineKm(filters.latitude!, filters.longitude!, b.latitude, b.longitude) <= filters.radiusKm!
      )
    }

    return results
  }

  async save(barbershop: Barbershop): Promise<void> {
    await this.db.barbershop.upsert({
      where: { id: barbershop.id },
      create: {
        id: barbershop.id,
        name: barbershop.name,
        slug: barbershop.slug.value,
        address: barbershop.address ?? null,
        city: barbershop.city ?? null,
        phone: barbershop.phone?.value ?? null,
        logoUrl: barbershop.logoUrl?.value ?? null,
        latitude: barbershop.latitude ?? null,
        longitude: barbershop.longitude ?? null,
        ownerUserId: barbershop.ownerUserId ?? null,
      },
      update: {
        name: barbershop.name,
        slug: barbershop.slug.value,
        address: barbershop.address ?? null,
        city: barbershop.city ?? null,
        phone: barbershop.phone?.value ?? null,
        logoUrl: barbershop.logoUrl?.value ?? null,
        latitude: barbershop.latitude ?? null,
        longitude: barbershop.longitude ?? null,
        ownerUserId: barbershop.ownerUserId ?? null,
      },
    })
  }

  private toEntity(row: {
    id: string; name: string; slug: string; address: string | null; city: string | null
    phone: string | null; logoUrl: string | null; latitude: number | null; longitude: number | null
    ownerUserId: string | null
  }): Barbershop {
    return Barbershop.restore({
      id: row.id,
      name: row.name,
      slug: row.slug,
      ...(row.address && { address: row.address }),
      ...(row.city && { city: row.city }),
      ...(row.phone && { phone: row.phone }),
      ...(row.logoUrl && { logoUrl: row.logoUrl }),
      ...(row.latitude !== null && { latitude: row.latitude }),
      ...(row.longitude !== null && { longitude: row.longitude }),
      ...(row.ownerUserId && { ownerUserId: row.ownerUserId }),
    })
  }
}
