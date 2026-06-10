<template>
  <v-container class="pa-8">
    <h1 class="text-h4 font-weight-bold mb-2">{{ pageTitle }}</h1>
    <p class="text-body-1 text-medium-emphasis">
      Paginas
    </p>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => String(route.meta.title ?? 'Página'))
</script>
