import { BcryptHasher } from './infrastructure/bcrypt-hasher'
import { JwtSigner } from './infrastructure/jwt-signer'
import { InMemoryUserRepository } from './infrastructure/in-memory-user-repository'
import { buildServer } from './http/server'
import { User } from './domain/entities/user'

async function main() {
  const hasher = new BcryptHasher()
  const signer = new JwtSigner(process.env.JWT_SECRET ?? 'dev-secret')
  const userRepository = new InMemoryUserRepository()

  const passwordHash = await hasher.hash('senha123')
  await userRepository.save(
    User.create({ id: '1', email: 'joao@email.com', passwordHash, name: 'João Silva' })
  )

  const server = await buildServer({ userRepository, hasher, signer })
  await server.listen({ port: 3000, host: '0.0.0.0' })
  console.log('Backend rodando em http://localhost:3000')
}

main()
