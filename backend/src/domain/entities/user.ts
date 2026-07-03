import { Email } from '../value-objects/email'
import { Phone } from '../value-objects/phone'
import { AvatarUrl } from '../value-objects/avatar-url'

export enum UserRole {
  Client  = 'client',
  Admin = 'admin',
  Barber = 'barber',
}

export class User {
  private constructor(
    readonly id: string,
    readonly email: Email,
    readonly passwordHash: string,
    readonly name: string,
    readonly createdAt: Date,
    readonly role: UserRole = UserRole.Client,
    readonly isActive: boolean = true,
    readonly phone?: Phone,
    readonly avatarUrl?: AvatarUrl
  ) {}

  static create(props: { id: string; email: string; passwordHash: string; name: string; role?: UserRole | undefined; phone?: string | undefined; avatarUrl?: string | undefined }): User {
    return new User(
      props.id,
      new Email(props.email),
      props.passwordHash,
      props.name,
      new Date(),
      props.role,
      true,
      props.phone ? new Phone(props.phone) : undefined,
      props.avatarUrl ? new AvatarUrl(props.avatarUrl) : undefined,
    )
  }

  withRole(role: UserRole): User {
    return new User(this.id, this.email, this.passwordHash, this.name, this.createdAt, role, this.isActive, this.phone, this.avatarUrl)
  }
}
