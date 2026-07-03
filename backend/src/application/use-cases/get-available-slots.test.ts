import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { GetAvailableSlotsUseCase } from './get-available-slots'
import type { BarberAvailabilityRepository } from '../../domain/repositories/barber-availability-repository'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import { BarberAvailability } from '../../domain/entities/barber-availability'
import { Service } from '../../domain/entities/service'
import { Appointment } from '../../domain/entities/appointment'

const service = Service.create({ id: 'svc-1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 })

// Segunda-feira: 2026-07-06 (weekday = 1)
const DATE = '2026-07-06'

const block = BarberAvailability.create({
  id: 'block-1',
  barberUserId: 'barber-1',
  barbershopId: 'shop-1',
  weekday: 1,
  startTime: '09:00',
  endTime: '11:00',
})

const makeFakeServiceRepo = (svc?: Service): ServiceRepository => ({
  findById: async (id) => id === svc?.id ? svc : null,
  findByBarbershopId: async () => [],
  findByBarbershopIdAndName: async () => null,
  save: async () => {},
})

const makeFakeAvailabilityRepo = (blocks: BarberAvailability[] = []): BarberAvailabilityRepository => ({
  findByBarberAndBarbershop: async () => [],
  findByBarberUserId: async (userId) => blocks.filter((b) => b.barberUserId === userId),
  findByBarbershopId: async () => [],
  findAvailableBarbers: async (shopId, weekday) =>
    blocks.filter((b) => b.barbershopId === shopId && b.weekday === weekday),
  save: async () => {},
  delete: async () => {},
})

const makeFakeAppointmentRepo = (appointments: Appointment[] = []): AppointmentRepository => ({
  findById: async () => null,
  findByBarberUserId: async () => [],
  findByClientUserId: async () => [],
  findByBarbershopId: async () => [],
  findConflicting: async (userId, start, end) =>
    appointments.filter((a) =>
      a.barberUserId === userId && a.scheduledAt < end && a.endsAt > start
    ),
  save: async () => {},
  update: async () => {},
})

describe('GetAvailableSlotsUseCase', () => {
  test('retorna slots livres dentro do bloco de disponibilidade', async () => {
    const useCase = new GetAvailableSlotsUseCase(
      makeFakeAvailabilityRepo([block]),
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(service),
    )
    const result = await useCase.execute({ barbershopId: 'shop-1', serviceId: 'svc-1', date: DATE })

    assert.equal(result.length, 4) // 09:00, 09:30, 10:00, 10:30
    assert.equal(result[0]?.startTime, '09:00')
    assert.equal(result[0]?.endTime, '09:30')
    assert.equal(result[3]?.startTime, '10:30')
    assert.equal(result[3]?.endTime, '11:00')
  })

  test('exclui slots que colidem com agendamentos existentes', async () => {
    const booked = Appointment.create({
      id: 'appt-1',
      barbershopId: 'shop-1',
      barberUserId: 'barber-1',
      clientUserId: 'client-1',
      serviceId: 'svc-1',
      scheduledAt: new Date(`${DATE}T09:00:00.000Z`),
      durationMinutes: 30,
      priceSnapshot: 40,
    })

    const useCase = new GetAvailableSlotsUseCase(
      makeFakeAvailabilityRepo([block]),
      makeFakeAppointmentRepo([booked]),
      makeFakeServiceRepo(service),
    )
    const result = await useCase.execute({ barbershopId: 'shop-1', serviceId: 'svc-1', date: DATE })

    assert.equal(result.length, 3)
    assert.ok(result.every((s) => s.startTime !== '09:00'))
  })

  test('retorna vazio se não há disponibilidade cadastrada', async () => {
    const useCase = new GetAvailableSlotsUseCase(
      makeFakeAvailabilityRepo([]),
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(service),
    )
    const result = await useCase.execute({ barbershopId: 'shop-1', serviceId: 'svc-1', date: DATE })
    assert.equal(result.length, 0)
  })

  test('lança erro se serviço não existe', async () => {
    const useCase = new GetAvailableSlotsUseCase(
      makeFakeAvailabilityRepo([block]),
      makeFakeAppointmentRepo(),
      makeFakeServiceRepo(),
    )
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', serviceId: 'inexistente', date: DATE }),
      /not found/
    )
  })
})
