<template>
  <v-container class="pa-6">
    <div class="page-header mb-6">
      <div>
        <h1 class="text-h5 font-weight-medium">Minha barbearia</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Gerencie as informações e serviços da sua barbearia
        </p>
      </div>
      <v-chip
        :color="barbershop.isOpen ? 'success' : 'default'"
        variant="flat"
        class="status-chip"
        @click="barbershop.isOpen = !barbershop.isOpen"
      >
        <v-icon :icon="barbershop.isOpen ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" size="15" class="mr-1" />
        {{ barbershop.isOpen ? 'Aberto agora' : 'Fechado agora' }}
      </v-chip>
    </div>

    <!-- Informações gerais -->
    <v-card rounded="lg" elevation="0" border class="mb-6">
      <v-card-text class="pa-5">
        <div class="d-flex align-center justify-space-between mb-4">
          <p class="text-body-1 font-weight-medium">Informações gerais</p>
          <v-btn
            variant="text"
            size="small"
            color="primary"
            class="text-none"
            prepend-icon="mdi-pencil-outline"
            @click="openEditInfo"
          >
            Editar
          </v-btn>
        </div>

        <v-row>
          <v-col cols="12" sm="6">
            <div class="info-row">
              <v-icon icon="mdi-storefront-outline" size="16" color="primary" />
              <div>
                <p class="text-caption text-medium-emphasis mb-0">Nome</p>
                <p class="text-body-2 mb-0">{{ barbershop.name }}</p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="info-row">
              <v-icon icon="mdi-phone-outline" size="16" color="primary" />
              <div>
                <p class="text-caption text-medium-emphasis mb-0">Telefone</p>
                <p class="text-body-2 mb-0">{{ barbershop.phone }}</p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="info-row">
              <v-icon icon="mdi-clock-outline" size="16" color="primary" />
              <div>
                <p class="text-caption text-medium-emphasis mb-0">Horário</p>
                <p class="text-body-2 mb-0">{{ formattedHours }}</p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="info-row">
              <v-icon icon="mdi-map-marker-outline" size="16" color="primary" />
              <div>
                <p class="text-caption text-medium-emphasis mb-0">Endereço</p>
                <p class="text-body-2 mb-0">{{ formattedAddress }}</p>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Serviços -->
    <div class="d-flex align-center justify-space-between mb-4">
      <p class="text-body-1 font-weight-medium">Serviços</p>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        size="small"
        prepend-icon="mdi-plus"
        class="text-none"
        @click="openServiceDialog()"
      >
        Novo serviço
      </v-btn>
    </div>

    <v-row v-if="services.length > 0">
      <v-col
        v-for="service in services"
        :key="service.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-start justify-space-between mb-2">
              <p class="text-body-2 font-weight-medium mb-0">{{ service.name }}</p>
              <span class="service-price">R$ {{ service.price }}</span>
            </div>
            <p class="text-caption text-medium-emphasis mb-3">
              <v-icon icon="mdi-clock-outline" size="13" class="mr-1" />
              {{ service.duration }}
            </p>
            <div class="d-flex" style="gap: 4px;">
              <v-btn
                variant="text"
                size="x-small"
                color="secondary"
                class="text-none"
                prepend-icon="mdi-pencil-outline"
                @click="openServiceDialog(service)"
              >
                Editar
              </v-btn>
              <v-btn
                variant="text"
                size="x-small"
                color="error"
                class="text-none"
                prepend-icon="mdi-delete-outline"
                @click="removeService(service.id)"
              >
                Remover
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div v-else class="services-empty">
      <v-icon icon="mdi-scissors-cutting" size="40" color="primary" class="mb-3" />
      <p class="text-body-2 font-weight-medium">Nenhum serviço cadastrado</p>
      <p class="text-caption text-medium-emphasis mt-1">
        Adicione os serviços que sua barbearia oferece.
      </p>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        prepend-icon="mdi-plus"
        class="text-none mt-4"
        size="small"
        @click="openServiceDialog()"
      >
        Novo serviço
      </v-btn>
    </div>

    <!-- Dialog: editar informações -->
    <v-dialog v-model="infoDialog" max-width="480" rounded="lg">
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-2">
          <span class="text-h6 font-weight-medium">Editar informações</span>
        </v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-text-field
            v-model="infoForm.name"
            label="Nome"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model="infoForm.phone"
            label="Telefone"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
            hide-details
          />
          <p class="text-caption text-medium-emphasis mb-2">Dias de funcionamento</p>
          <div class="d-flex flex-wrap mb-3" style="gap: 6px;">
            <v-chip
              v-for="day in DAY_OPTIONS"
              :key="day.value"
              :color="infoForm.workDays.includes(day.value) ? 'primary' : undefined"
              :variant="infoForm.workDays.includes(day.value) ? 'flat' : 'outlined'"
              size="small"
              style="cursor: pointer;"
              @click="toggleInfoDay(day.value)"
            >
              {{ day.label }}
            </v-chip>
          </div>
          <v-row class="mb-3">
            <v-col cols="6">
              <v-text-field
                v-model="infoForm.openTime"
                label="Abertura"
                type="time"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="infoForm.closeTime"
                label="Fechamento"
                type="time"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>
          <v-text-field
            v-model="infoForm.street"
            label="Rua"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
            hide-details
          />
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="infoForm.number"
                label="Número"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="8">
              <v-text-field
                v-model="infoForm.neighborhood"
                label="Bairro"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>
          <v-text-field
            v-model="infoForm.city"
            label="Cidade"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mt-3"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0" style="gap: 8px;">
          <v-btn variant="text" rounded="lg" class="text-none flex-1-1" @click="infoDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-none flex-1-1"
            :disabled="!infoFormValid"
            @click="saveInfo"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: serviço -->
    <v-dialog v-model="serviceDialog" max-width="400" rounded="lg">
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-2">
          <span class="text-h6 font-weight-medium">
            {{ editingService ? 'Editar serviço' : 'Novo serviço' }}
          </span>
        </v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-text-field
            v-model="serviceForm.name"
            label="Nome do serviço"
            placeholder="Ex: Corte"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model="serviceForm.duration"
            label="Duração"
            placeholder="Ex: 30 min"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model.number="serviceForm.price"
            label="Preço (R$)"
            type="number"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0" style="gap: 8px;">
          <v-btn variant="text" rounded="lg" class="text-none flex-1-1" @click="serviceDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-none flex-1-1"
            :disabled="!serviceFormValid"
            @click="saveService"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface Service {
  id: number
  name: string
  duration: string
  price: number
}

const DAY_OPTIONS = [
  { label: 'Seg', value: 'monday' },
  { label: 'Ter', value: 'tuesday' },
  { label: 'Qua', value: 'wednesday' },
  { label: 'Qui', value: 'thursday' },
  { label: 'Sex', value: 'friday' },
  { label: 'Sáb', value: 'saturday' },
  { label: 'Dom', value: 'sunday' },
]
const DAY_LABELS: Record<string, string> = Object.fromEntries(DAY_OPTIONS.map(d => [d.value, d.label]))

interface Barbershop {
  name: string
  phone: string
  openTime: string
  closeTime: string
  workDays: string[]
  isOpen: boolean
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
  }
}

// TODO: buscar do back — GET /barbershop/me
const barbershop = reactive<Barbershop>({
  name: 'Barbearia do João',
  phone: '(11) 98765-4321',
  openTime: '09:00',
  closeTime: '20:00',
  workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  isOpen: true,
  address: {
    street: 'Rua das Flores',
    number: '142',
    neighborhood: 'Centro',
    city: 'São Paulo',
  },
})

// TODO: buscar do back — GET /barbershop/me/services
const services = ref<Service[]>([
  { id: 1, name: 'Corte', duration: '30 min', price: 45 },
  { id: 2, name: 'Barba', duration: '20 min', price: 35 },
  { id: 3, name: 'Sobrancelha', duration: '15 min', price: 20 },
])

const formattedAddress = computed(() => {
  const { street, number, neighborhood, city } = barbershop.address
  return [street + ', ' + number, neighborhood, city].filter(Boolean).join(' — ')
})

const formattedHours = computed(() => {
  const days = barbershop.workDays.map(d => DAY_LABELS[d]).join(', ')
  return `${days} | ${barbershop.openTime} – ${barbershop.closeTime}`
})

// --- Info dialog ---
const infoDialog = ref(false)
const infoForm = reactive({
  name: '', phone: '', openTime: '', closeTime: '', workDays: [] as string[],
  street: '', number: '', neighborhood: '', city: '',
})

const infoFormValid = computed(() =>
  infoForm.name.trim() && infoForm.phone.trim() &&
  infoForm.openTime && infoForm.closeTime &&
  infoForm.workDays.length > 0 && infoForm.city.trim()
)

function toggleInfoDay(day: string) {
  const idx = infoForm.workDays.indexOf(day)
  if (idx === -1) infoForm.workDays.push(day)
  else infoForm.workDays.splice(idx, 1)
}

function openEditInfo() {
  Object.assign(infoForm, {
    name: barbershop.name,
    phone: barbershop.phone,
    openTime: barbershop.openTime,
    closeTime: barbershop.closeTime,
    workDays: [...barbershop.workDays],
    street: barbershop.address.street,
    number: barbershop.address.number,
    neighborhood: barbershop.address.neighborhood,
    city: barbershop.address.city,
  })
  infoDialog.value = true
}

function saveInfo() {
  // TODO: chamar back — PUT /barbershop/me
  Object.assign(barbershop, {
    name: infoForm.name,
    phone: infoForm.phone,
    openTime: infoForm.openTime,
    closeTime: infoForm.closeTime,
    workDays: [...infoForm.workDays],
    address: {
      street: infoForm.street,
      number: infoForm.number,
      neighborhood: infoForm.neighborhood,
      city: infoForm.city,
    },
  })
  infoDialog.value = false
}

// --- Service dialog ---
const serviceDialog = ref(false)
const editingService = ref<Service | null>(null)
const serviceForm = reactive({ name: '', duration: '', price: 0 })

const serviceFormValid = computed(() =>
  serviceForm.name.trim() && serviceForm.duration.trim() && serviceForm.price > 0
)

let nextServiceId = 4

function openServiceDialog(service?: Service) {
  editingService.value = service ?? null
  Object.assign(serviceForm, service
    ? { name: service.name, duration: service.duration, price: service.price }
    : { name: '', duration: '', price: 0 }
  )
  serviceDialog.value = true
}

function saveService() {
  if (editingService.value) {
    // TODO: chamar back — PUT /barbershop/me/services/:id
    const idx = services.value.findIndex(s => s.id === editingService.value!.id)
    if (idx !== -1) {
      services.value[idx] = { ...editingService.value, ...serviceForm }
    }
  } else {
    // TODO: chamar back — POST /barbershop/me/services
    services.value.push({ id: nextServiceId++, ...serviceForm })
  }
  serviceDialog.value = false
}

function removeService(id: number) {
  // TODO: chamar back — DELETE /barbershop/me/services/:id
  services.value = services.value.filter(s => s.id !== id)
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.status-chip {
  cursor: pointer;
  margin-top: 4px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.info-row .v-icon {
  margin-top: 14px;
  flex-shrink: 0;
}

.service-price {
  font-size: 15px;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  white-space: nowrap;
}

.services-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 24px;
}
</style>
