import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { BookAppointmentUseCase } from './book-appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { BarberMembershipRepository } from '../../domain/repositories/barber-membership-repository'
import { Service } from '../../domain/entities/service'
import { BarberMembership } from '../../domain/entities/barber-membership'
import { Appointment } from '../../domain/entities/appointment'

const future = (offsetMinutes: number) => new Date(Date.now() + offsetMinutes * 60 * 1000)

const service = Service.create({ id: 'svc-1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 })
const membership = BarberMembership.create({ id: 'mem-1', barberUserId: 'barber-1', barbershopId: 'shop-1', isExclusive: false })

const makeFakeServiceRepo = (svc?: Service): ServiceRepository => ({
  findById: async (id) => id === svc?.id ? svc : null,
  findByBarbershopId: async () => [],
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

describe('BookAppointmentUseCase', () => {
  test('agenda horário com sucesso', async () => {
    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(service),
      makeFakeMembershipRepo(membership),
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
    assert.ok(result.endsAt > result.scheduledAt)
  })

  test('lança erro se serviço não existe', async () => {
    const useCase = new BookAppointmentUseCase(
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(),
      makeFakeMembershipRepo(membership),
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
    )
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', barberUserId: 'barber-1', clientUserId: 'client-1', serviceId: 'svc-1', scheduledAt: new Date('2020-01-01') }),
      /future/
    )
  })
})
