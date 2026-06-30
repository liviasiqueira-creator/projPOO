import { randomUUID } from 'node:crypto'
import { Barbershop } from '../../domain/entities/barbershop'
import type { BarbershopRepository } from '../../domain/repositories/barbershop-repository'

export type CreateBarbershopInput = {
  name: string
  address?: string
  city?: string
  phone?: string
  logoUrl?: string
}

export type CreateBarbershopOutput = {
  id: string
  name: string
  slug: string
}

export class CreateBarbershopUseCase {
  constructor(
    private readonly barbershopRepository: BarbershopRepository,
  ) {}

  async execute(input: CreateBarbershopInput): Promise<CreateBarbershopOutput> {
    const barbershop = Barbershop.create({
      id: randomUUID(),
      ...input,
    })

    const existing = await this.barbershopRepository.findBySlug(barbershop.slug.value)
    if (existing) throw new Error('A barbershop with this name already exists.')

    await this.barbershopRepository.save(barbershop)

    return {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug.value,
    }
  }
}
