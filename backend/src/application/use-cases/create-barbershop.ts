import { randomUUID } from 'node:crypto'
import { Barbershop } from '../../domain/entities/barbershop'
import { Service } from '../../domain/entities/service'
import type { BarbershopRepository } from '../../domain/repositories/barbershop-repository'
import type { UserRepository } from '../../domain/repositories/user-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import { UserRole } from '../../domain/entities/user'

export type CreateBarbershopInput = {
  name: string
  address?: string
  city?: string
  phone?: string
  logoUrl?: string
  ownerUserId: string
}

export type CreateBarbershopOutput = {
  id: string
  name: string
  slug: string
}

const DEFAULT_SERVICES = [
  { name: 'Corte', durationMinutes: 30, basePrice: 40 },
  { name: 'Barba', durationMinutes: 20, basePrice: 25 },
  { name: 'Sobrancelha', durationMinutes: 10, basePrice: 15 },
]

export class CreateBarbershopUseCase {
  constructor(
    private readonly barbershopRepository: BarbershopRepository,
    private readonly userRepository: UserRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: CreateBarbershopInput): Promise<CreateBarbershopOutput> {
    const barbershop = Barbershop.create({
      id: randomUUID(),
      ...input,
    })

    const existing = await this.barbershopRepository.findBySlug(barbershop.slug.value)
    if (existing) throw new Error('A barbershop with this name already exists.')

    await this.barbershopRepository.save(barbershop)

    for (const defaultService of DEFAULT_SERVICES) {
      await this.serviceRepository.save(Service.create({
        id: randomUUID(),
        barbershopId: barbershop.id,
        ...defaultService,
      }))
    }

    const owner = await this.userRepository.findById(input.ownerUserId)
    if (owner && owner.role === UserRole.Client) {
      await this.userRepository.save(owner.withRole(UserRole.Barber))
    }

    return {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug.value,
    }
  }
}
