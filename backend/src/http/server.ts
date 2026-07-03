import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { UserRepository } from '../domain/repositories/user-repository'
import type { BarbershopRepository } from '../domain/repositories/barbershop-repository'
import type { ServiceRepository } from '../domain/repositories/service-repository'
import type { BarberMembershipRepository } from '../domain/repositories/barber-membership-repository'
import type { AppointmentRepository } from '../domain/repositories/appointment-repository'
import type { BarberAvailabilityRepository } from '../domain/repositories/barber-availability-repository'
import type { PasswordHasher } from '../application/ports/password-hasher'
import type { TokenSigner } from '../application/ports/token-signer'
import { LoginUseCase } from '../application/use-cases/login'
import { RegisterUseCase } from '../application/use-cases/register'
import { CreateBarbershopUseCase } from '../application/use-cases/create-barbershop'
import { HireBarberUseCase } from '../application/use-cases/hire-barber'
import { UpdateExclusivityUseCase } from '../application/use-cases/update-exclusivity'
import { BookAppointmentUseCase } from '../application/use-cases/book-appointment'
import { UpdateAppointmentStatusUseCase } from '../application/use-cases/update-appointment-status'
import { UserRole } from '../domain/entities/user'
import { SetBarberAvailabilityUseCase } from '../application/use-cases/set-barber-availability'
import { DeleteBarberAvailabilityUseCase } from '../application/use-cases/delete-barber-availability'
import { GetAvailableSlotsUseCase } from '../application/use-cases/get-available-slots'

interface ServerDeps {
  userRepository: UserRepository
  barbershopRepository: BarbershopRepository
  serviceRepository: ServiceRepository
  membershipRepository: BarberMembershipRepository
  appointmentRepository: AppointmentRepository
  availabilityRepository: BarberAvailabilityRepository
  hasher: PasswordHasher
  signer: TokenSigner
}

export async function buildServer(deps: ServerDeps) {
  const server = Fastify()

  await server.register(cors, { origin: true })

  await server.register(swagger, {
    openapi: {
      info: { title: 'projPOO API', version: '1.0.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  })

  await server.register(swaggerUi, { routePrefix: '/docs' })

  server.post('/auth/login', {
    schema: {
      summary: 'Autenticar usuário',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string }
    const useCase = new LoginUseCase(deps.userRepository, deps.hasher, deps.signer)
    try {
      return await useCase.execute({ email, password })
    } catch {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }
  })

  server.post('/auth/register', {
    schema: {
      summary: 'Cadastrar usuário',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:      { type: 'string', minLength: 1 },
          email:     { type: 'string', format: 'email' },
          password:  { type: 'string', minLength: 6 },
          role:      { type: 'string', enum: ['client', 'admin', 'barber'] },
          phone:     { type: 'string' },
          avatarUrl: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
          },
        },
        409: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const body = request.body as {
      name: string
      email: string
      password: string
      role?: UserRole
      phone?: string
      avatarUrl?: string
    }
    const useCase = new RegisterUseCase(deps.userRepository, deps.hasher, deps.signer)
    try {
      const result = await useCase.execute({
        name: body.name,
        email: body.email,
        password: body.password,
        ...(body.role !== undefined && { role: body.role as import('../domain/entities/user').UserRole }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      })
      return reply.status(201).send(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.'
      return reply.status(409).send({ error: message })
    }
  })

  server.get('/auth/me', {
    schema: {
      summary: 'Retorna usuário autenticado',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing token' })
    }
    try {
      const payload = await deps.signer.verify(auth.slice(7))
      const user = await deps.userRepository.findById(String(payload['sub']))
      if (!user) return reply.status(401).send({ error: 'User not found' })
      return { id: user.id, name: user.name, email: user.email.value, role: user.role }
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }
  })

  server.get('/users/:userId', {
    schema: {
      summary: 'Buscar dados básicos de um usuário',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id:   { type: 'string' },
            name: { type: 'string' },
          },
        },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Missing token' })
    try { await deps.signer.verify(auth.slice(7)) } catch { return reply.status(401).send({ error: 'Invalid token' }) }

    const { userId } = request.params as { userId: string }
    const user = await deps.userRepository.findById(userId)
    if (!user) return reply.status(404).send({ error: 'User not found.' })

    return { id: user.id, name: user.name }
  })

  server.post('/barbershops', {
    schema: {
      summary: 'Cadastrar barbearia',
      tags: ['Barbershops'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name:     { type: 'string', minLength: 1 },
          address:  { type: 'string' },
          city:     { type: 'string' },
          phone:    { type: 'string' },
          logoUrl:  { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id:   { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
        409: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing token' })
    }
    let ownerUserId: string
    try {
      const payload = await deps.signer.verify(auth.slice(7))
      ownerUserId = String(payload['sub'])
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    const body = request.body as {
      name: string
      address?: string
      city?: string
      phone?: string
      logoUrl?: string
    }

    const useCase = new CreateBarbershopUseCase(deps.barbershopRepository, deps.userRepository, deps.serviceRepository)
    try {
      const result = await useCase.execute({ ...body, ownerUserId })
      return reply.status(201).send(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create barbershop.'
      return reply.status(409).send({ error: message })
    }
  })

  server.get('/barbershops', {
    schema: {
      summary: 'Listar barbearias',
      tags: ['Barbershops'],
      querystring: {
        type: 'object',
        properties: {
          city:      { type: 'string' },
          latitude:  { type: 'number' },
          longitude: { type: 'number' },
          radiusKm:  { type: 'number' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id:        { type: 'string' },
              name:      { type: 'string' },
              slug:      { type: 'string' },
              city:      { type: 'string' },
              address:   { type: 'string' },
              logoUrl:   { type: 'string' },
              latitude:  { type: 'number' },
              longitude: { type: 'number' },
            },
          },
        },
      },
    },
  }, async (request) => {
    const { city, latitude, longitude, radiusKm } = request.query as {
      city?: string
      latitude?: number
      longitude?: number
      radiusKm?: number
    }

    const barbershops = await deps.barbershopRepository.findAll({
      ...(city !== undefined && { city }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(radiusKm !== undefined && { radiusKm }),
    })

    return barbershops.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug.value,
      city: b.city,
      address: b.address,
      logoUrl: b.logoUrl?.value,
      latitude: b.latitude,
      longitude: b.longitude,
    }))
  })

  server.get('/barbershops/me', {
    schema: {
      summary: 'Buscar a barbearia do usuário autenticado',
      tags: ['Barbershops'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id:        { type: 'string' },
            name:      { type: 'string' },
            slug:      { type: 'string' },
            city:      { type: 'string' },
            address:   { type: 'string' },
            phone:     { type: 'string' },
            logoUrl:   { type: 'string' },
            latitude:  { type: 'number' },
            longitude: { type: 'number' },
          },
        },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Missing token' })
    let ownerUserId: string
    try {
      const payload = await deps.signer.verify(auth.slice(7))
      ownerUserId = String(payload['sub'])
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    const barbershop = await deps.barbershopRepository.findByOwnerUserId(ownerUserId)
    if (!barbershop) return reply.status(404).send({ error: 'Barbershop not found.' })

    return {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug.value,
      city: barbershop.city,
      address: barbershop.address,
      phone: barbershop.phone?.value,
      logoUrl: barbershop.logoUrl?.value,
      latitude: barbershop.latitude,
      longitude: barbershop.longitude,
    }
  })

  server.get('/barbershops/:barbershopId', {
    schema: {
      summary: 'Buscar barbearia por ID',
      tags: ['Barbershops'],
      params: {
        type: 'object',
        required: ['barbershopId'],
        properties: {
          barbershopId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id:        { type: 'string' },
            name:      { type: 'string' },
            slug:      { type: 'string' },
            city:      { type: 'string' },
            address:   { type: 'string' },
            phone:     { type: 'string' },
            logoUrl:   { type: 'string' },
            latitude:  { type: 'number' },
            longitude: { type: 'number' },
          },
        },
        404: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const { barbershopId } = request.params as { barbershopId: string }
    const barbershop = await deps.barbershopRepository.findById(barbershopId)
    if (!barbershop) return reply.status(404).send({ error: 'Barbershop not found.' })

    return {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug.value,
      city: barbershop.city,
      address: barbershop.address,
      phone: barbershop.phone?.value,
      logoUrl: barbershop.logoUrl?.value,
      latitude: barbershop.latitude,
      longitude: barbershop.longitude,
    }
  })

  server.get('/barbershops/:barbershopId/services', {
    schema: {
      summary: 'Listar serviços de uma barbearia',
      tags: ['Barbershops'],
      params: {
        type: 'object',
        required: ['barbershopId'],
        properties: {
          barbershopId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id:              { type: 'string' },
              name:            { type: 'string' },
              description:     { type: 'string' },
              durationMinutes: { type: 'number' },
              basePrice:       { type: 'number' },
            },
          },
        },
        404: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const { barbershopId } = request.params as { barbershopId: string }
    const barbershop = await deps.barbershopRepository.findById(barbershopId)
    if (!barbershop) return reply.status(404).send({ error: 'Barbershop not found.' })

    const services = await deps.serviceRepository.findByBarbershopId(barbershopId)

    return services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMinutes: s.durationMinutes,
      basePrice: s.basePrice,
    }))
  })

  server.post('/barbershops/:barbershopId/barbers', {
    schema: {
      summary: 'Contratar barbeiro para uma barbearia',
      tags: ['Memberships'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['barbershopId'],
        properties: { barbershopId: { type: 'string' } },
      },
      body: {
        type: 'object',
        required: ['barberUserId', 'isExclusive'],
        properties: {
          barberUserId: { type: 'string' },
          isExclusive:  { type: 'boolean' },
          allowedShift: { type: 'string', enum: ['morning', 'afternoon', 'evening'] },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id:           { type: 'string' },
            barberUserId: { type: 'string' },
            barbershopId: { type: 'string' },
            isExclusive:  { type: 'boolean' },
            allowedShift: { type: 'string' },
          },
        },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        409: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Missing token' })
    try { await deps.signer.verify(auth.slice(7)) } catch { return reply.status(401).send({ error: 'Invalid token' }) }

    const { barbershopId } = request.params as { barbershopId: string }
    const body = request.body as { barberUserId: string; isExclusive: boolean; allowedShift?: 'morning' | 'afternoon' | 'evening' }

    const useCase = new HireBarberUseCase(deps.membershipRepository, deps.userRepository, deps.barbershopRepository)
    try {
      const result = await useCase.execute({ barbershopId, ...body })
      return reply.status(201).send(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to hire barber.'
      return reply.status(409).send({ error: message })
    }
  })

  server.patch('/barbershops/:barbershopId/barbers/:barberUserId/exclusivity', {
    schema: {
      summary: 'Atualizar exclusividade de barbeiro',
      tags: ['Memberships'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['barbershopId', 'barberUserId'],
        properties: {
          barbershopId:  { type: 'string' },
          barberUserId:  { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['isExclusive'],
        properties: {
          isExclusive: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id:          { type: 'string' },
            isExclusive: { type: 'boolean' },
          },
        },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        409: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Missing token' })
    try { await deps.signer.verify(auth.slice(7)) } catch { return reply.status(401).send({ error: 'Invalid token' }) }

    const { barbershopId, barberUserId } = request.params as { barbershopId: string; barberUserId: string }
    const { isExclusive } = request.body as { isExclusive: boolean }

    const useCase = new UpdateExclusivityUseCase(deps.membershipRepository)
    try {
      const result = await useCase.execute({ barbershopId, barberUserId, isExclusive })
      return reply.status(200).send(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update exclusivity.'
      return reply.status(409).send({ error: message })
    }
  })

  server.post('/appointments', {
    schema: {
      summary: 'Agendar horário',
      tags: ['Appointments'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['barbershopId', 'barberUserId', 'serviceId', 'scheduledAt'],
        properties: {
          barbershopId: { type: 'string' },
          barberUserId: { type: 'string' },
          serviceId:    { type: 'string' },
          scheduledAt:  { type: 'string', format: 'date-time' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id:              { type: 'string' },
            barbershopId:    { type: 'string' },
            barberUserId:    { type: 'string' },
            clientUserId:    { type: 'string' },
            serviceId:       { type: 'string' },
            scheduledAt:     { type: 'string' },
            endsAt:          { type: 'string' },
            durationMinutes: { type: 'number' },
            priceSnapshot:   { type: 'number' },
            status:          { type: 'string' },
          },
        },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        409: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Missing token' })

    let clientUserId: string
    try {
      const payload = await deps.signer.verify(auth.slice(7))
      clientUserId = String(payload['sub'])
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    const body = request.body as {
      barbershopId: string
      barberUserId: string
      serviceId: string
      scheduledAt: string
    }

    const useCase = new BookAppointmentUseCase(deps.appointmentRepository, deps.serviceRepository, deps.membershipRepository)
    try {
      const result = await useCase.execute({ ...body, clientUserId, scheduledAt: new Date(body.scheduledAt) })
      return reply.status(201).send(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to book appointment.'
      return reply.status(409).send({ error: message })
    }
  })

  server.get('/appointments', {
    schema: {
      summary: 'Listar agendamentos',
      tags: ['Appointments'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          barbershopId: { type: 'string' },
          barberUserId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id:              { type: 'string' },
              barbershopId:    { type: 'string' },
              barberUserId:    { type: 'string' },
              clientUserId:    { type: 'string' },
              serviceId:       { type: 'string' },
              scheduledAt:     { type: 'string' },
              endsAt:          { type: 'string' },
              durationMinutes: { type: 'number' },
              priceSnapshot:   { type: 'number' },
              status:          { type: 'string' },
            },
          },
        },
        401: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Missing token' })

    let clientUserId: string
    try {
      const payload = await deps.signer.verify(auth.slice(7))
      clientUserId = String(payload['sub'])
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    const { barbershopId, barberUserId } = request.query as { barbershopId?: string; barberUserId?: string }

    let appointments
    if (barbershopId) {
      appointments = await deps.appointmentRepository.findByBarbershopId(barbershopId)
    } else if (barberUserId) {
      appointments = await deps.appointmentRepository.findByBarberUserId(barberUserId)
    } else {
      appointments = await deps.appointmentRepository.findByClientUserId(clientUserId)
    }

    return appointments.map((a) => ({
      id: a.id,
      barbershopId: a.barbershopId,
      barberUserId: a.barberUserId,
      clientUserId: a.clientUserId,
      serviceId: a.serviceId,
      scheduledAt: a.scheduledAt.toISOString(),
      endsAt: a.endsAt.toISOString(),
      durationMinutes: a.durationMinutes,
      priceSnapshot: a.priceSnapshot,
      status: a.status,
    }))
  })

  server.patch('/appointments/:appointmentId/status', {
    schema: {
      summary: 'Atualizar status do agendamento',
      tags: ['Appointments'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['appointmentId'],
        properties: { appointmentId: { type: 'string' } },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id:     { type: 'string' },
            status: { type: 'string' },
          },
        },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        409: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Missing token' })
    try { await deps.signer.verify(auth.slice(7)) } catch { return reply.status(401).send({ error: 'Invalid token' }) }

    const { appointmentId } = request.params as { appointmentId: string }
    const { status } = request.body as { status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' }

    const useCase = new UpdateAppointmentStatusUseCase(deps.appointmentRepository)
    try {
      const result = await useCase.execute({ appointmentId, status })
      return reply.status(200).send(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status.'
      return reply.status(409).send({ error: message })
    }
  })

  server.post('/barbershops/:barbershopId/barbers/:barberUserId/availability', {
    schema: {
      summary: 'Definir disponibilidade de barbeiro',
      tags: ['Availability'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['barbershopId', 'barberUserId'],
        properties: {
          barbershopId:  { type: 'string' },
          barberUserId:  { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['weekday', 'startTime', 'endTime'],
        properties: {
          weekday:   { type: 'number', minimum: 0, maximum: 6 },
          startTime: { type: 'string', description: 'HH:MM' },
          endTime:   { type: 'string', description: 'HH:MM' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id:           { type: 'string' },
            barberUserId: { type: 'string' },
            barbershopId: { type: 'string' },
            weekday:      { type: 'number' },
            startTime:    { type: 'string' },
            endTime:      { type: 'string' },
          },
        },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        409: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Missing token' })
    try { await deps.signer.verify(auth.slice(7)) } catch { return reply.status(401).send({ error: 'Invalid token' }) }

    const { barbershopId, barberUserId } = request.params as { barbershopId: string; barberUserId: string }
    const body = request.body as { weekday: number; startTime: string; endTime: string }

    const useCase = new SetBarberAvailabilityUseCase(deps.availabilityRepository, deps.membershipRepository)
    try {
      const result = await useCase.execute({ barbershopId, barberUserId, ...body, weekday: body.weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
      return reply.status(201).send(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set availability.'
      return reply.status(409).send({ error: message })
    }
  })

  server.delete('/barbershops/:barbershopId/barbers/:barberUserId/availability/:availabilityId', {
    schema: {
      summary: 'Remover bloco de disponibilidade de barbeiro',
      tags: ['Availability'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['barbershopId', 'barberUserId', 'availabilityId'],
        properties: {
          barbershopId:   { type: 'string' },
          barberUserId:   { type: 'string' },
          availabilityId: { type: 'string' },
        },
      },
      response: {
        204: { type: 'null' },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Missing token' })
    try { await deps.signer.verify(auth.slice(7)) } catch { return reply.status(401).send({ error: 'Invalid token' }) }

    const { barberUserId, availabilityId } = request.params as {
      barbershopId: string
      barberUserId: string
      availabilityId: string
    }

    const useCase = new DeleteBarberAvailabilityUseCase(deps.availabilityRepository)
    try {
      await useCase.execute({ barberUserId, availabilityId })
      return reply.status(204).send()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete availability.'
      return reply.status(404).send({ error: message })
    }
  })

  server.get('/barbershops/:barbershopId/available-slots', {
    schema: {
      summary: 'Listar horários disponíveis para agendamento',
      tags: ['Availability'],
      params: {
        type: 'object',
        required: ['barbershopId'],
        properties: {
          barbershopId: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        required: ['serviceId', 'date'],
        properties: {
          serviceId: { type: 'string' },
          date:      { type: 'string', description: 'YYYY-MM-DD' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              barberUserId: { type: 'string' },
              startTime:    { type: 'string' },
              endTime:      { type: 'string' },
            },
          },
        },
        404: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const { barbershopId } = request.params as { barbershopId: string }
    const { serviceId, date } = request.query as { serviceId: string; date: string }

    const useCase = new GetAvailableSlotsUseCase(deps.availabilityRepository, deps.appointmentRepository, deps.serviceRepository)
    try {
      return await useCase.execute({ barbershopId, serviceId, date })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get available slots.'
      return reply.status(404).send({ error: message })
    }
  })

  return server
}
