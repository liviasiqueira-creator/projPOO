<template>
  <div class="layout-shell">
    <AppSidebar />
    <div class="layout-main">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '../../components/AppSidebar'
import { RouterView } from 'vue-router'

defineOptions({
  name: 'LayoutPage',
})
</script>

<style scoped>
.layout-shell {
  display: flex;
  min-height: 100dvh;
  background:
    radial-gradient(circle at 100% 0, rgb(var(--v-theme-primary) / 0.08), transparent 35%),
    rgb(var(--v-theme-background));
}

.layout-main {
  flex: 1;
}

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
