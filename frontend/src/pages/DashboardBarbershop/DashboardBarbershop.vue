<template>
  <v-container class="pa-6">
    <div class="page-header mb-6">
      <div>
        <h1 class="text-h5 font-weight-medium">Minha barbearia</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Gerencie as informações e serviços da sua barbearia
        </p>
      </div>
    </div>

    <v-row v-if="loading">
      <v-col cols="12" class="d-flex justify-center pa-10">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-alert v-else-if="notFound" type="error" variant="tonal" rounded="lg">
      Você ainda não tem uma barbearia cadastrada.
    </v-alert>

    <template v-else>
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
                <p class="text-body-2 mb-0">{{ barbershop?.name }}</p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="info-row">
              <v-icon icon="mdi-phone-outline" size="16" color="primary" />
              <div>
                <p class="text-caption text-medium-emphasis mb-0">Telefone</p>
                <p class="text-body-2 mb-0">{{ barbershop?.phone || '—' }}</p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="info-row">
              <v-icon icon="mdi-map-marker-outline" size="16" color="primary" />
              <div>
                <p class="text-caption text-medium-emphasis mb-0">Endereço</p>
                <p class="text-body-2 mb-0">{{ formattedAddress || '—' }}</p>
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
              <span class="service-price">R$ {{ service.basePrice }}</span>
            </div>
            <p class="text-caption text-medium-emphasis mb-3">
              <v-icon icon="mdi-clock-outline" size="13" class="mr-1" />
              {{ service.durationMinutes }} min
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
          <v-text-field
            v-model="infoForm.address"
            label="Endereço"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model="infoForm.city"
            label="Cidade"
            variant="outlined"
            rounded="lg"
            density="comfortable"
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
            v-model.number="serviceForm.durationMinutes"
            label="Duração (minutos)"
            type="number"
            placeholder="Ex: 30"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model.number="serviceForm.basePrice"
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
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { getMyBarbershop, listServices, type BarbershopDetail, type Service } from '../../services/barberShop'

const loading = ref(true)
const notFound = ref(false)
const barbershop = ref<BarbershopDetail | null>(null)
const services = ref<Service[]>([])

onMounted(async () => {
  try {
    const shop = await getMyBarbershop()
    barbershop.value = shop
    services.value = await listServices(shop.id)
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

const formattedAddress = computed(() => {
  if (!barbershop.value) return ''
  return [barbershop.value.address, barbershop.value.city].filter(Boolean).join(' — ')
})

// --- Info dialog ---
// Edição ainda não persiste no back (falta PUT /barbershops/:id) — só reflete localmente.
const infoDialog = ref(false)
const infoForm = reactive({ name: '', phone: '', address: '', city: '' })

const infoFormValid = computed(() => infoForm.name.trim() && infoForm.city.trim())

function openEditInfo() {
  if (!barbershop.value) return
  Object.assign(infoForm, {
    name: barbershop.value.name,
    phone: barbershop.value.phone ?? '',
    address: barbershop.value.address ?? '',
    city: barbershop.value.city ?? '',
  })
  infoDialog.value = true
}

function saveInfo() {
  if (!barbershop.value) return
  Object.assign(barbershop.value, {
    name: infoForm.name,
    phone: infoForm.phone,
    address: infoForm.address,
    city: infoForm.city,
  })
  infoDialog.value = false
}

// --- Service dialog ---
// Ainda não persiste no back (falta PUT/DELETE de serviço) — só reflete localmente.
const serviceDialog = ref(false)
const editingService = ref<Service | null>(null)
const serviceForm = reactive({ name: '', durationMinutes: 0, basePrice: 0 })

const serviceFormValid = computed(() =>
  serviceForm.name.trim() && serviceForm.durationMinutes > 0 && serviceForm.basePrice > 0
)

function openServiceDialog(service?: Service) {
  editingService.value = service ?? null
  Object.assign(serviceForm, service
    ? { name: service.name, durationMinutes: service.durationMinutes, basePrice: service.basePrice }
    : { name: '', durationMinutes: 0, basePrice: 0 }
  )
  serviceDialog.value = true
}

function saveService() {
  if (editingService.value) {
    const idx = services.value.findIndex(s => s.id === editingService.value!.id)
    if (idx !== -1) {
      services.value[idx] = { ...editingService.value, ...serviceForm }
    }
  } else {
    services.value.push({ id: crypto.randomUUID(), ...serviceForm })
  }
  serviceDialog.value = false
}

function removeService(id: string) {
  services.value = services.value.filter(s => s.id !== id)
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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
