<template>
  <v-container class="pa-6">
    <div class="promotions-header mb-6">
      <div>
        <h1 class="text-h5 font-weight-medium">Promoções</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Ative ou desative as promoções de fidelidade da sua barbearia
        </p>
      </div>
    </div>

    <v-row v-if="loading">
      <v-col cols="12" class="d-flex justify-center pa-10">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="promo in promotions"
        :key="promo.type"
        cols="12"
        md="6"
      >
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-5">
            <div class="d-flex align-start justify-space-between mb-3">
              <div class="d-flex align-center" style="gap: 12px;">
                <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
                  <v-icon icon="mdi-tag-outline" size="20" />
                </v-avatar>
                <div>
                  <p class="text-body-1 font-weight-medium">{{ PROMO_META[promo.type].title }}</p>
                </div>
              </div>
              <v-switch
                :model-value="promo.active"
                color="primary"
                hide-details
                density="compact"
                :loading="togglingType === promo.type"
                :disabled="togglingType !== null"
                @update:model-value="toggle(promo)"
              />
            </div>

            <p class="text-body-2 text-medium-emphasis mb-2">{{ PROMO_META[promo.type].description }}</p>

            <p v-if="lockMessage[promo.type]" class="text-caption" style="color: rgb(var(--v-theme-error));">
              {{ lockMessage[promo.type] }}
            </p>
            <p v-else-if="promo.active && unlockDate(promo)" class="text-caption text-medium-emphasis">
              Pode ser desativada a partir de {{ formatDate(unlockDate(promo)!) }}.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getMyBarbershop } from '../../services/barberShop'
import {
  listBarbershopPromotions,
  activatePromotion,
  deactivatePromotion,
  type BarbershopPromotion,
  type PromotionType,
} from '../../services/promotions'

const PROMO_META: Record<PromotionType, { title: string; description: string }> = {
  barba_gratis: {
    title: 'Barba grátis',
    description: 'A cada 3 agendamentos pagos e concluídos em até 30 dias, o cliente ganha uma Barba grátis (válida por 30 dias).',
  },
  corte_gratis: {
    title: 'Corte grátis',
    description: 'A cada 5 agendamentos pagos e concluídos em até 60 dias, o cliente ganha um Corte grátis (válido por 30 dias).',
  },
}

const ACTIVATION_LOCK_DAYS = 30

const loading = ref(true)
const barbershopId = ref('')
const promotions = ref<BarbershopPromotion[]>([])
const togglingType = ref<PromotionType | null>(null)
const lockMessage = ref<Record<PromotionType, string | null>>({ barba_gratis: null, corte_gratis: null })

onMounted(async () => {
  try {
    const shop = await getMyBarbershop()
    barbershopId.value = shop.id
    promotions.value = await listBarbershopPromotions(shop.id)
  } finally {
    loading.value = false
  }
})

function unlockDate(promo: BarbershopPromotion): Date | null {
  if (!promo.activatedAt) return null
  return new Date(new Date(promo.activatedAt).getTime() + ACTIVATION_LOCK_DAYS * 24 * 60 * 60 * 1000)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function toggle(promo: BarbershopPromotion) {
  lockMessage.value[promo.type] = null
  togglingType.value = promo.type
  try {
    const updated = promo.active
      ? await deactivatePromotion(barbershopId.value, promo.type)
      : await activatePromotion(barbershopId.value, promo.type)
    Object.assign(promo, updated)
  } catch (err) {
    lockMessage.value[promo.type] = axios.isAxiosError(err)
      ? (err.response?.data?.error ?? 'Não foi possível atualizar a promoção.')
      : 'Não foi possível atualizar a promoção.'
  } finally {
    togglingType.value = null
  }
}
</script>

<style scoped>
.promotions-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
</style>
