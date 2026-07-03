import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { BarbershopPromotion } from './barbershop-promotion'

const days = (n: number) => n * 24 * 60 * 60 * 1000

describe('BarbershopPromotion', () => {
  test('cria promoção inativa por padrão', () => {
    const promotion = BarbershopPromotion.create({ id: '1', barbershopId: 's1', type: 'barba_gratis' })
    assert.equal(promotion.active, false)
    assert.equal(promotion.activatedAt, undefined)
  })

  test('activate marca como ativa com a data atual', () => {
    const promotion = BarbershopPromotion.create({ id: '1', barbershopId: 's1', type: 'barba_gratis' })
    const now = new Date('2026-01-01T00:00:00.000Z')
    const activated = promotion.activate(now)
    assert.equal(activated.active, true)
    assert.equal(activated.activatedAt?.getTime(), now.getTime())
  })

  test('lança erro ao ativar promoção já ativa', () => {
    const promotion = BarbershopPromotion.create({ id: '1', barbershopId: 's1', type: 'barba_gratis' }).activate()
    assert.throws(() => promotion.activate(), /already active/)
  })

  test('lança erro ao desativar antes de 30 dias', () => {
    const activatedAt = new Date('2026-01-01T00:00:00.000Z')
    const promotion = BarbershopPromotion.restore({ id: '1', barbershopId: 's1', type: 'barba_gratis', active: true, activatedAt })
    const day29 = new Date(activatedAt.getTime() + days(29))
    assert.throws(() => promotion.deactivate(day29), /30 days/)
  })

  test('permite desativar após 30 dias', () => {
    const activatedAt = new Date('2026-01-01T00:00:00.000Z')
    const promotion = BarbershopPromotion.restore({ id: '1', barbershopId: 's1', type: 'barba_gratis', active: true, activatedAt })
    const day31 = new Date(activatedAt.getTime() + days(31))
    const deactivated = promotion.deactivate(day31)
    assert.equal(deactivated.active, false)
  })

  test('lança erro ao desativar promoção já inativa', () => {
    const promotion = BarbershopPromotion.create({ id: '1', barbershopId: 's1', type: 'barba_gratis' })
    assert.throws(() => promotion.deactivate(), /already inactive/)
  })
})
