import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { HireBarberUseCase } from './hire-barber'
import type { BarberMembershipRepository } from '../../domain/repositories/barber-membership-repository'
import type { UserRepository } from '../../domain/repositories/user-repository'
import type { BarbershopRepository } from '../../domain/repositories/barbershop-repository'
import { User, UserRole } from '../../domain/entities/user'
import { Barbershop } from '../../domain/entities/barbershop'
import { BarberMembership } from '../../domain/entities/barber-membership'

const barber = User.create({ id: 'barber-1', email: 'barber@email.com', passwordHash: 'hash', name: 'Barbeiro', role: UserRole.Barber })
const client = User.create({ id: 'client-1', email: 'client@email.com', passwordHash: 'hash', name: 'Cliente', role: UserRole.Client })
const barbershop1 = Barbershop.create({ id: 'shop-1', name: 'Barbearia Um' })
const barbershop2 = Barbershop.create({ id: 'shop-2', name: 'Barbearia Dois' })

const makeFakeUserRepo = (user?: typeof barber): UserRepository => ({
  findByEmail: async () => null,
  findById: async (id) => id === user?.id ? user : null,
  save: async () => {},
})

const makeFakeBarbershopRepo = (barbershop?: typeof barbershop1): BarbershopRepository => ({
  findById: async (id) => id === barbershop?.id ? barbershop : null,
  findBySlug: async () => null,
  findByOwnerUserId: async () => null,
  findAll: async () => [],
  save: async () => {},
})

const makeFakeMembershipRepo = (existing: BarberMembership[] = []): BarberMembershipRepository => ({
  findByBarberUserId: async (userId) => existing.filter((m) => m.barberUserId === userId),
  findByBarbershopId: async (shopId) => existing.filter((m) => m.barbershopId === shopId),
  findByBarberAndBarbershop: async (userId, shopId) =>
    existing.find((m) => m.barberUserId === userId && m.barbershopId === shopId) ?? null,
  save: async () => {},
  update: async () => {},
})

describe('HireBarberUseCase', () => {
  test('contrata barbeiro com sucesso', async () => {
    const useCase = new HireBarberUseCase(
      makeFakeMembershipRepo(),
      makeFakeUserRepo(barber),
      makeFakeBarbershopRepo(barbershop1),
    )
    const result = await useCase.execute({
      barberUserId: 'barber-1',
      barbershopId: 'shop-1',
      isExclusive: false,
    })

    assert.ok(result.id)
    assert.equal(result.barberUserId, 'barber-1')
    assert.equal(result.barbershopId, 'shop-1')
    assert.equal(result.isExclusive, false)
  })

  test('lança erro se barbeiro não existe', async () => {
    const useCase = new HireBarberUseCase(
      makeFakeMembershipRepo(),
      makeFakeUserRepo(),
      makeFakeBarbershopRepo(barbershop1),
    )
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'inexistente', barbershopId: 'shop-1', isExclusive: false }),
      /not found/
    )
  })

  test('lança erro se usuário não é barbeiro', async () => {
    const useCase = new HireBarberUseCase(
      makeFakeMembershipRepo(),
      makeFakeUserRepo(client),
      makeFakeBarbershopRepo(barbershop1),
    )
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'client-1', barbershopId: 'shop-1', isExclusive: false }),
      /not a barber/
    )
  })

  test('lança erro se barbearia não existe', async () => {
    const useCase = new HireBarberUseCase(
      makeFakeMembershipRepo(),
      makeFakeUserRepo(barber),
      makeFakeBarbershopRepo(),
    )
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'barber-1', barbershopId: 'inexistente', isExclusive: false }),
      /not found/
    )
  })

  test('lança erro se barbeiro já é membro desta barbearia', async () => {
    const existing = BarberMembership.create({ id: 'mem-1', barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: false })
    const useCase = new HireBarberUseCase(
      makeFakeMembershipRepo([existing]),
      makeFakeUserRepo(barber),
      makeFakeBarbershopRepo(barbershop1),
    )
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: false }),
      /already a member/
    )
  })

  test('lança erro se barbeiro é exclusivo em outra barbearia', async () => {
    const exclusive = BarberMembership.create({ id: 'mem-1', barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: true })
    const useCase = new HireBarberUseCase(
      makeFakeMembershipRepo([exclusive]),
      makeFakeUserRepo(barber),
      makeFakeBarbershopRepo(barbershop2),
    )
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-2', isExclusive: false }),
      /exclusive to another/
    )
  })

  test('lança erro ao contratar como exclusivo se barbeiro já tem outro vínculo', async () => {
    const existing = BarberMembership.create({ id: 'mem-1', barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: false })
    const useCase = new HireBarberUseCase(
      makeFakeMembershipRepo([existing]),
      makeFakeUserRepo(barber),
      makeFakeBarbershopRepo(barbershop2),
    )
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-2', isExclusive: true }),
      /already work at another/
    )
  })
})
