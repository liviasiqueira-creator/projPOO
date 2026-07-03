import type { LoyaltyProgress } from '../entities/loyalty-progress'
import type { LoyaltyPromotionType } from '../value-objects/loyalty-rule'

export interface LoyaltyProgressRepository {
  findByClientBarbershopAndType(
    clientUserId: string,
    barbershopId: string,
    type: LoyaltyPromotionType,
  ): Promise<LoyaltyProgress | null>
  save(progress: LoyaltyProgress): Promise<void>
}
