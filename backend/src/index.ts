import 'dotenv/config'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from './generated/prisma/client'
import { BcryptHasher } from './infrastructure/bcrypt-hasher'
import { JwtSigner } from './infrastructure/jwt-signer'
import { PrismaUserRepository } from './infrastructure/prisma-user-repository'
import { PrismaBarbershopRepository } from './infrastructure/prisma-barbershop-repository'
import { PrismaServiceRepository } from './infrastructure/prisma-service-repository'
import { PrismaBarberMembershipRepository } from './infrastructure/prisma-barber-membership-repository'
import { PrismaBarberAvailabilityRepository } from './infrastructure/prisma-barber-availability-repository'
import { PrismaAppointmentRepository } from './infrastructure/prisma-appointment-repository'
import { buildServer } from './http/server'

async function main() {
  const adapter = new PrismaLibSql({ url: process.env['DATABASE_URL'] ?? 'file:./dev.db' })
  const db = new PrismaClient({ adapter })

  const hasher = new BcryptHasher()
  const signer = new JwtSigner(process.env['JWT_SECRET'] ?? 'dev-secret')
  const userRepository = new PrismaUserRepository(db)
  const barbershopRepository = new PrismaBarbershopRepository(db)
  const serviceRepository = new PrismaServiceRepository(db)
  const membershipRepository = new PrismaBarberMembershipRepository(db)
  const availabilityRepository = new PrismaBarberAvailabilityRepository(db)
  const appointmentRepository = new PrismaAppointmentRepository(db)

  const port = Number(process.env['PORT'] ?? 3000)
  const server = await buildServer({
    userRepository, barbershopRepository, serviceRepository,
    membershipRepository, availabilityRepository, appointmentRepository,
    hasher, signer,
  })

  await server.listen({ port, host: '0.0.0.0' })
  console.log(`Backend rodando em http://localhost:${port}`)
}

main()
