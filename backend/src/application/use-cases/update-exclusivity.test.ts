import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { UpdateExclusivityUseCase } from './update-exclusivity'
import type { BarberMembershipRepository } from '../../domain/repositories/barber-membership-repository'
import { BarberMembership } from '../../domain/entities/barber-membership'

const membershipShop1 = BarberMembership.create({ id: 'mem-1', barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: false })
const membershipShop2 = BarberMembership.create({ id: 'mem-2', barberUserId: 'barber-1', barbershopId: 'shop-2', isExclusive: false })
const exclusiveMembership = BarberMembership.create({ id: 'mem-1', barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: true })

const makeFakeRepo = (existing: BarberMembership[]): BarberMembershipRepository => {
  const memberships = [...existing]
  return {
    findByBarberUserId: async (userId) => memberships.filter((m) => m.barberUserId === userId),
    findByBarbershopId: async (shopId) => memberships.filter((m) => m.barbershopId === shopId),
    findByBarberAndBarbershop: async (userId, shopId) =>
      memberships.find((m) => m.barberUserId === userId && m.barbershopId === shopId) ?? null,
    save: async () => {},
    update: async (updated) => {
      const idx = memberships.findIndex((m) => m.id === updated.id)
      if (idx !== -1) memberships[idx] = updated
    },
  }
}

describe('UpdateExclusivityUseCase', () => {
  test('enrijece exclusividade quando barbeiro não tem outros vínculos', async () => {
    const useCase = new UpdateExclusivityUseCase(makeFakeRepo([membershipShop1]))
    const result = await useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: true })

    assert.equal(result.isExclusive, true)
  })

  test('afrouxa exclusividade livremente mesmo com outros vínculos', async () => {
    const useCase = new UpdateExclusivityUseCase(makeFakeRepo([exclusiveMembership, membershipShop2]))
    const result = await useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: false })

    assert.equal(result.isExclusive, false)
  })

  test('lança erro se membership não existe', async () => {
    const useCase = new UpdateExclusivityUseCase(makeFakeRepo([]))
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: true }),
      /not found/
    )
  })

  test('lança erro ao enrijecer exclusividade com outros vínculos ativos', async () => {
    const useCase = new UpdateExclusivityUseCase(makeFakeRepo([membershipShop1, membershipShop2]))
    await assert.rejects(
      () => useCase.execute({ barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: true }),
      /already works at another/
    )
  })
})
