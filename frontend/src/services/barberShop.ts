import api from './api'

export interface Barbershop {
  id: string
  name: string
  slug: string
  city?: string
  address?: string
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

export interface CreateBarbershopPayload {
  name: string
  address?: string
  city?: string
  phone?: string
  logoUrl?: string
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
  logoUrl?: string
}

export async function getBarbershop(barbershopId: string): Promise<BarbershopDetail> {
  const { data } = await api.get<BarbershopDetail>(`/barbershops/${barbershopId}`)
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
