import api from './api'

export interface AvailableSlot {
  barberUserId: string
  startTime: string // HH:MM
  endTime: string   // HH:MM
}

export async function getAvailableSlots(barbershopId: string, serviceId: string, date: string): Promise<AvailableSlot[]> {
  const { data } = await api.get<AvailableSlot[]>(`/barbershops/${barbershopId}/available-slots`, {
    params: { serviceId, date },
  })
  return data
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export interface BookAppointmentPayload {
  barbershopId: string
  barberUserId: string
  serviceId: string
  scheduledAt: string
}

export interface Appointment {
  id: string
  barbershopId: string
  barberUserId: string
  clientUserId: string
  serviceId: string
  scheduledAt: string
  endsAt: string
  durationMinutes: number
  priceSnapshot: number
  status: AppointmentStatus
}

export async function bookAppointment(payload: BookAppointmentPayload): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/appointments', payload)
  return data
}

export interface ListAppointmentsParams {
  barbershopId?: string
  barberUserId?: string
}

export async function listAppointments(params?: ListAppointmentsParams): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>('/appointments', { params })
  return data
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<{ id: string; status: string }> {
  const { data } = await api.patch<{ id: string; status: string }>(`/appointments/${appointmentId}/status`, { status })
  return data
}
