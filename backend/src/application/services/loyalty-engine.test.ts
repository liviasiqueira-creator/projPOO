import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { DefaultLoyaltyEngine } from './loyalty-engine'
import type { LoyaltyProgressRepository } from '../../domain/repositories/loyalty-progress-repository'
import type { LoyaltyRewardRepository } from '../../domain/repositories/loyalty-reward-repository'
import type { BarbershopPromotionRepository } from '../../domain/repositories/barbershop-promotion-repository'
import { LoyaltyProgress } from '../../domain/entities/loyalty-progress'
import { LoyaltyReward } from '../../domain/entities/loyalty-reward'
import { BarbershopPromotion } from '../../domain/entities/barbershop-promotion'
import { Appointment } from '../../domain/entities/appointment'

const days = (n: number) => n * 24 * 60 * 60 * 1000

function makeAppointment(scheduledAt: Date, isRedemption = false) {
  return Appointment.restore({
    id: randomUUID(),
    barbershopId: 'shop-1',
    barberUserId: 'barber-1',
    clientUserId: 'client-1',
    serviceId: 'svc-1',
    scheduledAt,
    durationMinutes: 30,
    priceSnapshot: 40,
    status: 'completed',
    isRedemption,
  })
}

function makeFakeProgressRepo(): LoyaltyProgressRepository {
  const store = new Map<string, LoyaltyProgress>()
  const key = (c: string, b: string, t: string) => `${c}:${b}:${t}`
  return {
    findByClientBarbershopAndType: async (c, b, t) => store.get(key(c, b, t)) ?? null,
    save: async (p) => { store.set(key(p.clientUserId, p.barbershopId, p.type), p) },
  }
}

function makeFakeRewardRepo(): LoyaltyRewardRepository & { rewards: LoyaltyReward[] } {
  const rewards: LoyaltyReward[] = []
  return {
    rewards,
    findById: async (id) => rewards.find((r) => r.id === id) ?? null,
    findByClientAndBarbershop: async (c, b) => rewards.filter((r) => r.clientUserId === c && r.barbershopId === b),
    save: async (r) => { rewards.push(r) },
    update: async () => {},
  }
}

function makeFakePromotionRepo(activeTypes: ('barba_gratis' | 'corte_gratis')[] = []): BarbershopPromotionRepository {
  const promotions = activeTypes.map((type) =>
    BarbershopPromotion.create({ id: randomUUID(), barbershopId: 'shop-1', type }).activate()
  )
  return {
    findByBarbershopId: async () => promotions,
    findByBarbershopIdAndType: async (barbershopId, type) =>
      promotions.find((p) => p.barbershopId === barbershopId && p.type === type) ?? null,
    save: async () => {},
  }
}

describe('DefaultLoyaltyEngine', () => {
  test('concede barba grátis no 3º agendamento pago dentro de 30 dias, só se a promoção estiver ativa', async () => {
    const progressRepo = makeFakeProgressRepo()
    const rewardRepo = makeFakeRewardRepo()
    const engine = new DefaultLoyaltyEngine(progressRepo, rewardRepo, makeFakePromotionRepo(['barba_gratis']))

    const base = new Date('2026-01-01T00:00:00.000Z')
    await engine.processCompletedAppointment(makeAppointment(base))
    await engine.processCompletedAppointment(makeAppointment(new Date(base.getTime() + days(5))))
    await engine.processCompletedAppointment(makeAppointment(new Date(base.getTime() + days(10))))

    const barbaRewards = rewardRepo.rewards.filter((r) => r.type === 'barba_gratis')
    assert.equal(barbaRewards.length, 1)
  })

  test('não concede recompensa se a promoção está inativa no momento em que a meta é batida', async () => {
    const progressRepo = makeFakeProgressRepo()
    const rewardRepo = makeFakeRewardRepo()
    const engine = new DefaultLoyaltyEngine(progressRepo, rewardRepo, makeFakePromotionRepo([])) // nenhuma ativa

    const base = new Date('2026-01-01T00:00:00.000Z')
    await engine.processCompletedAppointment(makeAppointment(base))
    await engine.processCompletedAppointment(makeAppointment(new Date(base.getTime() + days(5))))
    await engine.processCompletedAppointment(makeAppointment(new Date(base.getTime() + days(10))))

    assert.equal(rewardRepo.rewards.length, 0)
  })

  test('reinicia o ciclo se o agendamento cair fora da janela', async () => {
    const progressRepo = makeFakeProgressRepo()
    const rewardRepo = makeFakeRewardRepo()
    const engine = new DefaultLoyaltyEngine(progressRepo, rewardRepo, makeFakePromotionRepo(['barba_gratis']))

    const base = new Date('2026-01-01T00:00:00.000Z')
    await engine.processCompletedAppointment(makeAppointment(base))
    // 40 dias depois — estourou a janela de 30 dias da barba, ciclo reinicia
    await engine.processCompletedAppointment(makeAppointment(new Date(base.getTime() + days(40))))
    await engine.processCompletedAppointment(makeAppointment(new Date(base.getTime() + days(45))))

    // só 2 agendamentos "válidos" no ciclo atual — meta de 3 não foi batida
    assert.equal(rewardRepo.rewards.filter((r) => r.type === 'barba_gratis').length, 0)
  })

  test('ignora agendamentos que são resgate de recompensa (isRedemption)', async () => {
    const progressRepo = makeFakeProgressRepo()
    const rewardRepo = makeFakeRewardRepo()
    const engine = new DefaultLoyaltyEngine(progressRepo, rewardRepo, makeFakePromotionRepo(['barba_gratis']))

    const base = new Date('2026-01-01T00:00:00.000Z')
    await engine.processCompletedAppointment(makeAppointment(base, true))
    await engine.processCompletedAppointment(makeAppointment(new Date(base.getTime() + days(1)), true))
    await engine.processCompletedAppointment(makeAppointment(new Date(base.getTime() + days(2)), true))

    assert.equal(rewardRepo.rewards.length, 0)
  })

  test('as duas trilhas (barba e corte) incrementam em paralelo pelo mesmo fluxo de agendamentos', async () => {
    const progressRepo = makeFakeProgressRepo()
    const rewardRepo = makeFakeRewardRepo()
    const engine = new DefaultLoyaltyEngine(progressRepo, rewardRepo, makeFakePromotionRepo(['barba_gratis', 'corte_gratis']))

    const base = new Date('2026-01-01T00:00:00.000Z')
    for (let i = 0; i < 5; i++) {
      await engine.processCompletedAppointment(makeAppointment(new Date(base.getTime() + days(i * 5))))
    }

    // 5 agendamentos em 20 dias: barba bate meta (3) e reinicia (concedendo 1x), corte bate meta (5) 1x
    assert.equal(rewardRepo.rewards.filter((r) => r.type === 'barba_gratis').length, 1)
    assert.equal(rewardRepo.rewards.filter((r) => r.type === 'corte_gratis').length, 1)
  })
})
