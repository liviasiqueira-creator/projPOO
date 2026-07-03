export type LoyaltyPromotionType = 'barba_gratis' | 'corte_gratis'

export interface LoyaltyRule {
  type: LoyaltyPromotionType
  threshold: number // quantidade de agendamentos pagos e concluídos necessários
  windowDays: number // janela, em dias, pra completar o ciclo (do 1º ao último agendamento)
  rewardExpiryDays: number // validade do benefício ganho, a partir da data em que foi ganho
  rewardServiceName: 'Barba' | 'Corte'
}

export const LOYALTY_RULES: Record<LoyaltyPromotionType, LoyaltyRule> = {
  barba_gratis: {
    type: 'barba_gratis',
    threshold: 3,
    windowDays: 30,
    rewardExpiryDays: 30,
    rewardServiceName: 'Barba',
  },
  corte_gratis: {
    type: 'corte_gratis',
    threshold: 5,
    windowDays: 60,
    rewardExpiryDays: 30,
    rewardServiceName: 'Corte',
  },
}
