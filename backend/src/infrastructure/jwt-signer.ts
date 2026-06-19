import jwt from 'jsonwebtoken'
import type { TokenSigner } from '../application/ports/token-signer'

export class JwtSigner implements TokenSigner {
  constructor(private readonly secret: string) {}

  sign(payload: Record<string, unknown>): string {
    return jwt.sign(payload, this.secret, { expiresIn: '7d' })
  }

  verify(token: string): Record<string, unknown> {
    return jwt.verify(token, this.secret) as Record<string, unknown>
  }
}
