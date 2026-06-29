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

      <v-row>
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
import { ref, computed } from 'vue'

interface Appointment {
  id: number
  date: string
  time: string
  clientName: string
  service: string
  duration: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'done'
}

const appointments: Appointment[] = [
  { id: 1, date: '2026-06-28', time: '09:00', clientName: 'Carlos Silva', service: 'Corte', duration: '30 min', status: 'done' },
  { id: 2, date: '2026-06-28', time: '10:00', clientName: 'Rafael Mendes', service: 'Barba', duration: '20 min', status: 'done' },
  { id: 3, date: '2026-06-28', time: '11:30', clientName: 'Lucas Ferreira', service: 'Corte + Barba', duration: '45 min', status: 'confirmed' },
  { id: 4, date: '2026-06-28', time: '14:00', clientName: 'Pedro Oliveira', service: 'Sobrancelha', duration: '15 min', status: 'pending' },
  { id: 5, date: '2026-06-29', time: '09:30', clientName: 'Bruno Alves', service: 'Corte', duration: '30 min', status: 'confirmed' },
  { id: 6, date: '2026-06-29', time: '14:00', clientName: 'Diego Costa', service: 'Sobrancelha', duration: '15 min', status: 'confirmed' },
  { id: 7, date: '2026-06-30', time: '10:30', clientName: 'André Lima', service: 'Corte + Barba', duration: '45 min', status: 'confirmed' },
  { id: 8, date: '2026-06-30', time: '15:00', clientName: 'Felipe Santos', service: 'Barba', duration: '20 min', status: 'cancelled' },
  { id: 9, date: '2026-07-02', time: '11:00', clientName: 'Marcos Rocha', service: 'Corte', duration: '30 min', status: 'confirmed' },
  { id: 10, date: '2026-07-03', time: '09:00', clientName: 'Thiago Nunes', service: 'Corte + Barba', duration: '45 min', status: 'pending' },
]

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
  return appointments.filter(a => a.date.startsWith(prefix))
})

const selectedDayAppointments = computed(() =>
  appointments
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

function statusColor(status: Appointment['status']) {
  const map = { confirmed: 'success', pending: 'warning', cancelled: 'error', done: 'default' } as const
  return map[status]
}

function statusLabel(status: Appointment['status']) {
  const map = { confirmed: 'Confirmado', pending: 'Pendente', cancelled: 'Cancelado', done: 'Concluído' } as const
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
