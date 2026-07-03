import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { LoyaltyProgress } from './loyalty-progress'
import { LOYALTY_RULES } from '../value-objects/loyalty-rule'

const BARBA_RULE = LOYALTY_RULES.barba_gratis // threshold 3, windowDays 30
const CORTE_RULE = LOYALTY_RULES.corte_gratis // threshold 5, windowDays 60

const days = (n: number) => n * 24 * 60 * 60 * 1000

describe('LoyaltyProgress', () => {
  test('inicia um novo ciclo no primeiro agendamento', () => {
    const progress = LoyaltyProgress.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis' })
    const { progress: updated, thresholdReached } = progress.registerAppointment(new Date(), BARBA_RULE)

    assert.equal(updated.count, 1)
    assert.equal(thresholdReached, false)
  })

  test('incrementa dentro da janela até bater a meta', () => {
    let progress = LoyaltyProgress.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis' })
    const base = new Date('2026-01-01T00:00:00.000Z')

    let result = progress.registerAppointment(base, BARBA_RULE)
    progress = result.progress
    assert.equal(result.thresholdReached, false)

    result = progress.registerAppointment(new Date(base.getTime() + days(10)), BARBA_RULE)
    progress = result.progress
    assert.equal(progress.count, 2)
    assert.equal(result.thresholdReached, false)

    result = progress.registerAppointment(new Date(base.getTime() + days(20)), BARBA_RULE)
    assert.equal(result.thresholdReached, true)
    assert.equal(result.progress.count, 0) // reseta ao bater a meta
    assert.equal(result.progress.cycleStartedAt, undefined)
  })

  test('reinicia o ciclo se a janela expirar antes de bater a meta', () => {
    let progress = LoyaltyProgress.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis' })
    const base = new Date('2026-01-01T00:00:00.000Z')

    progress = progress.registerAppointment(base, BARBA_RULE).progress
    assert.equal(progress.count, 1)

    // 31 dias depois — estourou a janela de 30 dias
    const result = progress.registerAppointment(new Date(base.getTime() + days(31)), BARBA_RULE)
    assert.equal(result.progress.count, 1) // reiniciou, não virou 2
    assert.equal(result.thresholdReached, false)
    assert.equal(result.progress.cycleStartedAt?.getTime(), base.getTime() + days(31))
  })

  test('trilha do corte usa meta 5 e janela de 60 dias', () => {
    let progress = LoyaltyProgress.create({ id: '2', clientUserId: 'c1', barbershopId: 's1', type: 'corte_gratis' })
    const base = new Date('2026-01-01T00:00:00.000Z')

    for (let i = 0; i < 4; i++) {
      progress = progress.registerAppointment(new Date(base.getTime() + days(i * 10)), CORTE_RULE).progress
    }
    assert.equal(progress.count, 4)

    const result = progress.registerAppointment(new Date(base.getTime() + days(45)), CORTE_RULE)
    assert.equal(result.thresholdReached, true)
  })

  test('o ciclo pode se repetir indefinidamente após bater a meta', () => {
    let progress = LoyaltyProgress.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis' })
    const base = new Date('2026-01-01T00:00:00.000Z')

    for (let i = 0; i < 3; i++) {
      progress = progress.registerAppointment(new Date(base.getTime() + days(i)), BARBA_RULE).progress
    }
    assert.equal(progress.count, 0) // 1º ciclo completo

    let secondCycleReached = false
    for (let i = 0; i < 3; i++) {
      const result = progress.registerAppointment(new Date(base.getTime() + days(100 + i)), BARBA_RULE)
      progress = result.progress
      secondCycleReached = result.thresholdReached
    }
    assert.equal(secondCycleReached, true)
  })
})
