import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { CreateServiceUseCase } from './create-service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { BarbershopRepository } from '../../domain/repositories/barbershop-repository'
import { Barbershop } from '../../domain/entities/barbershop'

const existingBarbershop = Barbershop.create({ id: 'barber-1', name: 'Barbearia Top' })

const makeFakeServiceRepo = (): ServiceRepository => ({
  findById: async () => null,
  findByBarbershopId: async () => [],
  save: async () => {},
})

const makeFakeBarbershopRepo = (exists = true): BarbershopRepository => ({
  findById: async (id) => id === existingBarbershop.id ? existingBarbershop : null,
  findBySlug: async () => null,
  findByOwnerUserId: async () => null,
  findAll: async () => [],
  save: async () => {},
})

describe('CreateServiceUseCase', () => {
  test('cria serviço com dados válidos', async () => {
    const useCase = new CreateServiceUseCase(makeFakeServiceRepo(), makeFakeBarbershopRepo())
    const result = await useCase.execute({
      barbershopId: 'barber-1',
      name: 'Corte Simples',
      durationMinutes: 30,
      basePrice: 35,
    })

    assert.ok(result.id)
    assert.equal(result.name, 'Corte Simples')
    assert.equal(result.durationMinutes, 30)
    assert.equal(result.basePrice, 35)
    assert.equal(result.barbershopId, 'barber-1')
  })

  test('lança erro se barbearia não existe', async () => {
    const useCase = new CreateServiceUseCase(makeFakeServiceRepo(), makeFakeBarbershopRepo())
    await assert.rejects(
      () => useCase.execute({
        barbershopId: 'inexistente',
        name: 'Corte',
        durationMinutes: 30,
        basePrice: 35,
      }),
      /not found/
    )
  })

  test('lança erro se nome estiver vazio', async () => {
    const useCase = new CreateServiceUseCase(makeFakeServiceRepo(), makeFakeBarbershopRepo())
    await assert.rejects(
      () => useCase.execute({
        barbershopId: 'barber-1',
        name: '',
        durationMinutes: 30,
        basePrice: 35,
      }),
      /cannot be empty/
    )
  })

  test('lança erro se duração for zero ou negativa', async () => {
    const useCase = new CreateServiceUseCase(makeFakeServiceRepo(), makeFakeBarbershopRepo())
    await assert.rejects(
      () => useCase.execute({
        barbershopId: 'barber-1',
        name: 'Corte',
        durationMinutes: 0,
        basePrice: 35,
      }),
      /greater than zero/
    )
  })

  test('lança erro se preço for negativo', async () => {
    const useCase = new CreateServiceUseCase(makeFakeServiceRepo(), makeFakeBarbershopRepo())
    await assert.rejects(
      () => useCase.execute({
        barbershopId: 'barber-1',
        name: 'Corte',
        durationMinutes: 30,
        basePrice: -1,
      }),
      /negative/
    )
  })
})
