import { SignJWT, jwtVerify } from 'jose'
import type { TokenSigner } from '../application/ports/token-signer'

export class JwtSigner implements TokenSigner {
  private readonly key: Uint8Array

  constructor(secret: string) {
    this.key = new TextEncoder().encode(secret)
  }

  async sign(payload: Record<string, unknown>): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(this.key)
  }

  async verify(token: string): Promise<Record<string, unknown>> {
    const { payload } = await jwtVerify(token, this.key)
    return payload as Record<string, unknown>
  }
}
