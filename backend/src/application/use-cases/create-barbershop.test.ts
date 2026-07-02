import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { CreateBarbershopUseCase } from './create-barbershop'
import type { BarbershopRepository } from '../../domain/repositories/barbershop-repository'
import type { Barbershop } from '../../domain/entities/barbershop'

const makeFakeRepo = (existing?: Barbershop): BarbershopRepository => ({
  findById: async () => null,
  findBySlug: async (slug) => existing?.slug.value === slug ? existing : null,
  findAll: async () => [],
  save: async () => {},
})

describe('CreateBarbershopUseCase', () => {
  test('cria barbearia com dados válidos', async () => {
    const useCase = new CreateBarbershopUseCase(makeFakeRepo())
    const result = await useCase.execute({ name: 'Barbearia do João' })

    assert.ok(result.id)
    assert.equal(result.name, 'Barbearia do João')
    assert.equal(result.slug, 'barbearia-do-joao')
  })

  test('gera slug automaticamente a partir do nome', async () => {
    const useCase = new CreateBarbershopUseCase(makeFakeRepo())
    const result = await useCase.execute({ name: 'Corte & Estilo' })

    assert.equal(result.slug, 'corte-estilo')
  })

  test('gera slug removendo acentos', async () => {
    const useCase = new CreateBarbershopUseCase(makeFakeRepo())
    const result = await useCase.execute({ name: 'Barbearia Ação' })

    assert.equal(result.slug, 'barbearia-acao')
  })

  test('lança erro se já existe barbearia com o mesmo nome', async () => {
    const useCase = new CreateBarbershopUseCase(makeFakeRepo())
    await useCase.execute({ name: 'Barbearia Top' })

    const useCaseWithExisting = new CreateBarbershopUseCase(
      makeFakeRepo(await buildExistingBarbershop())
    )

    await assert.rejects(
      () => useCaseWithExisting.execute({ name: 'Barbearia Top' }),
      /already exists/
    )
  })

  test('lança erro se nome estiver vazio', async () => {
    const useCase = new CreateBarbershopUseCase(makeFakeRepo())
    await assert.rejects(
      () => useCase.execute({ name: '' }),
      /cannot be empty/
    )
  })
})

async function buildExistingBarbershop(): Promise<Barbershop> {
  const { Barbershop } = await import('../../domain/entities/barbershop')
  return Barbershop.create({ id: 'existing-id', name: 'Barbearia Top' })
}
