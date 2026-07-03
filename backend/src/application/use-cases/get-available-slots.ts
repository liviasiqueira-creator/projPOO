import type { BarberAvailabilityRepository } from '../../domain/repositories/barber-availability-repository'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { Weekday } from '../../domain/entities/barber-availability'

export type GetAvailableSlotsInput = {
  barbershopId: string
  serviceId: string
  date: string // YYYY-MM-DD
}

export type AvailableSlot = {
  barberUserId: string
  startTime: string // HH:MM
  endTime: string   // HH:MM
}

export type GetAvailableSlotsOutput = AvailableSlot[]

export class GetAvailableSlotsUseCase {
  constructor(
    private readonly availabilityRepository: BarberAvailabilityRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: GetAvailableSlotsInput): Promise<GetAvailableSlotsOutput> {
    const service = await this.serviceRepository.findById(input.serviceId)
    if (!service) throw new Error('Service not found.')

    const date = new Date(input.date)
    const weekday = date.getUTCDay() as Weekday

    const blocks = await this.availabilityRepository.findAvailableBarbers(
      input.barbershopId,
      weekday,
    )

    const slots: AvailableSlot[] = []

    for (const block of blocks) {
      const startOfDay = new Date(`${input.date}T00:00:00.000Z`)
      const endOfDay = new Date(`${input.date}T23:59:59.999Z`)

      const appointments = await this.appointmentRepository.findConflicting(
        block.barberUserId,
        startOfDay,
        endOfDay,
      )

      const generated = this.generateSlots(
        block.startTime,
        block.endTime,
        service.durationMinutes,
        input.date,
        appointments.map((a) => ({
          start: this.toHHMM(a.scheduledAt),
          end: this.toHHMM(a.endsAt),
        })),
      )

      for (const slot of generated) {
        slots.push({ barberUserId: block.barberUserId, ...slot })
      }
    }

    return slots
  }

  private generateSlots(
    blockStart: string,
    blockEnd: string,
    durationMinutes: number,
    date: string,
    busyPeriods: { start: string; end: string }[],
  ): { startTime: string; endTime: string }[] {
    const slots: { startTime: string; endTime: string }[] = []
    let current = this.toMinutes(blockStart)
    const end = this.toMinutes(blockEnd)

    while (current + durationMinutes <= end) {
      const slotStart = this.fromMinutes(current)
      const slotEnd = this.fromMinutes(current + durationMinutes)

      const isBusy = busyPeriods.some(
        (p) => slotStart < p.end && slotEnd > p.start,
      )

      if (!isBusy) slots.push({ startTime: slotStart, endTime: slotEnd })

      current += durationMinutes
    }

    return slots
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }

  private fromMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0')
    const m = (minutes % 60).toString().padStart(2, '0')
    return `${h}:${m}`
  }

  private toHHMM(date: Date): string {
    return date.toISOString().slice(11, 16)
  }
}
