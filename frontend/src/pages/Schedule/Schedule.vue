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

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      rounded="lg"
      density="comfortable"
      class="mb-4"
      closable
      @click:close="errorMessage = null"
    >
      {{ errorMessage }}
    </v-alert>

    <v-row>
      <v-col cols="12" lg="8">

        <p class="text-body-2 font-weight-medium text-uppercase tracking-wide mb-3 section-label">
          1. Serviço
        </p>
        <v-row v-if="loadingServices" class="mb-2">
          <v-col cols="12" class="d-flex justify-center pa-4">
            <v-progress-circular indeterminate color="primary" size="28" />
          </v-col>
        </v-row>
        <v-row v-else class="mb-2">
          <v-col
            v-for="service in services"
            :key="service.id"
            cols="12"
            sm="6"
          >
            <v-card
              rounded="lg"
              elevation="0"
              border
              class="service-option"
              :class="{ 'service-option--selected': selectedService?.id === service.id }"
              @click="selectService(service)"
            >
              <v-card-text class="d-flex align-center justify-space-between pa-4">
                <div>
                  <p class="text-body-2 font-weight-medium">{{ service.name }}</p>
                  <p class="text-caption text-medium-emphasis">{{ service.durationMinutes }} min</p>
                </div>
                <span class="service-price">R$ {{ service.basePrice }}</span>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <p class="text-body-2 font-weight-medium text-uppercase tracking-wide mb-3 section-label">
          2. Data
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
          3. Horário
        </p>

        <div v-if="!selectedService" class="mb-8">
          <p class="text-body-2 text-medium-emphasis">Selecione um serviço para ver os horários disponíveis.</p>
        </div>
        <div v-else-if="loadingSlots" class="mb-8 d-flex pa-4">
          <v-progress-circular indeterminate color="primary" size="28" />
        </div>
        <div v-else-if="timeSlots.length === 0" class="mb-8">
          <p class="text-body-2 text-medium-emphasis">Nenhum horário disponível nesta data.</p>
        </div>
        <div v-else class="time-slots mb-8">
          <v-chip
            v-for="slot in timeSlots"
            :key="slot.startTime"
            :color="selectedTime === slot.startTime ? 'primary' : undefined"
            :variant="selectedTime === slot.startTime ? 'flat' : 'outlined'"
            size="large"
            rounded="lg"
            class="time-chip"
            @click="selectedTime = slot.startTime"
          >
            {{ slot.startTime }}
          </v-chip>
        </div>

        <v-card v-if="isReady" rounded="lg" elevation="0" border class="confirm-summary pa-4 mb-6">
          <p class="text-body-2 font-weight-medium mb-3">Resumo do agendamento</p>
          <div class="d-flex flex-column" style="gap: 8px;">
            <div class="d-flex align-center" style="gap: 10px;">
              <v-icon icon="mdi-scissors-cutting" size="16" color="primary" />
              <span class="text-body-2">{{ activeSelectionDisplay?.name }} · {{ activeSelectionDisplay?.durationLabel }}</span>
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
              <span class="text-body-1 font-weight-medium" style="color: rgb(var(--v-theme-primary))">
                R$ {{ activeSelectionDisplay?.price }}
              </span>
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

    <v-snackbar v-model="success" color="success" rounded="lg" :timeout="4000">
      {{ successMessage }}
      <template #actions>
        <v-btn variant="text" @click="success = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { getBarbershop, listServices, type Service } from '../../services/barberShop'
import { getAvailableSlots, bookAppointment, type AvailableSlot } from '../../services/scheduling'

const route = useRoute()
const router = useRouter()

const barbershopId = computed(() => String(route.params.id ?? ''))
const barbershopName = ref('')

const services = ref<Service[]>([])
const loadingServices = ref(true)
const availableSlots = ref<AvailableSlot[]>([])
const loadingSlots = ref(false)
const errorMessage = ref<string | null>(null)

const selectedService = ref<Service | null>(null)
const selectedDate = ref<Date>(new Date())
const selectedTime = ref<string | null>(null)
const loading = ref(false)
const success = ref(false)
const successMessage = ref('Agendamento confirmado!')

const minDate = new Date().toISOString().split('T')[0]

onMounted(async () => {
  try {
    const [shop, shopServices] = await Promise.all([
      getBarbershop(barbershopId.value),
      listServices(barbershopId.value),
    ])
    barbershopName.value = shop.name
    services.value = shopServices
  } catch {
    errorMessage.value = 'Não foi possível carregar os dados da barbearia.'
  } finally {
    loadingServices.value = false
  }
})

function selectService(service: Service) {
  selectedService.value = service
}

const activeSelectionDisplay = computed(() => {
  if (selectedService.value) {
    return {
      name: selectedService.value.name,
      durationLabel: `${selectedService.value.durationMinutes} min`,
      price: selectedService.value.basePrice,
    }
  }
  return null
})

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

watch([selectedDate, selectedService], async () => {
  selectedTime.value = null
  availableSlots.value = []
  if (!selectedService.value) return

  loadingSlots.value = true
  try {
    availableSlots.value = await getAvailableSlots(barbershopId.value, selectedService.value.id, toISODate(selectedDate.value))
  } catch {
    availableSlots.value = []
  } finally {
    loadingSlots.value = false
  }
})

const timeSlots = computed(() => {
  const seen = new Set<string>()
  return availableSlots.value
    .filter((slot) => (seen.has(slot.startTime) ? false : (seen.add(slot.startTime), true)))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const selectedSlotBarberUserId = computed(() => {
  return availableSlots.value.find((slot) => slot.startTime === selectedTime.value)?.barberUserId ?? null
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
  selectedService.value !== null && selectedTime.value !== null && selectedSlotBarberUserId.value !== null
)

async function confirm() {
  if (!selectedService.value || !selectedTime.value || !selectedSlotBarberUserId.value) return

  loading.value = true
  errorMessage.value = null
  try {
    await bookAppointment({
      barbershopId: barbershopId.value,
      barberUserId: selectedSlotBarberUserId.value,
      serviceId: selectedService.value.id,
      scheduledAt: `${toISODate(selectedDate.value)}T${selectedTime.value}:00.000Z`,
    })
    successMessage.value = 'Agendamento confirmado!'
    success.value = true
    setTimeout(() => router.push('/appointments'), 3000)
  } catch (err) {
    errorMessage.value = axios.isAxiosError(err)
      ? (err.response?.data?.error ?? 'Não foi possível confirmar o agendamento.')
      : 'Não foi possível confirmar o agendamento.'
  } finally {
    loading.value = false
  }
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
