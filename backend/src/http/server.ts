import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { UserRepository } from '../domain/repositories/user-repository'
import type { BarbershopRepository } from '../domain/repositories/barbershop-repository'
import type { ServiceRepository } from '../domain/repositories/service-repository'
import type { PasswordHasher } from '../application/ports/password-hasher'
import type { TokenSigner } from '../application/ports/token-signer'
import { LoginUseCase } from '../application/use-cases/login'
import { RegisterUseCase } from '../application/use-cases/register'
import { CreateBarbershopUseCase } from '../application/use-cases/create-barbershop'
import { CreateServiceUseCase } from '../application/use-cases/create-service'

interface ServerDeps {
  userRepository: UserRepository
  barbershopRepository: BarbershopRepository
  serviceRepository: ServiceRepository
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
      role?: 'client' | 'admin' | 'barber'
      phone?: string
      avatarUrl?: string
    }
    const useCase = new RegisterUseCase(deps.userRepository, deps.hasher, deps.signer)
    try {
      const result = await useCase.execute(body)
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
      return { id: user.id, name: user.name, email: user.email.value }
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }
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
    try {
      await deps.signer.verify(auth.slice(7))
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

    const useCase = new CreateBarbershopUseCase(deps.barbershopRepository)
    try {
      const result = await useCase.execute(body)
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
      latitude: b.latitude,
      longitude: b.longitude,
    }))
  })

  server.post('/barbershops/:barbershopId/services', {
    schema: {
      summary: 'Cadastrar serviço em uma barbearia',
      tags: ['Barbershops'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['barbershopId'],
        properties: {
          barbershopId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['name', 'durationMinutes', 'basePrice'],
        properties: {
          name:            { type: 'string', minLength: 1 },
          durationMinutes: { type: 'number', minimum: 1 },
          basePrice:       { type: 'number', minimum: 0 },
          description:     { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id:              { type: 'string' },
            barbershopId:    { type: 'string' },
            name:            { type: 'string' },
            durationMinutes: { type: 'number' },
            basePrice:       { type: 'number' },
          },
        },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing token' })
    }
    try {
      await deps.signer.verify(auth.slice(7))
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    const { barbershopId } = request.params as { barbershopId: string }
    const body = request.body as {
      name: string
      durationMinutes: number
      basePrice: number
      description?: string
    }

    const useCase = new CreateServiceUseCase(deps.serviceRepository, deps.barbershopRepository)
    try {
      const result = await useCase.execute({ barbershopId, ...body })
      return reply.status(201).send(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create service.'
      return reply.status(404).send({ error: message })
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

  return server
}
