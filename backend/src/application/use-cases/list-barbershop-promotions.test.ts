import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { ListBarbershopPromotionsUseCase } from './list-barbershop-promotions'
import type { BarbershopPromotionRepository } from '../../domain/repositories/barbershop-promotion-repository'
import { BarbershopPromotion } from '../../domain/entities/barbershop-promotion'

const makeFakeRepo = (): BarbershopPromotionRepository & { saved: BarbershopPromotion[] } => {
  const promotions = new Map<string, BarbershopPromotion>()
  const saved: BarbershopPromotion[] = []
  return {
    saved,
    findByBarbershopId: async (barbershopId) => [...promotions.values()].filter((p) => p.barbershopId === barbershopId),
    findByBarbershopIdAndType: async (barbershopId, type) =>
      [...promotions.values()].find((p) => p.barbershopId === barbershopId && p.type === type) ?? null,
    save: async (p) => { promotions.set(p.id, p); saved.push(p) },
  }
}

describe('ListBarbershopPromotionsUseCase', () => {
  test('cria as 2 promoções fixas (inativas) na primeira consulta', async () => {
    const repo = makeFakeRepo()
    const useCase = new ListBarbershopPromotionsUseCase(repo)
    const result = await useCase.execute({ barbershopId: 'shop-1' })

    assert.equal(result.length, 2)
    assert.ok(result.every((p) => p.active === false))
    assert.deepEqual(result.map((p) => p.type).sort(), ['barba_gratis', 'corte_gratis'])
    assert.equal(repo.saved.length, 2)
  })

  test('retorna as promoções já existentes sem recriá-las', async () => {
    const repo = makeFakeRepo()
    const useCase = new ListBarbershopPromotionsUseCase(repo)
    await useCase.execute({ barbershopId: 'shop-1' })
    await useCase.execute({ barbershopId: 'shop-1' })

    assert.equal(repo.saved.length, 2) // não duplicou
  })
})
