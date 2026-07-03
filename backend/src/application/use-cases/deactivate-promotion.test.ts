import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { DeactivatePromotionUseCase } from './deactivate-promotion'
import type { BarbershopPromotionRepository } from '../../domain/repositories/barbershop-promotion-repository'
import { BarbershopPromotion } from '../../domain/entities/barbershop-promotion'

const days = (n: number) => n * 24 * 60 * 60 * 1000

const makeFakeRepo = (existing?: BarbershopPromotion): BarbershopPromotionRepository => {
  let stored = existing
  return {
    findByBarbershopId: async () => stored ? [stored] : [],
    findByBarbershopIdAndType: async () => stored ?? null,
    save: async (p) => { stored = p },
  }
}

describe('DeactivatePromotionUseCase', () => {
  test('lança erro se a promoção não existe', async () => {
    const useCase = new DeactivatePromotionUseCase(makeFakeRepo())
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', type: 'barba_gratis' }),
      /not found/
    )
  })

  test('lança erro ao desativar antes de 30 dias', async () => {
    const activatedAt = new Date(Date.now() - days(10))
    const existing = BarbershopPromotion.restore({ id: '1', barbershopId: 'shop-1', type: 'barba_gratis', active: true, activatedAt })
    const useCase = new DeactivatePromotionUseCase(makeFakeRepo(existing))
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', type: 'barba_gratis' }),
      /30 days/
    )
  })

  test('desativa após 30 dias', async () => {
    const activatedAt = new Date(Date.now() - days(31))
    const existing = BarbershopPromotion.restore({ id: '1', barbershopId: 'shop-1', type: 'barba_gratis', active: true, activatedAt })
    const useCase = new DeactivatePromotionUseCase(makeFakeRepo(existing))
    const result = await useCase.execute({ barbershopId: 'shop-1', type: 'barba_gratis' })

    assert.equal(result.active, false)
  })
})
