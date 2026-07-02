import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { SetBarberAvailabilityUseCase } from './set-barber-availability'
import type { BarberAvailabilityRepository } from '../../domain/repositories/barber-availability-repository'
import type { BarberMembershipRepository } from '../../domain/repositories/barber-membership-repository'
import { BarberAvailability } from '../../domain/entities/barber-availability'
import { BarberMembership } from '../../domain/entities/barber-membership'

const membership = BarberMembership.create({ id: 'mem-1', barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: false })

const makeFakeMembershipRepo = (mem?: BarberMembership): BarberMembershipRepository => ({
  findByBarberUserId: async () => mem ? [mem] : [],
  findByBarbershopId: async () => [],
  findByBarberAndBarbershop: async (userId, shopId) =>
    mem?.barberUserId === userId && mem?.barbershopId === shopId ? mem : null,
  save: async () => {},
  update: async () => {},
})

const makeFakeAvailabilityRepo = (existing: BarberAvailability[] = []): BarberAvailabilityRepository => ({
  findByBarberAndBarbershop: async (userId, shopId) =>
    existing.filter((b) => b.barberUserId === userId && b.barbershopId === shopId),
  findByBarberUserId: async (userId) => existing.filter((b) => b.barberUserId === userId),
  findByBarbershopId: async (shopId) => existing.filter((b) => b.barbershopId === shopId),
  findAvailableBarbers: async () => [],
  save: async () => {},
  delete: async () => {},
})

describe('SetBarberAvailabilityUseCase', () => {
  test('define disponibilidade com dados válidos', async () => {
    const useCase = new SetBarberAvailabilityUseCase(
      makeFakeAvailabilityRepo(),
      makeFakeMembershipRepo(membership),
    )
    const result = await useCase.execute({
      barberUserId: 'barber-1',
      barbershopId: 'shop-1',
      weekday: 1,
      startTime: '09:00',
      endTime: '18:00',
    })

    assert.ok(result.id)
    assert.equal(result.weekday, 1)
    assert.equal(result.startTime, '09:00')
    assert.equal(result.endTime, '18:00')
  })

  test('lança erro se barbeiro não é membro da barbearia', async () => {
    const useCase = new SetBarberAvailabilityUseCase(
      makeFakeAvailabilityRepo(),
      makeFakeMembershipRepo(),
    )
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-1', weekday: 1, startTime: '09:00', endTime: '18:00' }),
      /not a member/
    )
  })

  test('lança erro se bloco sobrepõe outro bloco do mesmo barbeiro em outra barbearia', async () => {
    const existingBlock = BarberAvailability.create({
      id: 'block-1',
      barberUserId: 'barber-1',
      barbershopId: 'shop-2', // outra barbearia
      weekday: 1,
      startTime: '10:00',
      endTime: '14:00',
    })
    const useCase = new SetBarberAvailabilityUseCase(
      makeFakeAvailabilityRepo([existingBlock]),
      makeFakeMembershipRepo(membership),
    )
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-1', weekday: 1, startTime: '12:00', endTime: '17:00' }),
      /overlaps/
    )
  })

  test('lança erro se horário inválido', async () => {
    const useCase = new SetBarberAvailabilityUseCase(
      makeFakeAvailabilityRepo(),
      makeFakeMembershipRepo(membership),
    )
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-1', weekday: 1, startTime: '25:00', endTime: '18:00' }),
      /Invalid/
    )
  })

  test('lança erro se startTime >= endTime', async () => {
    const useCase = new SetBarberAvailabilityUseCase(
      makeFakeAvailabilityRepo(),
      makeFakeMembershipRepo(membership),
    )
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-1', weekday: 1, startTime: '18:00', endTime: '09:00' }),
      /before/
    )
  })
})
