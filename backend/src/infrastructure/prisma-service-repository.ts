import type { PrismaClient } from '../generated/prisma/client'
import type { ServiceRepository } from '../domain/repositories/service-repository'
import { Service } from '../domain/entities/service'

export class PrismaServiceRepository implements ServiceRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Service | null> {
    const row = await this.db.service.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByBarbershopId(barbershopId: string): Promise<Service[]> {
    const rows = await this.db.service.findMany({ where: { barbershopId } })
    return rows.map((r) => this.toEntity(r))
  }

  async save(service: Service): Promise<void> {
    await this.db.service.upsert({
      where: { id: service.id },
      create: {
        id: service.id,
        barbershopId: service.barbershopId,
        name: service.name,
        durationMinutes: service.durationMinutes,
        basePrice: service.basePrice,
        description: service.description ?? null,
      },
      update: {
        name: service.name,
        durationMinutes: service.durationMinutes,
        basePrice: service.basePrice,
        description: service.description ?? null,
      },
    })
  }

  private toEntity(row: {
    id: string; barbershopId: string; name: string
    durationMinutes: number; basePrice: number; description: string | null
  }): Service {
    return Service.create({
      id: row.id,
      barbershopId: row.barbershopId,
      name: row.name,
      durationMinutes: row.durationMinutes,
      basePrice: row.basePrice,
      ...(row.description && { description: row.description }),
    })
  }
}
