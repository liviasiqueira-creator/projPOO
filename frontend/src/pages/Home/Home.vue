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
          v-if="!hasBarbershop"
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

    <v-row v-if="filteredBarbershops.length > 0">
      <v-col
        v-for="shop in filteredBarbershops"
        :key="shop.name"
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
        v-if="!hasBarbershop"
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import BarberShopCard from '../../components/BarberShopCard'

interface Address {
  street: string
  number: string
  neighborhood?: string
  city: string
}

interface BarberShop {
  id: number | string
  name: string
  phone: string
  address: Address
  photoUrl?: string
  isOpen?: boolean
}

const route = useRoute()
const search = ref('')

// TODO: buscar do estado de autenticação
const hasBarbershop = false

const pageTitle = computed(() => String(route.meta.title ?? 'Barbearias'))

const barbershops: BarberShop[] = [
  {
    id: 1,
    name: 'Barbearia do João',
    phone: '(11) 98765-4321',
    isOpen: true,
    address: { street: 'Rua das Flores', number: '142', neighborhood: 'Centro', city: 'São Paulo' },
  },
  {
    id: 2,
    name: 'Corte & Estilo Premium',
    phone: '(11) 91234-5678',
    isOpen: true,
    address: { street: 'Av. Paulista', number: '900', neighborhood: 'Bela Vista', city: 'São Paulo' },
  },
  {
    id: 3,
    name: 'Black Label Barber',
    phone: '(11) 94567-8901',
    isOpen: false,
    address: { street: 'Rua Augusta', number: '55', neighborhood: 'Consolação', city: 'São Paulo' },
  },
  {
    id: 4,
    name: 'Navalha & Co.',
    phone: '(11) 93210-9876',
    isOpen: true,
    address: { street: 'Rua Oscar Freire', number: '310', neighborhood: 'Jardins', city: 'São Paulo' },
  },
]

const filteredBarbershops = computed(() => {
  const term = search.value.toLowerCase().trim()
  if (!term) return barbershops
  return barbershops.filter(shop =>
    shop.name.toLowerCase().includes(term) ||
    shop.address.city.toLowerCase().includes(term) ||
    shop.address.neighborhood?.toLowerCase().includes(term)
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