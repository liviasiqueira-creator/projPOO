import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { Email } from './email'

describe('Email', () => {
  describe('válidos', () => {
    test('aceita email simples', () => {
      const email = new Email('joao@email.com')
      assert.equal(email.value, 'joao@email.com')
    })

    test('normaliza para lowercase', () => {
      const email = new Email('Joao@Email.COM')
      assert.equal(email.value, 'joao@email.com')
    })

    test('remove espaços nas bordas', () => {
      const email = new Email('  joao@email.com  ')
      assert.equal(email.value, 'joao@email.com')
    })

    test('aceita subdomínio', () => {
      assert.doesNotThrow(() => new Email('joao@mail.empresa.com.br'))
    })

    test('aceita caracteres especiais permitidos', () => {
      assert.doesNotThrow(() => new Email('joao.silva+tag@email.com'))
    })
  })

  describe('inválidos', () => {
    test('rejeita sem @', () => {
      assert.throws(() => new Email('joaoemail.com'), /Invalid email/)
    })

    test('rejeita sem domínio', () => {
      assert.throws(() => new Email('joao@'), /Invalid email/)
    })

    test('rejeita sem extensão', () => {
      assert.throws(() => new Email('joao@email'), /Invalid email/)
    })

    test('rejeita string vazia', () => {
      assert.throws(() => new Email(''), /Invalid email/)
    })

    test('rejeita apenas espaços', () => {
      assert.throws(() => new Email('   '), /Invalid email/)
    })
  })
})
