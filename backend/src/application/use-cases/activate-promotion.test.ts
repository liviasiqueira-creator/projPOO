import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { ActivatePromotionUseCase } from './activate-promotion'
import type { BarbershopPromotionRepository } from '../../domain/repositories/barbershop-promotion-repository'
import { BarbershopPromotion } from '../../domain/entities/barbershop-promotion'

const makeFakeRepo = (existing?: BarbershopPromotion): BarbershopPromotionRepository => {
  let stored = existing
  return {
    findByBarbershopId: async () => stored ? [stored] : [],
    findByBarbershopIdAndType: async () => stored ?? null,
    save: async (p) => { stored = p },
  }
}

describe('ActivatePromotionUseCase', () => {
  test('ativa uma promoção inexistente (cria e ativa)', async () => {
    const useCase = new ActivatePromotionUseCase(makeFakeRepo())
    const result = await useCase.execute({ barbershopId: 'shop-1', type: 'barba_gratis' })

    assert.equal(result.active, true)
    assert.ok(result.activatedAt)
  })

  test('lança erro ao ativar promoção já ativa', async () => {
    const existing = BarbershopPromotion.create({ id: '1', barbershopId: 'shop-1', type: 'barba_gratis' }).activate()
    const useCase = new ActivatePromotionUseCase(makeFakeRepo(existing))
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', type: 'barba_gratis' }),
      /already active/
    )
  })
})
