<template>
  <v-container class="pa-6">
    <v-btn
      variant="text"
      color="secondary"
      prepend-icon="mdi-arrow-left"
      class="text-none mb-4 px-0"
      to="/home"
    >
      Voltar
    </v-btn>

    <v-row v-if="loading">
      <v-col cols="12" class="d-flex justify-center pa-10">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-alert v-else-if="notFound" type="error" variant="tonal" rounded="lg">
      Barbearia não encontrada.
    </v-alert>

    <v-row v-else-if="barbershop">
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="0" class="profile-card">
          <div class="profile-card__image">
            <v-img
              v-if="barbershop.logoUrl"
              :src="barbershop.logoUrl"
              :alt="`Foto da ${barbershop.name}`"
              height="200"
              cover
            />
            <div v-else class="profile-card__image-placeholder">
              <v-icon icon="mdi-scissors-cutting" size="48" color="primary" />
            </div>
          </div>

          <v-card-text class="pa-5">
            <h1 class="text-h6 font-weight-medium mb-1">{{ barbershop.name }}</h1>

            <v-divider class="my-4" />

            <div class="profile-card__info">
              <div v-if="barbershop.phone" class="profile-card__info-row">
                <v-icon icon="mdi-phone-outline" size="16" color="primary" />
                <span class="text-body-2 text-medium-emphasis">{{ barbershop.phone }}</span>
              </div>
              <div v-if="formattedAddress" class="profile-card__info-row">
                <v-icon icon="mdi-map-marker-outline" size="16" color="primary" />
                <span class="text-body-2 text-medium-emphasis">{{ formattedAddress }}</span>
              </div>
            </div>

            <v-btn
              block
              color="primary"
              variant="flat"
              rounded="lg"
              size="large"
              prepend-icon="mdi-calendar-plus-outline"
              class="text-none mt-6"
              @click="openScheduling"
            >
              Agendar horário
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <h2 class="text-body-1 font-weight-medium mb-3">Serviços</h2>
        <v-row v-if="services.length > 0">
          <v-col
            v-for="service in services"
            :key="service.id"
            cols="12"
            sm="6"
          >
            <v-card rounded="lg" elevation="0" class="service-card">
              <v-card-text class="pa-4">
                <div class="d-flex align-start justify-space-between">
                  <div>
                    <p class="text-body-2 font-weight-medium mb-1">{{ service.name }}</p>
                    <p class="text-caption text-medium-emphasis">{{ service.durationMinutes }} min</p>
                  </div>
                  <span class="service-card__price">R$ {{ service.basePrice }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <p v-else class="text-body-2 text-medium-emphasis">Nenhum serviço cadastrado ainda.</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBarbershop, listServices, type BarbershopDetail, type Service } from '../../services/barberShop'

const route = useRoute()
const router = useRouter()
const barbershopId = String(route.params.id ?? '')

const loading = ref(true)
const notFound = ref(false)
const barbershop = ref<BarbershopDetail | null>(null)
const services = ref<Service[]>([])

onMounted(async () => {
  try {
    const [shop, shopServices] = await Promise.all([
      getBarbershop(barbershopId),
      listServices(barbershopId),
    ])
    barbershop.value = shop
    services.value = shopServices
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

const openScheduling = () => {
  router.push(`/barbershop/${barbershopId}/schedule`)
}
</script>

<style scoped>
.profile-card {
  border: 1px solid rgb(var(--v-theme-outline));
}

.profile-card__image-placeholder {
  height: 200px;
  background: rgb(var(--v-theme-surface-variant));
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-card__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile-card__info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.profile-card__info-row .v-icon {
  margin-top: 1px;
  flex-shrink: 0;
}

.service-card {
  border: 1px solid rgb(var(--v-theme-outline));
}

.service-card__price {
  font-size: 16px;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
}
</style>