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

    <v-row>
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="0" class="profile-card">
          <div class="profile-card__image">
            <v-img
              v-if="barbershop.photoUrl"
              :src="barbershop.photoUrl"
              :alt="`Foto da ${barbershop.name}`"
              height="200"
              cover
            />
            <div v-else class="profile-card__image-placeholder">
              <v-icon icon="mdi-scissors-cutting" size="48" color="primary" />
            </div>
          </div>

          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-1">
              <h1 class="text-h6 font-weight-medium">{{ barbershop.name }}</h1>
              <v-chip
                size="small"
                variant="flat"
                color="surface"
              >
                <span :class="barbershop.isOpen ? 'text-open' : 'text-closed'">
                  {{ barbershop.isOpen ? 'Aberto' : 'Fechado' }}
                </span>
              </v-chip>
            </div>

            <v-divider class="my-4" />

            <div class="profile-card__info">
              <div class="profile-card__info-row">
                <v-icon icon="mdi-phone-outline" size="16" color="primary" />
                <span class="text-body-2 text-medium-emphasis">{{ barbershop.phone }}</span>
              </div>
              <div class="profile-card__info-row">
                <v-icon icon="mdi-map-marker-outline" size="16" color="primary" />
                <span class="text-body-2 text-medium-emphasis">{{ formattedAddress }}</span>
              </div>
              <div class="profile-card__info-row">
                <v-icon icon="mdi-clock-outline" size="16" color="primary" />
                <span class="text-body-2 text-medium-emphasis">{{ barbershop.hours }}</span>
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
        <v-row>
          <v-col
            v-for="service in barbershop.services"
            :key="service.name"
            cols="12"
            sm="6"
          >
            <v-card rounded="lg" elevation="0" class="service-card">
              <v-card-text class="pa-4">
                <div class="d-flex align-start justify-space-between">
                  <div>
                    <p class="text-body-2 font-weight-medium mb-1">{{ service.name }}</p>
                    <p class="text-caption text-medium-emphasis">{{ service.duration }}</p>
                  </div>
                  <span class="service-card__price">R$ {{ service.price }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

interface Service {
  name: string
  duration: string
  price: number
}

interface Barbershop {
  id: number | string
  name: string
  phone: string
  hours: string
  isOpen: boolean
  photoUrl?: string
  address: {
    street: string
    number: string
    neighborhood?: string
    city: string
  }
  services: Service[]
}

// TODO: substituir por chamada à API usando route.params.id
const barbershop: Barbershop = {
  id: String(route.params.id ?? ''),
  name: 'Barbearia do João',
  phone: '(11) 98765-4321',
  hours: 'Seg–Sáb, 09h às 20h',
  isOpen: true,
  address: {
    street: 'Rua das Flores',
    number: '142',
    neighborhood: 'Centro',
    city: 'São Paulo',
  },
  services: [
    { name: 'Corte', duration: '30 min', price: 45 },
    { name: 'Barba', duration: '20 min', price: 35 },
    { name: 'Corte + Barba', duration: '45 min', price: 75 },
    { name: 'Sobrancelha', duration: '15 min', price: 20 },
  ],
}

const formattedAddress = computed(() => {
  const { street, number, neighborhood, city } = barbershop.address
  return [street + ', ' + number, neighborhood, city].filter(Boolean).join(' — ')
})

const openScheduling = () => {
  router.push(`/barbershop/${route.params.id}/schedule`)
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

.text-open {
  color: #2E7D32;
}

.text-closed {
  color: rgb(var(--v-theme-secondary));
}
</style>