<template>
  <PageWrapper>
    <v-card rounded="lg" elevation="0" class="create-card pa-6" width="100%" max-width="480">
      <AuthForm mode="register" />
    </v-card>
  </PageWrapper>
</template>

<script setup lang="ts">
import PageWrapper from '../../components/PageWrapper'
import AuthForm from '../../components/AuthForm'

defineOptions({ name: 'CreateClientPage' })
</script>

<style scoped>
.create-card {
  border: 1px solid rgb(var(--v-theme-outline));
}
</style>
