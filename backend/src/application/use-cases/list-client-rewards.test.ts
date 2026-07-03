import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { ListClientRewardsUseCase } from './list-client-rewards'
import type { LoyaltyRewardRepository } from '../../domain/repositories/loyalty-reward-repository'
import { LoyaltyReward } from '../../domain/entities/loyalty-reward'

const makeFakeRepo = (rewards: LoyaltyReward[]): LoyaltyRewardRepository => ({
  findById: async (id) => rewards.find((r) => r.id === id) ?? null,
  findByClientAndBarbershop: async (clientUserId, barbershopId) =>
    rewards.filter((r) => r.clientUserId === clientUserId && r.barbershopId === barbershopId),
  save: async () => {},
  update: async () => {},
})

describe('ListClientRewardsUseCase', () => {
  test('retorna só as recompensas do cliente naquela barbearia', async () => {
    const reward1 = LoyaltyReward.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis', earnedAt: new Date() })
    const reward2 = LoyaltyReward.create({ id: '2', clientUserId: 'c1', barbershopId: 's2', type: 'corte_gratis', earnedAt: new Date() })
    const reward3 = LoyaltyReward.create({ id: '3', clientUserId: 'c2', barbershopId: 's1', type: 'barba_gratis', earnedAt: new Date() })

    const useCase = new ListClientRewardsUseCase(makeFakeRepo([reward1, reward2, reward3]))
    const result = await useCase.execute({ clientUserId: 'c1', barbershopId: 's1' })

    assert.equal(result.length, 1)
    assert.equal(result[0]?.id, '1')
  })
})
