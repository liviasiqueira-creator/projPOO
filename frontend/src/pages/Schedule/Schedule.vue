<template>
  <v-container class="pa-6">
    <v-btn
      variant="text"
      color="secondary"
      prepend-icon="mdi-arrow-left"
      class="text-none mb-4 px-0"
      :to="`/barbershop/${barbershopId}`"
    >
      Voltar
    </v-btn>

    <div class="schedule-header mb-6">
      <h1 class="text-h5 font-weight-medium">Agendar horário</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">{{ barbershopName }}</p>
    </div>

    <v-row>
      <v-col cols="12" lg="8">

        <p class="text-body-2 font-weight-medium text-uppercase tracking-wide mb-3 section-label">
          1. Serviço
        </p>
        <v-row class="mb-2">
          <v-col
            v-for="service in services"
            :key="service.name"
            cols="12"
            sm="6"
          >
            <v-card
              rounded="lg"
              elevation="0"
              border
              class="service-option"
              :class="{ 'service-option--selected': selectedService?.name === service.name && !selectedPromo }"
              @click="selectService(service)"
            >
              <v-card-text class="d-flex align-center justify-space-between pa-4">
                <div>
                  <p class="text-body-2 font-weight-medium">{{ service.name }}</p>
                  <p class="text-caption text-medium-emphasis">{{ service.duration }}</p>
                </div>
                <span class="service-price">R$ {{ service.price }}</span>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <p class="text-body-2 text-medium-emphasis mb-6" style="font-size: 12px;">
          Ou selecione uma promoção abaixo
        </p>

        <p class="text-body-2 font-weight-medium text-uppercase tracking-wide mb-3 section-label">
          2. Promoções da barbearia
        </p>
        <v-row class="mb-6">
          <v-col
            v-for="promo in promos"
            :key="promo.name"
            cols="12"
            sm="6"
          >
            <v-card
              rounded="lg"
              elevation="0"
              border
              class="service-option promo-option"
              :class="{ 'service-option--selected': selectedPromo?.name === promo.name }"
              @click="selectPromo(promo)"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-1">
                  <p class="text-body-2 font-weight-medium">{{ promo.name }}</p>
                  <v-chip color="primary" size="x-small" variant="tonal">Promo</v-chip>
                </div>
                <p class="text-caption text-medium-emphasis mb-2">{{ promo.duration }}</p>
                <div class="d-flex align-center" style="gap: 8px;">
                  <span class="promo-price">R$ {{ promo.price }}</span>
                  <span class="promo-original">R$ {{ promo.originalPrice }}</span>
                  <v-chip color="success" size="x-small" variant="tonal">-{{ promo.discount }}%</v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <p class="text-body-2 font-weight-medium text-uppercase tracking-wide mb-3 section-label">
          3. Data
        </p>
        <v-card rounded="lg" elevation="0" border class="mb-6 date-picker-card">
          <v-date-picker
            v-model="selectedDate"
            hide-actions
            title=""
            color="primary"
            show-adjacent-months
            :min="minDate"
            width="100%"
          />
        </v-card>

        <p class="text-body-2 font-weight-medium text-uppercase tracking-wide mb-3 section-label">
          4. Horário
        </p>
        <div class="time-slots mb-8">
          <v-chip
            v-for="slot in timeSlots"
            :key="slot.time"
            :disabled="!slot.available"
            :color="selectedTime === slot.time ? 'primary' : undefined"
            :variant="selectedTime === slot.time ? 'flat' : 'outlined'"
            size="large"
            rounded="lg"
            class="time-chip"
            @click="slot.available && (selectedTime = slot.time)"
          >
            {{ slot.time }}
          </v-chip>
        </div>

        <v-card v-if="isReady" rounded="lg" elevation="0" border class="confirm-summary pa-4 mb-6">
          <p class="text-body-2 font-weight-medium mb-3">Resumo do agendamento</p>
          <div class="d-flex flex-column" style="gap: 8px;">
            <div class="d-flex align-center" style="gap: 10px;">
              <v-icon icon="mdi-scissors-cutting" size="16" color="primary" />
              <span class="text-body-2">{{ activeSelection?.name }} · {{ activeSelection?.duration }}</span>
              <v-chip v-if="selectedPromo" color="primary" size="x-small" variant="tonal">Promo</v-chip>
            </div>
            <div class="d-flex align-center" style="gap: 10px;">
              <v-icon icon="mdi-calendar-outline" size="16" color="primary" />
              <span class="text-body-2">{{ selectedDateLabel }}</span>
            </div>
            <div class="d-flex align-center" style="gap: 10px;">
              <v-icon icon="mdi-clock-outline" size="16" color="primary" />
              <span class="text-body-2">{{ selectedTime }}</span>
            </div>
            <v-divider class="my-1" />
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2 text-medium-emphasis">Total</span>
              <div class="d-flex align-center" style="gap: 8px;">
                <span v-if="selectedPromo" class="text-caption text-medium-emphasis text-decoration-line-through">
                  R$ {{ selectedPromo.originalPrice }}
                </span>
                <span class="text-body-1 font-weight-medium" style="color: rgb(var(--v-theme-primary))">
                  R$ {{ activeSelection?.price }}
                </span>
              </div>
            </div>
          </div>
        </v-card>

        <v-btn
          block
          color="primary"
          variant="flat"
          rounded="lg"
          size="large"
          prepend-icon="mdi-check"
          class="text-none"
          :disabled="!isReady"
          :loading="loading"
          @click="confirm"
        >
          Confirmar agendamento
        </v-btn>
      </v-col>
    </v-row>

    <v-snackbar v-model="success" :color="successIsReward ? 'secondary' : 'success'" rounded="lg" :timeout="4000">
      {{ successMessage }}
      <template #actions>
        <v-btn variant="text" @click="success = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const barbershopId = computed(() => route.params.id)
const barbershopName = 'Barbearia do João'

interface Service {
  name: string
  duration: string
  price: number
}

interface Promo {
  name: string
  duration: string
  price: number
  originalPrice: number
  discount: number
}

const services: Service[] = [
  { name: 'Corte', duration: '30 min', price: 45 },
  { name: 'Barba', duration: '20 min', price: 35 },
  { name: 'Sobrancelha', duration: '15 min', price: 20 },
]

const promos: Promo[] = [
  { name: 'Corte + Barba', duration: '45 min', price: 65, originalPrice: 80, discount: 19 },
  { name: 'Corte + Sobrancelha', duration: '40 min', price: 55, originalPrice: 65, discount: 15 },
]

interface TimeSlot {
  time: string
  available: boolean
}

// TODO: buscar do back — GET /barbershop/:id/availability?date=YYYY-MM-DD&serviceId=...
// O back calcula os slots com base no horário de funcionamento, duração do serviço e agendamentos existentes
const timeSlots = ref<TimeSlot[]>([
  { time: '09:00', available: true },
  { time: '09:30', available: false },
  { time: '10:00', available: true },
  { time: '10:30', available: true },
  { time: '11:00', available: false },
  { time: '11:30', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: true },
  { time: '15:00', available: false },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: true },
  { time: '17:00', available: true },
])

const selectedService = ref<Service | null>(null)
const selectedPromo = ref<Promo | null>(null)
const selectedDate = ref<Date>(new Date())
const selectedTime = ref<string | null>(null)
const loading = ref(false)
const success = ref(false)
const successMessage = ref('Agendamento confirmado!')
const successIsReward = ref(false)

const minDate = new Date().toISOString().split('T')[0]

function selectService(service: Service) {
  selectedService.value = service
  selectedPromo.value = null
}

function selectPromo(promo: Promo) {
  selectedPromo.value = promo
  selectedService.value = null
}

const activeSelection = computed(() => selectedPromo.value ?? selectedService.value)

// Quando a data ou o serviço mudar, limpa o horário selecionado
// TODO: disparar chamada ao back aqui — GET /barbershop/:id/availability?date=...&serviceId=...
watch([selectedDate, activeSelection], () => {
  selectedTime.value = null
})

const selectedDateLabel = computed(() => {
  const d = selectedDate.value
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
})

const isReady = computed(() =>
  activeSelection.value !== null && selectedDate.value !== null && selectedTime.value !== null
)

async function confirm() {
  loading.value = true
  // TODO: substituir por chamada real — POST /scheduling
  // const res = await api.post('/scheduling', { ... })
  // const rewardEarned = res.data.rewardEarned
  // const rewardName = res.data.reward
  await new Promise(resolve => setTimeout(resolve, 1000))
  const rewardEarned = false // remover quando integrar o back
  const rewardName = ''     // remover quando integrar o back
  loading.value = false
  successIsReward.value = rewardEarned
  successMessage.value = rewardEarned
    ? `Agendamento confirmado! Este ${rewardName} foi de cortesia.`
    : 'Agendamento confirmado!'
  success.value = true
  setTimeout(() => router.push('/appointments'), 4000)
}
</script>

<style scoped>
.section-label {
  color: rgb(var(--v-theme-secondary));
  letter-spacing: 0.06em;
}

.service-option {
  cursor: pointer;
  transition: border-color 0.15s;
}

.service-option--selected {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgb(var(--v-theme-primary) / 0.06);
}

.service-price {
  font-size: 15px;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
}

.promo-price {
  font-size: 15px;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
}

.promo-original {
  font-size: 12px;
  color: rgb(var(--v-theme-secondary));
  text-decoration: line-through;
}

.date-picker-card {
  overflow: hidden;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.time-chip {
  cursor: pointer;
}

.confirm-summary {
  background: rgb(var(--v-theme-surface));
}
</style>
