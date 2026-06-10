<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const items = [
  { title: 'Option 1', icon: 'mdi-view-dashboard-outline', to: '/option-1' },
  { title: 'Option 2', icon: 'mdi-calendar-outline', to: '/option-2' },
  { title: 'Option 3', icon: 'mdi-wallet-outline', to: '/option-3' },
  { title: 'Option 4', icon: 'mdi-history', to: '/option-4' },
  { title: 'Option 5', icon: 'mdi-cog-outline', to: '/option-5' },
]

const activePath = computed(() => route.path)
</script>

<template>
  <v-navigation-drawer
    permanent
    width="260"
    class="app-sidebar"
    elevation="0"
  >
    <div class="brand px-6 pt-6 pb-4">
      <p class="text-h6 font-weight-bold">The Gent's Ledger</p>
    </div>

    <v-list class="px-3" nav density="comfortable">
      <v-list-item
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :active="activePath === item.to"
        rounded="lg"
        class="mb-1"
      >
        <template #prepend>
          <v-icon :icon="item.icon" size="18" />
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <template #append>
      <div class="pa-3">
        <v-card class="profile-card" rounded="lg" elevation="0">
          <v-card-text class="d-flex align-center ga-3 py-3">
            <v-avatar size="32" color="primary" variant="flat">
              <span class="text-black text-caption font-weight-bold">A</span>
            </v-avatar>
            <div>
              <p class="text-body-2 mb-0">Arthur Shelby</p>
              <p class="text-caption text-medium-emphasis mb-0">Gold Member</p>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.app-sidebar {
  border-right: 1px solid rgb(var(--v-theme-primary) / 0.18);
  background:
    linear-gradient(
      180deg,
      rgb(var(--v-theme-background)) 0%,
      rgb(var(--v-theme-background)) 55%,
      rgb(var(--v-theme-brown-dark) / 0.18) 100%
    );
}

.brand {
  color: rgb(var(--v-theme-primary));
}

.profile-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-primary) / 0.18);
}

:deep(.v-list-item-title) {
  font-size: 0.92rem;
}

:deep(.v-list-item--active) {
  background: rgb(var(--v-theme-primary) / 0.2);
  color: rgb(var(--v-theme-primary));
}
</style>
