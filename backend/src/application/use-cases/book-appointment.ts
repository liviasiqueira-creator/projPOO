import { randomUUID } from 'node:crypto'
import { Appointment } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { BarberMembershipRepository } from '../../domain/repositories/barber-membership-repository'
import type { LoyaltyRewardRepository } from '../../domain/repositories/loyalty-reward-repository'
import { LOYALTY_RULES } from '../../domain/value-objects/loyalty-rule'

export type BookAppointmentInput = {
  barbershopId: string
  barberUserId: string
  clientUserId: string
  serviceId: string
  scheduledAt: Date
  redeemRewardId?: string
}

export type BookAppointmentOutput = {
  id: string
  barbershopId: string
  barberUserId: string
  clientUserId: string
  serviceId: string
  scheduledAt: Date
  endsAt: Date
  durationMinutes: number
  priceSnapshot: number
  status: string
  isRedemption: boolean
}

export class BookAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly membershipRepository: BarberMembershipRepository,
    private readonly loyaltyRewardRepository: LoyaltyRewardRepository,
  ) {}

  async execute(input: BookAppointmentInput): Promise<BookAppointmentOutput> {
    const service = await this.serviceRepository.findById(input.serviceId)
    if (!service) throw new Error('Service not found.')
    if (service.barbershopId !== input.barbershopId) throw new Error('Service does not belong to this barbershop.')

    const membership = await this.membershipRepository.findByBarberAndBarbershop(
      input.barberUserId,
      input.barbershopId,
    )
    if (!membership) throw new Error('Barber is not a member of this barbershop.')

    const endsAt = new Date(input.scheduledAt.getTime() + service.durationMinutes * 60 * 1000)

    // Cross-barbershop conflict check: only by barberUserId, not barbershopId
    const conflicts = await this.appointmentRepository.findConflicting(
      input.barberUserId,
      input.scheduledAt,
      endsAt,
    )
    if (conflicts.length > 0) throw new Error('Barber already has an appointment during this time.')

    let priceSnapshot = service.basePrice
    let reward = null

    if (input.redeemRewardId) {
      reward = await this.loyaltyRewardRepository.findById(input.redeemRewardId)
      if (!reward || reward.clientUserId !== input.clientUserId || reward.barbershopId !== input.barbershopId) {
        throw new Error('Reward not found.')
      }
      if (!reward.isRedeemableAt(new Date())) throw new Error('Reward is not redeemable (already used or expired).')
      if (service.name !== LOYALTY_RULES[reward.type].rewardServiceName) {
        throw new Error(`This reward can only be redeemed for the ${LOYALTY_RULES[reward.type].rewardServiceName} service.`)
      }
      priceSnapshot = 0
    }

    const appointment = Appointment.create({
      id: randomUUID(),
      barbershopId: input.barbershopId,
      barberUserId: input.barberUserId,
      clientUserId: input.clientUserId,
      serviceId: input.serviceId,
      scheduledAt: input.scheduledAt,
      durationMinutes: service.durationMinutes,
      priceSnapshot,
      isRedemption: reward !== null,
    })

    await this.appointmentRepository.save(appointment)

    if (reward) {
      await this.loyaltyRewardRepository.update(reward.redeem(appointment.id))
    }

    return {
      id: appointment.id,
      barbershopId: appointment.barbershopId,
      barberUserId: appointment.barberUserId,
      clientUserId: appointment.clientUserId,
      serviceId: appointment.serviceId,
      scheduledAt: appointment.scheduledAt,
      endsAt: appointment.endsAt,
      durationMinutes: appointment.durationMinutes,
      priceSnapshot: appointment.priceSnapshot,
      status: appointment.status,
      isRedemption: appointment.isRedemption,
    }
  }
}
