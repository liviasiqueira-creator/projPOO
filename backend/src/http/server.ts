import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { UserRepository } from '../domain/repositories/user-repository'
import type { PasswordHasher } from '../application/ports/password-hasher'
import type { TokenSigner } from '../application/ports/token-signer'
import { LoginUseCase } from '../application/use-cases/login'

interface ServerDeps {
  userRepository: UserRepository
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
      const payload = deps.signer.verify(auth.slice(7))
      const user = await deps.userRepository.findById(String(payload['sub']))
      if (!user) return reply.status(401).send({ error: 'User not found' })
      return { id: user.id, name: user.name, email: user.email.value }
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }
  })

  return server
}
