import { randomUUID } from 'node:crypto'
import { User, UserRole } from '../../domain/entities/user'
import type { UserRepository } from '../../domain/repositories/user-repository'
import type { PasswordHasher } from '../ports/password-hasher'
import type { TokenSigner } from '../ports/token-signer'

export type RegisterInput = {
  name: string
  email: string
  password: string
  role?: UserRole
  phone?: string
  avatarUrl?: string
}

export type RegisterOutput = {
  accessToken: string
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokenSigner: TokenSigner,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existing = await this.userRepository.findByEmail(input.email)
    if (existing) throw new Error('E-mail já está em uso.')

    const passwordHash = await this.hasher.hash(input.password)

    const user = User.create({
      id: randomUUID(),
      email: input.email,
      passwordHash,
      name: input.name,
      role: input.role ?? UserRole.Client,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    })

    await this.userRepository.save(user)

    const accessToken = await this.tokenSigner.sign({ sub: user.id })
    return { accessToken }
  }
}
