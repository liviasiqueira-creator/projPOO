import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { LoyaltyReward } from './loyalty-reward'

describe('LoyaltyReward', () => {
  test('calcula expiresAt como 30 dias após earnedAt', () => {
    const earnedAt = new Date('2026-01-01T00:00:00.000Z')
    const reward = LoyaltyReward.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis', earnedAt })

    assert.equal(reward.expiresAt.getTime(), earnedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
    assert.equal(reward.redeemed, false)
  })

  test('isRedeemableAt é true antes da expiração e antes do resgate', () => {
    const reward = LoyaltyReward.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis', earnedAt: new Date() })
    assert.equal(reward.isRedeemableAt(new Date()), true)
  })

  test('isRedeemableAt é false após a expiração', () => {
    const earnedAt = new Date('2026-01-01T00:00:00.000Z')
    const reward = LoyaltyReward.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis', earnedAt })
    const after31Days = new Date(earnedAt.getTime() + 31 * 24 * 60 * 60 * 1000)
    assert.equal(reward.isRedeemableAt(after31Days), false)
  })

  test('redeem marca como resgatado', () => {
    const reward = LoyaltyReward.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis', earnedAt: new Date() })
    const redeemed = reward.redeem('appt-1')
    assert.equal(redeemed.redeemed, true)
    assert.equal(redeemed.redeemedAppointmentId, 'appt-1')
    assert.equal(reward.redeemed, false) // original não muda
  })

  test('lança erro ao resgatar recompensa já resgatada', () => {
    const reward = LoyaltyReward.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis', earnedAt: new Date() })
    const redeemed = reward.redeem('appt-1')
    assert.throws(() => redeemed.redeem('appt-2'), /already redeemed/)
  })

  test('lança erro ao resgatar recompensa expirada', () => {
    const earnedAt = new Date('2026-01-01T00:00:00.000Z')
    const reward = LoyaltyReward.create({ id: '1', clientUserId: 'c1', barbershopId: 's1', type: 'barba_gratis', earnedAt })
    const after31Days = new Date(earnedAt.getTime() + 31 * 24 * 60 * 60 * 1000)
    assert.throws(() => reward.redeem('appt-1', after31Days), /expired/)
  })
})
