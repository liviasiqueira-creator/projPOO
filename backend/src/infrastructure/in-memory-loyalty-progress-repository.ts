import type { LoyaltyProgressRepository } from '../domain/repositories/loyalty-progress-repository'
import type { LoyaltyProgress } from '../domain/entities/loyalty-progress'
import type { LoyaltyPromotionType } from '../domain/value-objects/loyalty-rule'

export class InMemoryLoyaltyProgressRepository implements LoyaltyProgressRepository {
  private readonly progress = new Map<string, LoyaltyProgress>()

  async findByClientBarbershopAndType(
    clientUserId: string,
    barbershopId: string,
    type: LoyaltyPromotionType,
  ): Promise<LoyaltyProgress | null> {
    return (
      [...this.progress.values()].find(
        (p) => p.clientUserId === clientUserId && p.barbershopId === barbershopId && p.type === type,
      ) ?? null
    )
  }

  async save(progress: LoyaltyProgress): Promise<void> {
    this.progress.set(progress.id, progress)
  }
}
