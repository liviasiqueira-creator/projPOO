import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { LoginUseCase } from './login'
import type { UserRepository } from '../../domain/repositories/user-repository'
import type { PasswordHasher } from '../ports/password-hasher'
import type { TokenSigner } from '../ports/token-signer'
import { User } from '../../domain/entities/user'

const fakeUser = User.create({
  id: '1',
  email: 'joao@email.com',
  passwordHash: 'hashed_senha123',
  name: 'João',
})

const fakeRepo: UserRepository = {
  findByEmail: async (email) => email === fakeUser.email.value ? fakeUser : null,
  findById: async (id) => id === fakeUser.id ? fakeUser : null,
  save: async () => {},
}

const fakeHasher: PasswordHasher = {
  hash: async (plain) => `hashed_${plain}`,
  compare: async (plain, hashed) => `hashed_${plain}` === hashed,
}

const fakeSigner: TokenSigner = {
  sign: async (payload) => `token_${JSON.stringify(payload)}`,
  verify: async (token) => JSON.parse(token.replace('token_', '')),
}

describe('LoginUseCase', () => {
  test('retorna accessToken com credenciais válidas', async () => {
    const useCase = new LoginUseCase(fakeRepo, fakeHasher, fakeSigner)
    const result = await useCase.execute({ email: 'joao@email.com', password: 'senha123' })
    assert.ok(result.accessToken.length > 0)
  })

  test('token contém o id do usuário', async () => {
    const useCase = new LoginUseCase(fakeRepo, fakeHasher, fakeSigner)
    const result = await useCase.execute({ email: 'joao@email.com', password: 'senha123' })
    assert.ok(result.accessToken.includes('"sub":"1"'))
  })

  test('lança erro com email não cadastrado', async () => {
    const useCase = new LoginUseCase(fakeRepo, fakeHasher, fakeSigner)
    await assert.rejects(
      () => useCase.execute({ email: 'naoexiste@email.com', password: 'senha123' }),
      /Invalid credentials/
    )
  })

  test('lança erro com senha incorreta', async () => {
    const useCase = new LoginUseCase(fakeRepo, fakeHasher, fakeSigner)
    await assert.rejects(
      () => useCase.execute({ email: 'joao@email.com', password: 'senha_errada' }),
      /Invalid credentials/
    )
  })
})
