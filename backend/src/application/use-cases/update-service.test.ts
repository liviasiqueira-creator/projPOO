import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { UpdateServiceUseCase } from './update-service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import { Service } from '../../domain/entities/service'

const makeFakeServiceRepo = (service?: Service): ServiceRepository => ({
  findById: async (id) => service?.id === id ? service : null,
  findByBarbershopId: async () => [],
  findByBarbershopIdAndName: async () => null,
  save: async () => {},
})

describe('UpdateServiceUseCase', () => {
  test('atualiza duração e preço', async () => {
    const service = Service.create({ id: 'svc-1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 })
    const useCase = new UpdateServiceUseCase(makeFakeServiceRepo(service))
    const result = await useCase.execute({ barbershopId: 'shop-1', serviceId: 'svc-1', durationMinutes: 45, basePrice: 50 })

    assert.equal(result.durationMinutes, 45)
    assert.equal(result.basePrice, 50)
    assert.equal(result.name, 'Corte')
  })

  test('lança erro se o serviço não existe', async () => {
    const useCase = new UpdateServiceUseCase(makeFakeServiceRepo())
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', serviceId: 'inexistente', durationMinutes: 30, basePrice: 40 }),
      /not found/
    )
  })

  test('lança erro se o serviço pertence a outra barbearia', async () => {
    const service = Service.create({ id: 'svc-1', barbershopId: 'shop-2', name: 'Corte', durationMinutes: 30, basePrice: 40 })
    const useCase = new UpdateServiceUseCase(makeFakeServiceRepo(service))
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', serviceId: 'svc-1', durationMinutes: 30, basePrice: 40 }),
      /does not belong/
    )
  })

  test('lança erro se o serviço está desabilitado', async () => {
    const service = Service.create({ id: 'svc-1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 }).deactivate()
    const useCase = new UpdateServiceUseCase(makeFakeServiceRepo(service))
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', serviceId: 'svc-1', durationMinutes: 30, basePrice: 40 }),
      /not enabled/
    )
  })
})
