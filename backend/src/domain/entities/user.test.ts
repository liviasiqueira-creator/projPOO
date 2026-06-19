import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { User } from './user'

describe('User', () => {
  const validProps = {
    id: '1',
    email: 'joao@email.com',
    passwordHash: 'hashed_senha',
    name: 'João Silva',
  }

  test('cria usuário com props válidas', () => {
    const user = User.create(validProps)
    assert.equal(user.id, '1')
    assert.equal(user.email.value, 'joao@email.com')
    assert.equal(user.passwordHash, 'hashed_senha')
    assert.equal(user.name, 'João Silva')
    assert.ok(user.createdAt instanceof Date)
  })

  test('normaliza o email ao criar', () => {
    const user = User.create({ ...validProps, email: 'Joao@Email.COM' })
    assert.equal(user.email.value, 'joao@email.com')
  })

  test('lança erro com email inválido', () => {
    assert.throws(
      () => User.create({ ...validProps, email: 'email-invalido' }),
      /Invalid email/
    )
  })
})
