import api from './api'

export interface Barbershop {
  id: string
  name: string
  slug: string
  city?: string
  address?: string
  logoUrl?: string
  latitude?: number
  longitude?: number
}

export interface ListBarbershopsParams {
  city?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
}

export async function listBarbershops(params?: ListBarbershopsParams): Promise<Barbershop[]> {
  const { data } = await api.get<Barbershop[]>('/barbershops', { params })
  return data
}

export const FIXED_SERVICE_NAMES = ['Corte', 'Barba', 'Sobrancelha'] as const

export interface CreateBarbershopPayload {
  name: string
  address?: string
  city?: string
  phone?: string
  logoUrl?: string
  serviceNames?: string[]
}

export interface CreateBarbershopResponse {
  id: string
  name: string
  slug: string
}

export async function createBarbershop(payload: CreateBarbershopPayload): Promise<CreateBarbershopResponse> {
  const { data } = await api.post<CreateBarbershopResponse>('/barbershops', payload)
  return data
}

export interface BarbershopDetail extends Barbershop {
  phone?: string
}

export async function getBarbershop(barbershopId: string): Promise<BarbershopDetail> {
  const { data } = await api.get<BarbershopDetail>(`/barbershops/${barbershopId}`)
  return data
}

export async function getMyBarbershop(): Promise<BarbershopDetail> {
  const { data } = await api.get<BarbershopDetail>('/barbershops/me')
  return data
}

export interface Service {
  id: string
  name: string
  description?: string
  durationMinutes: number
  basePrice: number
}

export async function listServices(barbershopId: string): Promise<Service[]> {
  const { data } = await api.get<Service[]>(`/barbershops/${barbershopId}/services`)
  return data
}

export async function enableService(barbershopId: string, name: string): Promise<Service> {
  const { data } = await api.post<Service>(`/barbershops/${barbershopId}/services`, { name })
  return data
}

export async function updateService(
  barbershopId: string,
  serviceId: string,
  payload: { durationMinutes: number; basePrice: number },
): Promise<Service> {
  const { data } = await api.put<Service>(`/barbershops/${barbershopId}/services/${serviceId}`, payload)
  return data
}

export async function removeService(barbershopId: string, serviceId: string): Promise<void> {
  await api.delete(`/barbershops/${barbershopId}/services/${serviceId}`)
}
