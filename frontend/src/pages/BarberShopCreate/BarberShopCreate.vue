<template>
  <PageWrapper>
    <v-card rounded="lg" elevation="0" class="create-card pa-6" width="100%" max-width="600">
      <div class="mb-6">
        <h1 class="text-h5 font-weight-medium">Cadastrar barbearia</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Preencha as informações do seu estabelecimento.</p>
      </div>

      <v-form ref="formRef" @submit.prevent="handleSubmit">

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

        <v-file-input
          v-model="form.photo"
          label="Foto da barbearia"
          prepend-icon=""
          prepend-inner-icon="mdi-image-outline"
          variant="outlined"
          rounded="lg"
          accept="image/*"
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

        <p class="section-label mb-3 mt-2">Horário de funcionamento</p>

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

        <p class="section-label mb-3">Serviços oferecidos</p>

        <v-row dense class="mb-6">
          <v-col
            v-for="service in serviceOptions"
            :key="service.value"
            cols="6"
            sm="4"
          >
            <v-checkbox
              v-model="form.services"
              :label="service.label"
              :value="service.value"
              color="primary"
              density="comfortable"
              hide-details
            />
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
          class="text-none"
        >
          Cadastrar barbearia
        </v-btn>
      </v-form>
    </v-card>
  </PageWrapper>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import PageWrapper from '../../components/PageWrapper'

defineOptions({ name: 'CreateBarbershopPage' })

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const serviceOptions = [
  { label: 'Corte', value: 'haircut' },
  { label: 'Barba', value: 'beard' },
  { label: 'Sobrancelha', value: 'eyebrow' },
]

const form = reactive({
  name: '',
  phone: '',
  photo: null as File | null,
  address: {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
  },
  openTime: '',
  closeTime: '',
  services: [] as string[],
})

const required = [(v: string) => !!v || 'Campo obrigatório']

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  // TODO: chamar API de cadastro de barbearia
  setTimeout(() => {
    loading.value = false
    router.push('/dashboard/barbershop')
  }, 700)
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