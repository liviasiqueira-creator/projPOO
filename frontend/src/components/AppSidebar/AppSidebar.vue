<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const ownerItems = [
  { title: 'Agendamentos', icon: 'mdi-calendar-clock-outline', to: '/dashboard/appointments' },
  { title: 'Promoções', icon: 'mdi-tag-outline', to: '/dashboard/promotions' },
  { title: 'Minha barbearia', icon: 'mdi-store-outline', to: '/dashboard/barbershop' },
]

const generalItems = [
  { title: 'Explorar', icon: 'mdi-grid-large', to: '/home' },
]

const clientItems = [
  { title: 'Meus agendamentos', icon: 'mdi-calendar-outline', to: '/appointments' },
  { title: 'Explorar barbearias', icon: 'mdi-grid-large', to: '/home' },
]

const hasBarbershop = true

const activePath = computed(() => route.path)
</script>

<template>
  <v-navigation-drawer
    permanent
    width="220"
    class="app-sidebar"
    elevation="0"
  >
    <div class="app-sidebar__brand px-5 pt-5 pb-4">
      <p class="app-sidebar__logo"> Blade </p>
      <p class="app-sidebar__sub text-caption">
        {{ hasBarbershop ? 'Painel da barbearia' : 'Área do cliente' }}
      </p>
    </div>

    <v-divider class="app-sidebar__divider" />

    <template v-if="hasBarbershop">
      <p class="app-sidebar__section-label px-5 pt-4 pb-1">Gestão</p>
      <v-list class="px-3 pt-0" nav density="comfortable">
        <v-list-item
          v-for="item in ownerItems"
          :key="item.to"
          :to="item.to"
          :active="activePath === item.to"
          rounded="lg"
          class="mb-1"
        >
          <template #prepend>
            <v-icon :icon="item.icon" size="17" />
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <p class="app-sidebar__section-label px-5 pt-2 pb-1">Geral</p>
      <v-list class="px-3 pt-0" nav density="comfortable">
        <v-list-item
          v-for="item in generalItems"
          :key="item.to"
          :to="item.to"
          :active="activePath === item.to"
          rounded="lg"
          class="mb-1"
        >
          <template #prepend>
            <v-icon :icon="item.icon" size="17" />
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </template>

    <template v-else>
      <p class="app-sidebar__section-label px-5 pt-4 pb-1">Menu</p>
      <v-list class="px-3 pt-0" nav density="comfortable">
        <v-list-item
          v-for="item in clientItems"
          :key="item.to"
          :to="item.to"
          :active="activePath === item.to"
          rounded="lg"
          class="mb-1"
        >
          <template #prepend>
            <v-icon :icon="item.icon" size="17" />
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </template>

    <template #append>
      <v-divider class="app-sidebar__divider" />
      <div class="app-sidebar__footer pa-3">
          <v-btn
            icon="mdi-logout"
            size="x-small"
            variant="text"
            color="secondary"
            aria-label="Sair"
          />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.app-sidebar {
  background: #111111 !important;
  border-right: 0.5px solid rgba(255, 255, 255, 0.08) !important;
}

.app-sidebar__brand {
  line-height: 1;
}

.app-sidebar__logo {
  color: #C9A84C;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0.06em;
  margin: 0;
}

.app-sidebar__sub {
  color: #555555;
  margin: 4px 0 0;
  font-size: 11px;
}

.app-sidebar__divider {
  border-color: rgba(255, 255, 255, 0.07) !important;
}

.app-sidebar__section-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #555555;
  margin: 0;
}

.app-sidebar__footer {
  padding: 12px;
}

.app-sidebar__avatar-text {
  font-size: 12px;
  font-weight: 500;
  color: #111111;
}

.app-sidebar__role {
  color: #555555;
}

:deep(.v-list-item-title) {
  font-size: 13px;
  color: #888888;
}

:deep(.v-list-item__prepend .v-icon) {
  color: #555555;
}

:deep(.v-list-item--active .v-list-item-title) {
  color: #C9A84C;
}

:deep(.v-list-item--active .v-icon) {
  color: #C9A84C;
}

:deep(.v-list-item--active) {
  background: #1F1F1F !important;
}

:deep(.v-list-item:not(.v-list-item--active):hover) {
  background: #1A1A1A !important;
}
</style>