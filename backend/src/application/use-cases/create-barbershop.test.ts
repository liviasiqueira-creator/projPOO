import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { CreateBarbershopUseCase } from './create-barbershop'
import type { BarbershopRepository } from '../../domain/repositories/barbershop-repository'
import type { Barbershop } from '../../domain/entities/barbershop'
import type { UserRepository } from '../../domain/repositories/user-repository'
import { User, UserRole } from '../../domain/entities/user'

const makeFakeRepo = (existing?: Barbershop): BarbershopRepository => ({
  findById: async () => null,
  findBySlug: async (slug) => existing?.slug.value === slug ? existing : null,
  findByOwnerUserId: async () => null,
  findAll: async () => [],
  save: async () => {},
})

const makeFakeUserRepo = (user?: User): UserRepository => {
  const users = new Map<string, User>(user ? [[user.id, user]] : [])
  return {
    findByEmail: async () => null,
    findById: async (id) => users.get(id) ?? null,
    save: async (u) => { users.set(u.id, u) },
  }
}

const OWNER_ID = 'owner-1'
const buildOwner = (role?: UserRole) =>
  User.create({ id: OWNER_ID, email: 'owner@example.com', passwordHash: 'hash', name: 'Owner', role })

describe('CreateBarbershopUseCase', () => {
  test('cria barbearia com dados válidos', async () => {
    const useCase = new CreateBarbershopUseCase(makeFakeRepo(), makeFakeUserRepo(buildOwner()))
    const result = await useCase.execute({ name: 'Barbearia do João', ownerUserId: OWNER_ID })

    assert.ok(result.id)
    assert.equal(result.name, 'Barbearia do João')
    assert.equal(result.slug, 'barbearia-do-joao')
  })

  test('gera slug automaticamente a partir do nome', async () => {
    const useCase = new CreateBarbershopUseCase(makeFakeRepo(), makeFakeUserRepo(buildOwner()))
    const result = await useCase.execute({ name: 'Corte & Estilo', ownerUserId: OWNER_ID })

    assert.equal(result.slug, 'corte-estilo')
  })

  test('gera slug removendo acentos', async () => {
    const useCase = new CreateBarbershopUseCase(makeFakeRepo(), makeFakeUserRepo(buildOwner()))
    const result = await useCase.execute({ name: 'Barbearia Ação', ownerUserId: OWNER_ID })

    assert.equal(result.slug, 'barbearia-acao')
  })

  test('lança erro se já existe barbearia com o mesmo nome', async () => {
    const useCase = new CreateBarbershopUseCase(makeFakeRepo(), makeFakeUserRepo(buildOwner()))
    await useCase.execute({ name: 'Barbearia Top', ownerUserId: OWNER_ID })

    const useCaseWithExisting = new CreateBarbershopUseCase(
      makeFakeRepo(await buildExistingBarbershop()),
      makeFakeUserRepo(buildOwner()),
    )

    await assert.rejects(
      () => useCaseWithExisting.execute({ name: 'Barbearia Top', ownerUserId: OWNER_ID }),
      /already exists/
    )
  })

  test('lança erro se nome estiver vazio', async () => {
    const useCase = new CreateBarbershopUseCase(makeFakeRepo(), makeFakeUserRepo(buildOwner()))
    await assert.rejects(
      () => useCase.execute({ name: '', ownerUserId: OWNER_ID }),
      /cannot be empty/
    )
  })

  test('promove o criador de client para barber', async () => {
    const userRepo = makeFakeUserRepo(buildOwner(UserRole.Client))
    const useCase = new CreateBarbershopUseCase(makeFakeRepo(), userRepo)
    await useCase.execute({ name: 'Barbearia Nova', ownerUserId: OWNER_ID })

    const owner = await userRepo.findById(OWNER_ID)
    assert.equal(owner?.role, UserRole.Barber)
  })

  test('não altera role de quem já é admin', async () => {
    const userRepo = makeFakeUserRepo(buildOwner(UserRole.Admin))
    const useCase = new CreateBarbershopUseCase(makeFakeRepo(), userRepo)
    await useCase.execute({ name: 'Barbearia Admin', ownerUserId: OWNER_ID })

    const owner = await userRepo.findById(OWNER_ID)
    assert.equal(owner?.role, UserRole.Admin)
  })
})

async function buildExistingBarbershop(): Promise<Barbershop> {
  const { Barbershop } = await import('../../domain/entities/barbershop')
  return Barbershop.create({ id: 'existing-id', name: 'Barbearia Top' })
}
