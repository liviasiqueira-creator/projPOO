import type { AppointmentStatus } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'

export type UpdateAppointmentStatusInput = {
  appointmentId: string
  status: AppointmentStatus
}

export type UpdateAppointmentStatusOutput = {
  id: string
  status: AppointmentStatus
}

export class UpdateAppointmentStatusUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: UpdateAppointmentStatusInput): Promise<UpdateAppointmentStatusOutput> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId)
    if (!appointment) throw new Error('Appointment not found.')

    const updated = appointment.transition(input.status)
    await this.appointmentRepository.update(updated)

    return { id: updated.id, status: updated.status }
  }
}
