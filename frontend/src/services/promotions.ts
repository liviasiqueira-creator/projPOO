import api from './api'

export type PromotionType = 'barba_gratis' | 'corte_gratis'

export interface BarbershopPromotion {
  type: PromotionType
  active: boolean
  activatedAt?: string
}

export async function listBarbershopPromotions(barbershopId: string): Promise<BarbershopPromotion[]> {
  const { data } = await api.get<BarbershopPromotion[]>(`/barbershops/${barbershopId}/promotions`)
  return data
}

export async function activatePromotion(barbershopId: string, type: PromotionType): Promise<BarbershopPromotion> {
  const { data } = await api.patch<BarbershopPromotion>(`/barbershops/${barbershopId}/promotions/${type}/activate`)
  return data
}

export async function deactivatePromotion(barbershopId: string, type: PromotionType): Promise<BarbershopPromotion> {
  const { data } = await api.patch<BarbershopPromotion>(`/barbershops/${barbershopId}/promotions/${type}/deactivate`)
  return data
}
