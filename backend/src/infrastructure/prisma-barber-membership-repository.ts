import type { PrismaClient } from '../generated/prisma/client'
import type { BarberMembershipRepository } from '../domain/repositories/barber-membership-repository'
import { BarberMembership, type AllowedShift } from '../domain/entities/barber-membership'

export class PrismaBarberMembershipRepository implements BarberMembershipRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByBarberUserId(barberUserId: string): Promise<BarberMembership[]> {
    const rows = await this.db.barberMembership.findMany({ where: { barberUserId } })
    return rows.map((r) => this.toEntity(r))
  }

  async findByBarbershopId(barbershopId: string): Promise<BarberMembership[]> {
    const rows = await this.db.barberMembership.findMany({ where: { barbershopId } })
    return rows.map((r) => this.toEntity(r))
  }

  async findByBarberAndBarbershop(barberUserId: string, barbershopId: string): Promise<BarberMembership | null> {
    const row = await this.db.barberMembership.findUnique({
      where: { barberUserId_barbershopId: { barberUserId, barbershopId } },
    })
    return row ? this.toEntity(row) : null
  }

  async save(membership: BarberMembership): Promise<void> {
    await this.db.barberMembership.upsert({
      where: { id: membership.id },
      create: {
        id: membership.id,
        barberUserId: membership.barberUserId,
        barbershopId: membership.barbershopId,
        isExclusive: membership.isExclusive,
        allowedShift: membership.allowedShift ?? null,
      },
      update: {
        isExclusive: membership.isExclusive,
        allowedShift: membership.allowedShift ?? null,
      },
    })
  }

  async update(membership: BarberMembership): Promise<void> {
    await this.db.barberMembership.update({
      where: { id: membership.id },
      data: {
        isExclusive: membership.isExclusive,
        allowedShift: membership.allowedShift ?? null,
      },
    })
  }

  private toEntity(row: {
    id: string; barberUserId: string; barbershopId: string
    isExclusive: boolean; allowedShift: string | null
  }): BarberMembership {
    return BarberMembership.create({
      id: row.id,
      barberUserId: row.barberUserId,
      barbershopId: row.barbershopId,
      isExclusive: row.isExclusive,
      ...(row.allowedShift && { allowedShift: row.allowedShift as AllowedShift }),
    })
  }
}
