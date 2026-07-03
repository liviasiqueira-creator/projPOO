import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { UpdateAppointmentStatusUseCase } from './update-appointment-status'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { LoyaltyEngine } from '../ports/loyalty-engine'
import { Appointment } from '../../domain/entities/appointment'

const future = (offsetMinutes: number) => new Date(Date.now() + offsetMinutes * 60 * 1000)

const makeAppointment = () => Appointment.create({
  id: 'appt-1',
  barbershopId: 'shop-1',
  barberUserId: 'barber-1',
  clientUserId: 'client-1',
  serviceId: 'svc-1',
  scheduledAt: future(60),
  durationMinutes: 30,
  priceSnapshot: 40,
})

const makeFakeRepo = (appointment?: Appointment): AppointmentRepository => {
  let stored = appointment
  return {
    findById: async (id) => stored?.id === id ? stored : null,
    findByBarberUserId: async () => [],
    findByClientUserId: async () => [],
    findByBarbershopId: async () => [],
    findConflicting: async () => [],
    save: async () => {},
    update: async (updated) => { stored = updated },
  }
}

const makeFakeLoyaltyEngine = (calls: Appointment[] = []): LoyaltyEngine => ({
  processCompletedAppointment: async (appointment) => { calls.push(appointment) },
})

describe('UpdateAppointmentStatusUseCase', () => {
  test('transiciona de pending para confirmed', async () => {
    const useCase = new UpdateAppointmentStatusUseCase(makeFakeRepo(makeAppointment()), makeFakeLoyaltyEngine())
    const result = await useCase.execute({ appointmentId: 'appt-1', status: 'confirmed' })
    assert.equal(result.status, 'confirmed')
  })

  test('transiciona de confirmed para in_progress', async () => {
    const confirmed = makeAppointment().transition('confirmed')
    const useCase = new UpdateAppointmentStatusUseCase(makeFakeRepo(confirmed), makeFakeLoyaltyEngine())
    const result = await useCase.execute({ appointmentId: 'appt-1', status: 'in_progress' })
    assert.equal(result.status, 'in_progress')
  })

  test('transiciona de in_progress para completed e aciona o motor de fidelidade', async () => {
    const inProgress = makeAppointment().transition('confirmed').transition('in_progress')
    const calls: Appointment[] = []
    const useCase = new UpdateAppointmentStatusUseCase(makeFakeRepo(inProgress), makeFakeLoyaltyEngine(calls))
    const result = await useCase.execute({ appointmentId: 'appt-1', status: 'completed' })
    assert.equal(result.status, 'completed')
    assert.equal(calls.length, 1)
    assert.equal(calls[0]?.id, 'appt-1')
  })

  test('não aciona o motor de fidelidade em transições que não sejam para completed', async () => {
    const calls: Appointment[] = []
    const useCase = new UpdateAppointmentStatusUseCase(makeFakeRepo(makeAppointment()), makeFakeLoyaltyEngine(calls))
    await useCase.execute({ appointmentId: 'appt-1', status: 'confirmed' })
    assert.equal(calls.length, 0)
  })

  test('cancela a partir de pending', async () => {
    const useCase = new UpdateAppointmentStatusUseCase(makeFakeRepo(makeAppointment()), makeFakeLoyaltyEngine())
    const result = await useCase.execute({ appointmentId: 'appt-1', status: 'cancelled' })
    assert.equal(result.status, 'cancelled')
  })

  test('lança erro se appointment não existe', async () => {
    const useCase = new UpdateAppointmentStatusUseCase(makeFakeRepo(), makeFakeLoyaltyEngine())
    await assert.rejects(
      () => useCase.execute({ appointmentId: 'inexistente', status: 'confirmed' }),
      /not found/
    )
  })

  test('lança erro para transição inválida', async () => {
    const useCase = new UpdateAppointmentStatusUseCase(makeFakeRepo(makeAppointment()), makeFakeLoyaltyEngine())
    await assert.rejects(
      () => useCase.execute({ appointmentId: 'appt-1', status: 'completed' }),
      /Cannot transition/
    )
  })

  test('não permite alterar status de appointment cancelado', async () => {
    const cancelled = makeAppointment().transition('cancelled')
    const useCase = new UpdateAppointmentStatusUseCase(makeFakeRepo(cancelled), makeFakeLoyaltyEngine())
    await assert.rejects(
      () => useCase.execute({ appointmentId: 'appt-1', status: 'confirmed' }),
      /Cannot transition/
    )
  })
})
