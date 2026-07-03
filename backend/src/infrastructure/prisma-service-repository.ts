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
    const rows = await this.db.service.findMany({ where: { barbershopId, isActive: true } })
    return rows.map((r) => this.toEntity(r))
  }

  async findByBarbershopIdAndName(barbershopId: string, name: string): Promise<Service | null> {
    const row = await this.db.service.findUnique({ where: { barbershopId_name: { barbershopId, name } } })
    return row ? this.toEntity(row) : null
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
        isActive: service.isActive,
      },
      update: {
        name: service.name,
        durationMinutes: service.durationMinutes,
        basePrice: service.basePrice,
        description: service.description ?? null,
        isActive: service.isActive,
      },
    })
  }

  private toEntity(row: {
    id: string; barbershopId: string; name: string
    durationMinutes: number; basePrice: number; description: string | null; isActive: boolean
  }): Service {
    return Service.restore({
      id: row.id,
      barbershopId: row.barbershopId,
      name: row.name,
      durationMinutes: row.durationMinutes,
      basePrice: row.basePrice,
      isActive: row.isActive,
      ...(row.description && { description: row.description }),
    })
  }
}
