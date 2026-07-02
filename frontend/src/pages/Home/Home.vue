<template>
  <v-container class="pa-6">
    <div class="home-header mb-6">
      <div>
        <h1 class="text-h5 font-weight-medium">{{ pageTitle }}</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          {{ barbershopItems }} estabelecimento{{ barbershopItems !== 1 ? 's' : '' }} encontrado{{ barbershopItems !== 1 ? 's' : '' }}
        </p>
      </div>

      <div class="home-header__actions">
        <v-text-field
          v-model="search"
          placeholder="Buscar barbearia..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          rounded="lg"
          class="home-header__search"
        />

        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-plus"
          class="text-none"
          to="/barbershop/register"
        >
          Cadastrar barbearia
        </v-btn>
      </div>
    </div>

    <v-row v-if="loading">
      <v-col cols="12" class="d-flex justify-center pa-10">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="filteredBarbershops.length > 0">
      <v-col
        v-for="shop in filteredBarbershops"
        :key="shop.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <BarberShopCard :barber-shop="shop" />
      </v-col>
    </v-row>

    <div v-else class="home-empty">
      <v-icon icon="mdi-scissors-cutting" size="48" color="primary" class="mb-4" />
      <p class="text-body-1 font-weight-medium">Nenhuma barbearia encontrada</p>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Tente outro termo ou cadastre a primeira barbearia.
      </p>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        prepend-icon="mdi-plus"
        class="text-none mt-4"
        to="/barbershop/register"
      >
        Cadastrar barbearia
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BarberShopCard from '../../components/BarberShopCard'
import { listBarbershops, type Barbershop } from '../../services/barberShop'

const route = useRoute()
const search = ref('')
const loading = ref(false)
const barbershops = ref<Barbershop[]>([])

const pageTitle = computed(() => String(route.meta.title ?? 'Barbearias'))

async function fetchBarbershops() {
  loading.value = true
  try {
    barbershops.value = await listBarbershops()
  } finally {
    loading.value = false
  }
}

onMounted(fetchBarbershops)

const filteredBarbershops = computed(() => {
  const term = search.value.toLowerCase().trim()
  if (!term) return barbershops.value
  return barbershops.value.filter(shop =>
    shop.name.toLowerCase().includes(term) ||
    shop.city?.toLowerCase().includes(term) ||
    shop.address?.toLowerCase().includes(term)
  )
})

const barbershopItems = computed(() => filteredBarbershops.value.length)
</script>

<style scoped>
.home-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.home-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.home-header__search {
  width: 240px;
}

.home-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 24px;
}
</style>