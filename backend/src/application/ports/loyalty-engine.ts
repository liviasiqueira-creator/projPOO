import type { Appointment } from '../../domain/entities/appointment'

export interface LoyaltyEngine {
  processCompletedAppointment(appointment: Appointment): Promise<void>
}
