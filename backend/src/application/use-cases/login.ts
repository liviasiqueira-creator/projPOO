import type { UserRepository } from '../../domain/repositories/user-repository'
import type { PasswordHasher } from '../ports/password-hasher'
import type { TokenSigner } from '../ports/token-signer'

export type LoginInput  = { email: string; password: string }
export type LoginOutput = { accessToken: string }

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: PasswordHasher,   // porta
    private readonly tokenSigner: TokenSigner, // porta
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) throw new Error('Invalid credentials')

    const valid = await this.hasher.compare(input.password, user.passwordHash)
    if (!valid) throw new Error('Invalid credentials')

    const accessToken = await this.tokenSigner.sign({ sub: user.id })
    return { accessToken }
  }
}
