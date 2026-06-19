import type { UserRepository } from '../domain/repositories/user-repository'
import type { User } from '../domain/entities/user'

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>()

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.value === email) return user
    }
    return null
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user)
  }
}
