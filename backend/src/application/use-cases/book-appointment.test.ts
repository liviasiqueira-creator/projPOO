import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { BookAppointmentUseCase } from './book-appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { BarberMembershipRepository } from '../../domain/repositories/barber-membership-repository'
import type { LoyaltyRewardRepository } from '../../domain/repositories/loyalty-reward-repository'
import { Service } from '../../domain/entities/service'
import { BarberMembership } from '../../domain/entities/barber-membership'
import { Appointment } from '../../domain/entities/appointment'
import { LoyaltyReward } from '../../domain/entities/loyalty-reward'

const future = (offsetMinutes: number) => new Date(Date.now() + offsetMinutes * 60 * 1000)

const service = Service.create({ id: 'svc-1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 })
const beardService = Service.create({ id: 'svc-beard', barbershopId: 'shop-1', name: 'Barba', durationMinutes: 20, basePrice: 25 })
const membership = BarberMembership.create({ id: 'mem-1', barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: false })

const makeFakeServiceRepo = (...services: Service[]): ServiceRepository => ({
  findById: async (id) => services.find((s) => s.id === id) ?? null,
  findByBarbershopId: async () => [],
  findByBarbershopIdAndName: async () => null,
  save: async () => {},
})

const makeFakeMembershipRepo = (mem?: BarberMembership): BarberMembershipRepository => ({
  findByBarberUserId: async () => mem ? [mem] : [],
  findByBarbershopId: async () => [],
  findByBarberAndBarbershop: async (userId, shopId) =>
    mem?.barberUserId === userId && mem?.barbershopId === shopId ? mem : null,
  save: async () => {},
  update: async () => {},
})

const makeFakeAppointmentRepo = (existing: Appointment[] = []): AppointmentRepository => ({
  findById: async () => null,
  findByBarberUserId: async () => existing,
  findByClientUserId: async () => [],
  findByBarbershopId: async () => [],
  findConflicting: async (barberUserId, start, end) =>
    existing.filter((a) =>
      a.barberUserId === barberUserId &&
      a.scheduledAt < end &&
      a.endsAt > start &&
      !['cancelled', 'no_show'].includes(a.status)
    ),
  save: async () => {},
  update: async () => {},
})

const makeFakeLoyaltyRewardRepo = (reward?: LoyaltyReward): LoyaltyRewardRepository & { updated: LoyaltyReward[] } => {
  const updated: LoyaltyReward[] = []
  return {
    updated,
    findById: async (id) => reward?.id === id ? reward : null,
    findByClientAndBarbershop: async () => reward ? [reward] : [],
    save: async () => {},
    update: async (r) => { updated.push(r) },
  }
}

describe('BookAppointmentUseCase', () => {
  test('agenda horário com sucesso', async () => {
    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(service),
      makeFakeMembershipRepo(membership),
      makeFakeLoyaltyRewardRepo(),
    )
    const result = await useCase.execute({
      barbershopId: 'shop-1',
      barberUserId: 'barber-1',
      clientUserId: 'client-1',
      serviceId: 'svc-1',
      scheduledAt: future(60),
    })

    assert.ok(result.id)
    assert.equal(result.status, 'pending')
    assert.equal(result.durationMinutes, 30)
    assert.equal(result.priceSnapshot, 40)
    assert.equal(result.isRedemption, false)
    assert.ok(result.endsAt > result.scheduledAt)
  })

  test('lança erro se serviço não existe', async () => {
    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(),
      makeFakeMembershipRepo(membership),
      makeFakeLoyaltyRewardRepo(),
    )
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', barberUserId: 'barber-1', clientUserId: 'client-1', serviceId: 'inexistente', scheduledAt: future(60) }),
      /not found/
    )
  })

  test('lança erro se serviço não pertence à barbearia', async () => {
    const otherService = Service.create({ id: 'svc-2', barbershopId: 'shop-2', name: 'Barba', durationMinutes: 20, basePrice: 25 })
    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(otherService),
      makeFakeMembershipRepo(membership),
      makeFakeLoyaltyRewardRepo(),
    )
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', barberUserId: 'barber-1', clientUserId: 'client-1', serviceId: 'svc-2', scheduledAt: future(60) }),
      /does not belong/
    )
  })

  test('lança erro se barbeiro não é membro da barbearia', async () => {
    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(service),
      makeFakeMembershipRepo(),
      makeFakeLoyaltyRewardRepo(),
    )
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', barberUserId: 'barber-1', clientUserId: 'client-1', serviceId: 'svc-1', scheduledAt: future(60) }),
      /not a member/
    )
  })

  test('lança erro se há conflito de horário cross-barbearia', async () => {
    const scheduledAt = future(60)
    const existing = Appointment.create({
      id: 'appt-1',
      barbershopId: 'shop-2',
      barberUserId: 'barber-1',
      clientUserId: 'other-client',
      serviceId: 'svc-other',
      scheduledAt,
      durationMinutes: 30,
      priceSnapshot: 40,
    })

    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo([existing]),
      makeFakeServiceRepo(service),
      makeFakeMembershipRepo(membership),
      makeFakeLoyaltyRewardRepo(),
    )
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', barberUserId: 'barber-1', clientUserId: 'client-1', serviceId: 'svc-1', scheduledAt }),
      /already has an appointment/
    )
  })

  test('lança erro se data está no passado', async () => {
    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(service),
      makeFakeMembershipRepo(membership),
      makeFakeLoyaltyRewardRepo(),
    )
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', barberUserId: 'barber-1', clientUserId: 'client-1', serviceId: 'svc-1', scheduledAt: new Date('2020-01-01') }),
      /future/
    )
  })

  test('resgata uma recompensa válida: preço zerado e isRedemption true', async () => {
    const reward = LoyaltyReward.create({
      id: 'reward-1', clientUserId: 'client-1', barbershopId: 'shop-1', type: 'barba_gratis', earnedAt: new Date(),
    })
    const rewardRepo = makeFakeLoyaltyRewardRepo(reward)
    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(beardService),
      makeFakeMembershipRepo(membership),
      rewardRepo,
    )
    const result = await useCase.execute({
      barbershopId: 'shop-1', barberUserId: 'barber-1', clientUserId: 'client-1',
      serviceId: 'svc-beard', scheduledAt: future(60), redeemRewardId: 'reward-1',
    })

    assert.equal(result.priceSnapshot, 0)
    assert.equal(result.isRedemption, true)
    assert.equal(rewardRepo.updated.length, 1)
    assert.equal(rewardRepo.updated[0]?.redeemed, true)
  })

  test('lança erro ao resgatar recompensa para o serviço errado', async () => {
    const reward = LoyaltyReward.create({
      id: 'reward-1', clientUserId: 'client-1', barbershopId: 'shop-1', type: 'barba_gratis', earnedAt: new Date(),
    })
    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(service),
      makeFakeMembershipRepo(membership),
      makeFakeLoyaltyRewardRepo(reward),
    )
    await assert.rejects(
      () => useCase.execute({
        barbershopId: 'shop-1', barberUserId: 'barber-1', clientUserId: 'client-1',
        serviceId: 'svc-1', scheduledAt: future(60), redeemRewardId: 'reward-1',
      }),
      /can only be redeemed for the Barba service/
    )
  })

  test('lança erro ao resgatar recompensa já expirada', async () => {
    const reward = LoyaltyReward.create({
      id: 'reward-1', clientUserId: 'client-1', barbershopId: 'shop-1', type: 'barba_gratis',
      earnedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    })
    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(beardService),
      makeFakeMembershipRepo(membership),
      makeFakeLoyaltyRewardRepo(reward),
    )
    await assert.rejects(
      () => useCase.execute({
        barbershopId: 'shop-1', barberUserId: 'barber-1', clientUserId: 'client-1',
        serviceId: 'svc-beard', scheduledAt: future(60), redeemRewardId: 'reward-1',
      }),
      /not redeemable/
    )
  })
})
