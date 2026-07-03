<template>
  <PageWrapper>
    <v-card rounded="lg" elevation="0" class="create-card pa-6" width="100%" max-width="920">
      <div class="mb-6">
        <h1 class="text-h5 font-weight-medium">Cadastrar barbearia</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Preencha as informações do seu estabelecimento.</p>
      </div>

      <v-form ref="formRef" @submit.prevent="handleSubmit">

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
          <v-col cols="12" md="6">
            <p class="section-label mb-3">Informações básicas</p>

            <v-text-field
              v-model="form.name"
              label="Nome da barbearia"
              prepend-inner-icon="mdi-store-outline"
              variant="outlined"
              rounded="lg"
              :rules="required"
              class="mb-4"
            />

            <v-text-field
              v-model="form.phone"
              label="Telefone"
              prepend-inner-icon="mdi-phone-outline"
              variant="outlined"
              rounded="lg"
              :rules="required"
              class="mb-4"
            />

            <v-text-field
              v-model="form.logoUrl"
              label="URL da foto"
              placeholder="https://..."
              prepend-inner-icon="mdi-image-outline"
              variant="outlined"
              rounded="lg"
              class="mb-6"
            />

            <p class="section-label mb-3">Endereço</p>

            <v-row dense>
              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="form.address.street"
                  label="Logradouro"
                  variant="outlined"
                  rounded="lg"
                  :rules="required"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.address.number"
                  label="Número"
                  variant="outlined"
                  rounded="lg"
                  :rules="required"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.address.neighborhood"
                  label="Bairro"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.address.city"
                  label="Cidade"
                  variant="outlined"
                  rounded="lg"
                  :rules="required"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" md="6">
            <p class="section-label mb-3">Horário de funcionamento</p>

            <p class="text-body-2 text-medium-emphasis mb-2">Dias de funcionamento</p>
            <div class="d-flex flex-wrap mb-4" style="gap: 6px;">
              <v-chip
                v-for="day in dayOptions"
                :key="day.value"
                :color="form.workDays.includes(day.value) ? 'primary' : undefined"
                :variant="form.workDays.includes(day.value) ? 'flat' : 'outlined'"
                size="small"
                style="cursor: pointer;"
                @click="toggleWorkDay(day.value)"
              >
                {{ day.label }}
              </v-chip>
            </div>

            <v-row dense class="mb-2">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.openTime"
                  label="Hora de abertura"
                  type="time"
                  prepend-inner-icon="mdi-clock-outline"
                  variant="outlined"
                  rounded="lg"
                  :rules="required"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.closeTime"
                  label="Hora de fechamento"
                  type="time"
                  prepend-inner-icon="mdi-clock-check-outline"
                  variant="outlined"
                  rounded="lg"
                  :rules="required"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-btn
          type="submit"
          block
          color="primary"
          variant="flat"
          rounded="lg"
          size="large"
          :loading="loading"
          class="text-none mt-4"
        >
          Cadastrar barbearia
        </v-btn>
      </v-form>
    </v-card>
  </PageWrapper>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import axios from 'axios'
import PageWrapper from '../../components/PageWrapper'
import { createBarbershop, hireBarber } from '../../services/barberShop'
import { setBarberAvailability, type SetBarberAvailabilityPayload } from '../../services/scheduling'
import { getMe } from '../../services/auth'

defineOptions({ name: 'CreateBarbershopPage' })

const formRef = ref()
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const dayOptions = [
  { label: 'Seg', value: 'monday' },
  { label: 'Ter', value: 'tuesday' },
  { label: 'Qua', value: 'wednesday' },
  { label: 'Qui', value: 'thursday' },
  { label: 'Sex', value: 'friday' },
  { label: 'Sáb', value: 'saturday' },
  { label: 'Dom', value: 'sunday' },
]

const weekdayByDay: Record<string, SetBarberAvailabilityPayload['weekday']> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const form = reactive({
  name: '',
  phone: '',
  logoUrl: '',
  address: {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
  },
  workDays: [] as string[],
  openTime: '',
  closeTime: '',
})

function toggleWorkDay(day: string) {
  const idx = form.workDays.indexOf(day)
  if (idx === -1) form.workDays.push(day)
  else form.workDays.splice(idx, 1)
}

const required = [(v: string) => !!v || 'Campo obrigatório']

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = null

  try {
    // Serviços são fixos (Corte, Barba, Sobrancelha) e criados automaticamente pelo back.
    const barbershop = await createBarbershop({
      name: form.name,
      phone: form.phone,
      address: [form.address.street, form.address.number, form.address.neighborhood]
        .filter(Boolean)
        .join(', '),
      city: form.address.city,
      ...(form.logoUrl.trim() && { logoUrl: form.logoUrl.trim() }),
    })

    // Criar a barbearia promove o usuário para "barber" no back, mas não cria vínculo
    // nem disponibilidade automaticamente — fazemos isso aqui com os dados já preenchidos no form.
    const me = await getMe()
    await hireBarber(barbershop.id, { barberUserId: me.id, isExclusive: true })

    if (form.openTime && form.closeTime) {
      await Promise.all(
        form.workDays.map((day) =>
          setBarberAvailability(barbershop.id, me.id, {
            weekday: weekdayByDay[day]!,
            startTime: form.openTime,
            endTime: form.closeTime,
          }),
        ),
      )
    }

    // Recarrega a página inteira pra sidebar (montada uma única vez no Layout) buscar o novo role via /auth/me.
    window.location.href = '/dashboard/barbershop'
  } catch (err: unknown) {
    const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined
    errorMessage.value = message ?? 'Não foi possível cadastrar a barbearia. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-card {
  border: 1px solid rgb(var(--v-theme-outline));
}

.section-label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgb(var(--v-theme-secondary));
}
</style>