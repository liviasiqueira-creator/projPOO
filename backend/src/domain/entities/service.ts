export class Service {
  private constructor(
    readonly id: string,
    readonly barbershopId: string,
    readonly name: string,
    readonly durationMinutes: number,
    readonly basePrice: number,
    readonly createdAt: Date,
    readonly isActive: boolean = true,
    readonly description?: string,
  ) {}

  static create(props: {
    id: string
    barbershopId: string
    name: string
    durationMinutes: number
    basePrice: number
    description?: string
  }): Service {
    if (!props.name.trim()) throw new Error('Service name cannot be empty.')
    if (props.durationMinutes <= 0) throw new Error('Duration must be greater than zero.')
    if (props.basePrice < 0) throw new Error('Price cannot be negative.')

    return new Service(
      props.id,
      props.barbershopId,
      props.name.trim(),
      props.durationMinutes,
      props.basePrice,
      new Date(),
      true,
      props.description?.trim(),
    )
  }
}
