import { Slug } from '../value-objects/slug'
import { Phone } from '../value-objects/phone'
import { AvatarUrl } from '../value-objects/avatar-url'

export class Barbershop {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: Slug,
    readonly createdAt: Date,
    readonly isActive: boolean = true,
    readonly address?: string,
    readonly city?: string,
    readonly phone?: Phone,
    readonly logoUrl?: AvatarUrl,
  ) {}

  static create(props: {
    id: string
    name: string
    address?: string
    city?: string
    phone?: string
    logoUrl?: string
  }): Barbershop {
    if (!props.name.trim()) throw new Error('Barbershop name cannot be empty.')

    return new Barbershop(
      props.id,
      props.name.trim(),
      new Slug(props.name),
      new Date(),
      true,
      props.address?.trim(),
      props.city?.trim(),
      props.phone ? new Phone(props.phone) : undefined,
      props.logoUrl ? new AvatarUrl(props.logoUrl) : undefined,
    )
  }
}
