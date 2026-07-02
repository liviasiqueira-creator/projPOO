import { BcryptHasher } from './infrastructure/bcrypt-hasher'
import { JwtSigner } from './infrastructure/jwt-signer'
import { InMemoryUserRepository } from './infrastructure/in-memory-user-repository'
import { InMemoryBarbershopRepository } from './infrastructure/in-memory-barbershop-repository'
import { InMemoryServiceRepository } from './infrastructure/in-memory-service-repository'
import { InMemoryBarberMembershipRepository } from './infrastructure/in-memory-barber-membership-repository'
import { InMemoryAppointmentRepository } from './infrastructure/in-memory-appointment-repository'
import { buildServer } from './http/server'
import { User } from './domain/entities/user'

async function main() {
  const hasher = new BcryptHasher()
  const signer = new JwtSigner(process.env.JWT_SECRET ?? 'dev-secret')
  const userRepository = new InMemoryUserRepository()
  const barbershopRepository = new InMemoryBarbershopRepository()
  const serviceRepository = new InMemoryServiceRepository()
  const membershipRepository = new InMemoryBarberMembershipRepository()
  const appointmentRepository = new InMemoryAppointmentRepository()

  const passwordHash = await hasher.hash('senha123')
  await userRepository.save(
    User.create({ id: '1', email: 'joao@email.com', passwordHash, name: 'João Silva' })
  )

  const port = Number(process.env.PORT ?? 3000)
  const server = await buildServer({ userRepository, barbershopRepository, serviceRepository, membershipRepository, appointmentRepository, hasher, signer })
  await server.listen({ port, host: '0.0.0.0' })
  console.log(`Backend rodando em http://localhost:${port}`)
}

main()
