import { Email } from '../value-objects/email'

export class User {
  private constructor(
    readonly id: string,
    readonly email: Email,
    readonly passwordHash: string,
    readonly name: string,
    readonly createdAt: Date,
  ) {}

  static create(props: { id: string; email: string; passwordHash: string; name: string }): User {
    return new User(props.id, new Email(props.email), props.passwordHash, props.name, new Date())
  }
}
