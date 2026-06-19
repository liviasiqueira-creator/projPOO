import bcrypt from 'bcryptjs'
import type { PasswordHasher } from '../application/ports/password-hasher'

export class BcryptHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
