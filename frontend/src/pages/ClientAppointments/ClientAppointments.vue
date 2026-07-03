<template>
  <v-container class="pa-6">
    <div class="mb-6">
      <h1 class="text-h5 font-weight-medium">Meus agendamentos</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">
        {{ upcomingAppointments.length }} agendamento{{ upcomingAppointments.length !== 1 ? 's' : '' }} próximo{{ upcomingAppointments.length !== 1 ? 's' : '' }}
      </p>
    </div>

    <v-row v-if="loading">
      <v-col cols="12" class="d-flex justify-center pa-10">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else>
    <!-- Próximos -->
    <p class="section-label mb-3">Próximos</p>

    <div v-if="upcomingAppointments.length > 0" class="mb-8">
      <v-card
        v-for="appt in upcomingAppointments"
        :key="appt.id"
        class="mb-3"
        rounded="lg"
        elevation="0"
        border
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center" style="gap: 10px;">
              <v-avatar color="primary" variant="tonal" size="36" rounded="lg">
                <v-icon icon="mdi-scissors-cutting" size="18" />
              </v-avatar>
              <div>
                <p class="text-body-2 font-weight-medium mb-0">{{ appt.barbershopName }}</p>
                <p class="text-caption text-medium-emphasis mb-0">{{ appt.service }}</p>
              </div>
            </div>
            <v-chip :color="statusColor(appt.status)" size="small" variant="tonal">
              {{ statusLabel(appt.status) }}
            </v-chip>
          </div>

          <v-divider class="my-3" />

          <div class="d-flex align-center" style="gap: 20px;">
            <div class="d-flex align-center" style="gap: 6px;">
              <v-icon icon="mdi-calendar-outline" size="15" color="secondary" />
              <span class="text-caption">{{ formatDate(appt.date) }}</span>
            </div>
            <div class="d-flex align-center" style="gap: 6px;">
              <v-icon icon="mdi-clock-outline" size="15" color="secondary" />
              <span class="text-caption">{{ appt.time }}</span>
            </div>
            <div class="d-flex align-center" style="gap: 6px;">
              <v-icon icon="mdi-cash-outline" size="15" color="secondary" />
              <span class="text-caption">R$ {{ appt.price }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div v-else class="appointments-empty mb-8">
      <v-icon icon="mdi-calendar-blank-outline" size="48" color="primary" class="mb-4" />
      <p class="text-body-1 font-weight-medium">Nenhum agendamento próximo</p>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Explore barbearias e agende um horário.
      </p>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        prepend-icon="mdi-magnify"
        class="text-none mt-4"
        to="/home"
      >
        Explorar barbearias
      </v-btn>
    </div>

    <!-- Histórico -->
    <template v-if="pastAppointments.length > 0">
      <p class="section-label mb-3">Histórico</p>
      <v-card
        v-for="appt in pastAppointments"
        :key="appt.id"
        class="mb-3"
        rounded="lg"
        elevation="0"
        border
        :style="{ opacity: appt.status === 'cancelled' ? 0.6 : 1 }"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center" style="gap: 10px;">
              <v-avatar color="primary" variant="tonal" size="36" rounded="lg">
                <v-icon icon="mdi-scissors-cutting" size="18" />
              </v-avatar>
              <div>
                <p class="text-body-2 font-weight-medium mb-0">{{ appt.barbershopName }}</p>
                <p class="text-caption text-medium-emphasis mb-0">{{ appt.service }}</p>
              </div>
            </div>
            <v-chip :color="statusColor(appt.status)" size="small" variant="tonal">
              {{ statusLabel(appt.status) }}
            </v-chip>
          </div>

          <v-divider class="my-3" />

          <div class="d-flex align-center" style="gap: 20px;">
            <div class="d-flex align-center" style="gap: 6px;">
              <v-icon icon="mdi-calendar-outline" size="15" color="secondary" />
              <span class="text-caption">{{ formatDate(appt.date) }}</span>
            </div>
            <div class="d-flex align-center" style="gap: 6px;">
              <v-icon icon="mdi-clock-outline" size="15" color="secondary" />
              <span class="text-caption">{{ appt.time }}</span>
            </div>
            <div class="d-flex align-center" style="gap: 6px;">
              <v-icon icon="mdi-cash-outline" size="15" color="secondary" />
              <span class="text-caption">R$ {{ appt.price }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </template>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { listAppointments, type Appointment, type AppointmentStatus } from '../../services/scheduling'
import { getBarbershop, listServices } from '../../services/barberShop'

interface ClientAppointment {
  id: string
  barbershopName: string
  service: string
  date: string
  time: string
  price: number
  status: AppointmentStatus
}

const loading = ref(true)
const appointments = ref<ClientAppointment[]>([])

async function enrich(raw: Appointment[]): Promise<ClientAppointment[]> {
  const barbershopIds = [...new Set(raw.map((a) => a.barbershopId))]

  const shopEntries = await Promise.all(
    barbershopIds.map(async (id) => {
      const [shop, services] = await Promise.all([getBarbershop(id), listServices(id)])
      const serviceNames = new Map(services.map((s) => [s.id, s.name]))
      return [id, { name: shop.name, serviceNames }] as const
    }),
  )
  const shopsById = new Map(shopEntries)

  return raw.map((a) => {
    const shop = shopsById.get(a.barbershopId)
    const scheduledAt = new Date(a.scheduledAt)
    return {
      id: a.id,
      barbershopName: shop?.name ?? 'Barbearia',
      service: shop?.serviceNames.get(a.serviceId) ?? 'Serviço',
      date: `${scheduledAt.getUTCFullYear()}-${String(scheduledAt.getUTCMonth() + 1).padStart(2, '0')}-${String(scheduledAt.getUTCDate()).padStart(2, '0')}`,
      time: `${String(scheduledAt.getUTCHours()).padStart(2, '0')}:${String(scheduledAt.getUTCMinutes()).padStart(2, '0')}`,
      price: a.priceSnapshot,
      status: a.status,
    }
  })
}

onMounted(async () => {
  try {
    const raw = await listAppointments()
    appointments.value = await enrich(raw)
  } finally {
    loading.value = false
  }
})

const today = new Date().toISOString().split('T')[0] ?? ''

const upcomingAppointments = computed(() =>
  appointments.value
    .filter(a => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed' && a.status !== 'no_show')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
)

const pastAppointments = computed(() =>
  appointments.value
    .filter(a => !upcomingAppointments.value.includes(a))
    .sort((a, b) => b.date.localeCompare(a.date))
)

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function statusColor(status: AppointmentStatus) {
  const map = {
    pending: 'warning',
    confirmed: 'success',
    in_progress: 'primary',
    completed: 'default',
    cancelled: 'error',
    no_show: 'warning',
  } as const
  return map[status]
}

function statusLabel(status: AppointmentStatus) {
  const map = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    in_progress: 'Em andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    no_show: 'Não compareceu',
  } as const
  return map[status]
}
</script>

<style scoped>
.section-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}

.appointments-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
}
</style>
