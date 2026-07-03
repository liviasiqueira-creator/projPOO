export const FIXED_SERVICE_NAMES = ['Corte', 'Barba', 'Sobrancelha'] as const

export type FixedServiceName = (typeof FIXED_SERVICE_NAMES)[number]

export const DEFAULT_SERVICE_DEFAULTS: Record<FixedServiceName, { durationMinutes: number; basePrice: number }> = {
  Corte: { durationMinutes: 30, basePrice: 40 },
  Barba: { durationMinutes: 20, basePrice: 25 },
  Sobrancelha: { durationMinutes: 15, basePrice: 20 },
}

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

  static restore(props: {
    id: string
    barbershopId: string
    name: string
    durationMinutes: number
    basePrice: number
    isActive: boolean
    description?: string
  }): Service {
    return new Service(
      props.id,
      props.barbershopId,
      props.name,
      props.durationMinutes,
      props.basePrice,
      new Date(),
      props.isActive,
      props.description,
    )
  }

  /** Cria um serviço do catálogo fixo usando os valores padrão de duração/preço. */
  static createDefault(props: { id: string; barbershopId: string; name: FixedServiceName }): Service {
    const defaults = DEFAULT_SERVICE_DEFAULTS[props.name]
    return Service.create({
      id: props.id,
      barbershopId: props.barbershopId,
      name: props.name,
      durationMinutes: defaults.durationMinutes,
      basePrice: defaults.basePrice,
    })
  }

  withDetails(props: { durationMinutes: number; basePrice: number }): Service {
    if (props.durationMinutes <= 0) throw new Error('Duration must be greater than zero.')
    if (props.basePrice < 0) throw new Error('Price cannot be negative.')

    return new Service(
      this.id,
      this.barbershopId,
      this.name,
      props.durationMinutes,
      props.basePrice,
      this.createdAt,
      this.isActive,
      this.description,
    )
  }

  activate(): Service {
    return new Service(this.id, this.barbershopId, this.name, this.durationMinutes, this.basePrice, this.createdAt, true, this.description)
  }

  deactivate(): Service {
    return new Service(this.id, this.barbershopId, this.name, this.durationMinutes, this.basePrice, this.createdAt, false, this.description)
  }
}
