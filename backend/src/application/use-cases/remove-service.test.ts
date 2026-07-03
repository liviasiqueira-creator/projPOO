import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { RemoveServiceUseCase } from './remove-service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import { Service } from '../../domain/entities/service'

const makeFakeServiceRepo = (service?: Service): ServiceRepository => ({
  findById: async (id) => service?.id === id ? service : null,
  findByBarbershopId: async () => [],
  findByBarbershopIdAndName: async () => null,
  save: async () => {},
})

describe('RemoveServiceUseCase', () => {
  test('remove (desabilita) o serviço', async () => {
    const service = Service.create({ id: 'svc-1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 })
    const useCase = new RemoveServiceUseCase(makeFakeServiceRepo(service))
    const result = await useCase.execute({ barbershopId: 'shop-1', serviceId: 'svc-1' })

    assert.equal(result.isActive, false)
  })

  test('lança erro se o serviço não existe', async () => {
    const useCase = new RemoveServiceUseCase(makeFakeServiceRepo())
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', serviceId: 'inexistente' }),
      /not found/
    )
  })

  test('lança erro se o serviço pertence a outra barbearia', async () => {
    const service = Service.create({ id: 'svc-1', barbershopId: 'shop-2', name: 'Corte', durationMinutes: 30, basePrice: 40 })
    const useCase = new RemoveServiceUseCase(makeFakeServiceRepo(service))
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', serviceId: 'svc-1' }),
      /does not belong/
    )
  })

  test('lança erro ao remover um serviço já removido', async () => {
    const service = Service.create({ id: 'svc-1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 }).deactivate()
    const useCase = new RemoveServiceUseCase(makeFakeServiceRepo(service))
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', serviceId: 'svc-1' }),
      /already removed/
    )
  })
})
