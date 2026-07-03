<template>
  <v-container class="pa-6">
    <div class="appointments-page">
      <div class="appointments-header">
        <div>
          <h1 class="text-h5 font-weight-medium">Agendamentos</h1>
          <p class="text-body-2 text-medium-emphasis mt-1">
            {{ monthAppointments.length }} agendamento{{ monthAppointments.length !== 1 ? 's' : '' }} este mês
          </p>
        </div>
      </div>

      <v-row v-if="loading">
        <v-col cols="12" class="d-flex justify-center pa-10">
          <v-progress-circular indeterminate color="primary" />
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col cols="12" md="5" lg="4">
          <v-card rounded="lg" elevation="0" border>
            <v-date-picker
              v-model="selectedDate"
              title=""
              hide-actions
              color="primary"
              show-adjacent-months
              width="100%"
            />
          </v-card>
        </v-col>

        <v-col cols="12" md="7" lg="8">
          <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="text-h6 font-weight-medium">{{ selectedDateLabel }}</h2>
            <v-chip
              v-if="selectedDayAppointments.length > 0"
              color="primary"
              size="small"
              variant="tonal"
            >
              {{ selectedDayAppointments.length }} horário{{ selectedDayAppointments.length !== 1 ? 's' : '' }}
            </v-chip>
          </div>

          <div v-if="selectedDayAppointments.length > 0">
            <v-card
              v-for="appt in selectedDayAppointments"
              :key="appt.id"
              class="mb-3"
              rounded="lg"
              elevation="0"
              border
            >
              <v-card-text class="d-flex align-center pa-4" style="gap: 16px;">
                <div class="appointment-time">
                  <span class="text-h6 font-weight-bold">{{ appt.time }}</span>
                </div>

                <v-divider vertical class="mx-1" style="height: 40px; align-self: center;" />

                <v-avatar color="primary" variant="tonal" size="40">
                  <span class="text-body-1 font-weight-medium">{{ appt.clientName[0] }}</span>
                </v-avatar>

                <div style="flex: 1;">
                  <p class="text-body-1 font-weight-medium">{{ appt.clientName }}</p>
                  <p class="text-body-2 text-medium-emphasis">{{ appt.service }} · {{ appt.duration }}</p>
                </div>

                <v-chip :color="statusColor(appt.status)" size="small" variant="tonal">
                  {{ statusLabel(appt.status) }}
                </v-chip>
              </v-card-text>
            </v-card>
          </div>

          <div v-else class="appointments-empty">
            <v-icon icon="mdi-calendar-blank-outline" size="48" color="primary" class="mb-4" />
            <p class="text-body-1 font-weight-medium">Nenhum agendamento</p>
            <p class="text-body-2 text-medium-emphasis mt-1">Não há agendamentos para este dia.</p>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getMe } from '../../services/auth'
import { getUser } from '../../services/users'
import { listServices } from '../../services/barberShop'
import { listAppointments, type Appointment as RawAppointment, type AppointmentStatus } from '../../services/scheduling'

interface Appointment {
  id: string
  date: string
  time: string
  clientName: string
  service: string
  duration: string
  status: AppointmentStatus
}

const loading = ref(true)
const appointments = ref<Appointment[]>([])

async function enrich(raw: RawAppointment[]): Promise<Appointment[]> {
  const clientIds = [...new Set(raw.map((a) => a.clientUserId))]
  const barbershopIds = [...new Set(raw.map((a) => a.barbershopId))]

  const [clientEntries, serviceEntries] = await Promise.all([
    Promise.all(clientIds.map(async (id) => [id, await getUser(id)] as const)),
    Promise.all(barbershopIds.map(async (id) => [id, await listServices(id)] as const)),
  ])
  const clientsById = new Map(clientEntries)
  const servicesByBarbershop = new Map(serviceEntries)

  return raw.map((a) => {
    const scheduledAt = new Date(a.scheduledAt)
    const service = servicesByBarbershop.get(a.barbershopId)?.find((s) => s.id === a.serviceId)
    return {
      id: a.id,
      clientName: clientsById.get(a.clientUserId)?.name ?? 'Cliente',
      service: service?.name ?? 'Serviço',
      duration: `${a.durationMinutes} min`,
      date: `${scheduledAt.getUTCFullYear()}-${String(scheduledAt.getUTCMonth() + 1).padStart(2, '0')}-${String(scheduledAt.getUTCDate()).padStart(2, '0')}`,
      time: `${String(scheduledAt.getUTCHours()).padStart(2, '0')}:${String(scheduledAt.getUTCMinutes()).padStart(2, '0')}`,
      status: a.status,
    }
  })
}

onMounted(async () => {
  try {
    const me = await getMe()
    const raw = await listAppointments({ barberUserId: me.id })
    appointments.value = await enrich(raw)
  } finally {
    loading.value = false
  }
})

const selectedDate = ref<Date>(new Date())

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const monthAppointments = computed(() => {
  const d = selectedDate.value
  const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  return appointments.value.filter(a => a.date.startsWith(prefix))
})

const selectedDayAppointments = computed(() =>
  appointments.value
    .filter(a => a.date === toISO(selectedDate.value))
    .sort((a, b) => a.time.localeCompare(b.time))
)

const selectedDateLabel = computed(() => {
  const d = selectedDate.value
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
})

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
.appointments-page {
  width: 100%;
  max-width: 1100px;
  align-self: flex-start;
}

.appointments-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.appointment-time {
  min-width: 52px;
  text-align: center;
}

.appointments-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 24px;
}
</style>
