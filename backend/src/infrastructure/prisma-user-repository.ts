import type { PrismaClient } from '../generated/prisma/client'
import type { UserRepository } from '../domain/repositories/user-repository'
import { User, UserRole } from '../domain/entities/user'

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { email } })
    return row ? this.toEntity(row) : null
  }

  async save(user: User): Promise<void> {
    await this.db.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email.value,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        ...(user.phone && { phone: user.phone.value }),
        ...(user.avatarUrl && { avatarUrl: user.avatarUrl.value }),
      },
      update: {
        email: user.email.value,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        phone: user.phone?.value ?? null,
        avatarUrl: user.avatarUrl?.value ?? null,
      },
    })
  }

  private toEntity(row: { id: string; email: string; passwordHash: string; name: string; role: string; phone: string | null; avatarUrl: string | null }): User {
    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      name: row.name,
      role: row.role as UserRole,
      ...(row.phone && { phone: row.phone }),
      ...(row.avatarUrl && { avatarUrl: row.avatarUrl }),
    })
  }
}
