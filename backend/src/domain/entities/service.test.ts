import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { Service, DEFAULT_SERVICE_DEFAULTS } from './service'

describe('Service', () => {
  test('cria serviço com dados válidos', () => {
    const service = Service.create({ id: '1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 })
    assert.equal(service.name, 'Corte')
    assert.equal(service.isActive, true)
  })

  test('lança erro com nome vazio', () => {
    assert.throws(
      () => Service.create({ id: '1', barbershopId: 'shop-1', name: '  ', durationMinutes: 30, basePrice: 40 }),
      /cannot be empty/
    )
  })

  test('lança erro com duração inválida', () => {
    assert.throws(
      () => Service.create({ id: '1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 0, basePrice: 40 }),
      /greater than zero/
    )
  })

  test('lança erro com preço negativo', () => {
    assert.throws(
      () => Service.create({ id: '1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: -1 }),
      /cannot be negative/
    )
  })

  test('restore reconstrói sem validar (mesmo com isActive=false)', () => {
    const service = Service.restore({
      id: '1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40, isActive: false,
    })
    assert.equal(service.isActive, false)
  })

  test('createDefault usa os valores padrão do catálogo fixo', () => {
    const service = Service.createDefault({ id: '1', barbershopId: 'shop-1', name: 'Barba' })
    assert.equal(service.durationMinutes, DEFAULT_SERVICE_DEFAULTS.Barba.durationMinutes)
    assert.equal(service.basePrice, DEFAULT_SERVICE_DEFAULTS.Barba.basePrice)
  })

  test('withDetails retorna nova instância com duração/preço atualizados', () => {
    const service = Service.create({ id: '1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 })
    const updated = service.withDetails({ durationMinutes: 45, basePrice: 50 })
    assert.equal(updated.durationMinutes, 45)
    assert.equal(updated.basePrice, 50)
    assert.equal(service.durationMinutes, 30) // original não muda
  })

  test('activate/deactivate alternam isActive imutavelmente', () => {
    const service = Service.create({ id: '1', barbershopId: 'shop-1', name: 'Corte', durationMinutes: 30, basePrice: 40 })
    const removed = service.deactivate()
    assert.equal(removed.isActive, false)
    assert.equal(service.isActive, true)

    const restored = removed.activate()
    assert.equal(restored.isActive, true)
  })
})
