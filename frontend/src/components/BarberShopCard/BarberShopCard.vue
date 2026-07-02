<template>
  <v-card
    class="barber-card"
    rounded="lg"
    elevation="0"
    :ripple="false"
  >
    <div class="barber-card__image">
      <v-img
        v-if="barberShop.logoUrl"
        :src="barberShop.logoUrl"
        :alt="`Foto da ${barberShop.name}`"
        height="160"
        cover
      />
      <div v-else class="barber-card__image-placeholder">
        <v-icon icon="mdi-scissors-cutting" size="36" color="primary" />
      </div>
    </div>

    <v-card-text class="barber-card__body">
      <h3 class="barber-card__name text-truncate">{{ barberShop.name }}</h3>

      <div class="barber-card__info">
        <div v-if="formattedAddress" class="barber-card__info-row">
          <v-icon icon="mdi-map-marker-outline" size="15" color="primary" />
          <span class="barber-card__info-text">{{ formattedAddress }}</span>
        </div>
      </div>
    </v-card-text>

    <v-divider />

    <v-card-actions class="barber-card__footer">
      <v-btn
        variant="text"
        size="small"
        color="primary"
        class="text-none"
        :to="`/barbershop/${barberShop.id}`"
        append-icon="mdi-arrow-right"
      >
        Ver mais
      </v-btn>

      <v-spacer />

      <v-btn
        variant="text"
        size="small"
        class="text-none"
        color="secondary"
        icon="mdi-share-variant-outline"
        :aria-label="`Compartilhar ${barberShop.name}`"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface BarberShop {
  id: number | string
  name: string
  address?: string
  city?: string
  logoUrl?: string
}

const props = defineProps<{
  barberShop: BarberShop
}>()

const formattedAddress = computed(() => {
  return [props.barberShop.address, props.barberShop.city].filter(Boolean).join(' — ')
})
</script>

<style scoped>
.barber-card {
  border: 1px solid rgb(var(--v-theme-outline));
  transition: border-color 0.2s;
  cursor: pointer;
}

.barber-card:hover {
  border-color: rgb(var(--v-theme-primary) / 0.5);
}

.barber-card__image {
  position: relative;
}

.barber-card__image-placeholder {
  height: 160px;
  background: rgb(var(--v-theme-surface-variant));
  display: flex;
  align-items: center;
  justify-content: center;
}

.barber-card__body {
  padding: 14px 14px 10px;
}

.barber-card__name {
  font-size: 15px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 10px;
}

.barber-card__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.barber-card__info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.barber-card__info-row .v-icon {
  margin-top: 1px;
  flex-shrink: 0;
}

.barber-card__info-text {
  font-size: 12px;
  color: rgb(var(--v-theme-secondary));
  line-height: 1.4;
}

.barber-card__footer {
  padding: 6px 8px;
  min-height: 44px;
}
</style>