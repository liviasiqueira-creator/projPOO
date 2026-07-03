import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { EnableServiceUseCase } from './enable-service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { BarbershopRepository } from '../../domain/repositories/barbershop-repository'
import { Service } from '../../domain/entities/service'
import { Barbershop } from '../../domain/entities/barbershop'

const barbershop = Barbershop.create({ id: 'shop-1', name: 'Barbearia Central' })

const makeFakeServiceRepo = (existing?: Service): ServiceRepository & { saved: Service[] } => {
  const saved: Service[] = []
  return {
    saved,
    findById: async () => null,
    findByBarbershopId: async () => [],
    findByBarbershopIdAndName: async () => existing ?? null,
    save: async (service) => { saved.push(service) },
  }
}

const makeFakeBarbershopRepo = (): BarbershopRepository => ({
  findById: async (id) => id === barbershop.id ? barbershop : null,
  findBySlug: async () => null,
  findByOwnerUserId: async () => null,
  findAll: async () => [],
  save: async () => {},
})

describe('EnableServiceUseCase', () => {
  test('cria um novo serviço do catálogo fixo', async () => {
    const serviceRepo = makeFakeServiceRepo()
    const useCase = new EnableServiceUseCase(serviceRepo, makeFakeBarbershopRepo())
    const result = await useCase.execute({ barbershopId: 'shop-1', name: 'Corte' })

    assert.equal(result.name, 'Corte')
    assert.equal(serviceRepo.saved.length, 1)
  })

  test('reativa um serviço removido anteriormente, mantendo preço/duração customizados', async () => {
    const removed = Service.create({ id: 'svc-1', barbershopId: 'shop-1', name: 'Barba', durationMinutes: 35, basePrice: 30 }).deactivate()
    const serviceRepo = makeFakeServiceRepo(removed)
    const useCase = new EnableServiceUseCase(serviceRepo, makeFakeBarbershopRepo())
    const result = await useCase.execute({ barbershopId: 'shop-1', name: 'Barba' })

    assert.equal(result.durationMinutes, 35)
    assert.equal(result.basePrice, 30)
  })

  test('lança erro para nome fora do catálogo fixo', async () => {
    const useCase = new EnableServiceUseCase(makeFakeServiceRepo(), makeFakeBarbershopRepo())
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', name: 'Manicure' }),
      /Invalid service name/
    )
  })

  test('lança erro se o serviço já está habilitado', async () => {
    const active = Service.create({ id: 'svc-1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 })
    const useCase = new EnableServiceUseCase(makeFakeServiceRepo(active), makeFakeBarbershopRepo())
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'shop-1', name: 'Corte' }),
      /already enabled/
    )
  })

  test('lança erro se a barbearia não existe', async () => {
    const useCase = new EnableServiceUseCase(makeFakeServiceRepo(), {
      findById: async () => null,
      findBySlug: async () => null,
      findByOwnerUserId: async () => null,
      findAll: async () => [],
      save: async () => {},
    })
    await assert.rejects(
      () => useCase.execute({ barbershopId: 'inexistente', name: 'Corte' }),
      /not found/
    )
  })
})
