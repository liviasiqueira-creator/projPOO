<template>
  <page-wrapper>
  <v-card class="bg-transparent w-50 px-2 form-card mx-auto" rounded="xl" elevation="0">
    <v-row class="fill-height">
      <v-col class="form-panel">
         <h1 style="color: var(--btn-accent-bg);"> Nome ou logo? </h1>
         <p> <b>Gerencie sua barbearia</b> ou agende seu horário com facilidade. </p>
         <div>
          <span class="form-panel__metric"> <span>{{ quantityBarberShop }}+</span><br> barbearias</span>
          <span class="form-panel__metric"> <span>{{ quantityScheduling }}+</span><br> agendamentos</span>
         </div>
      </v-col>
      <v-col>
        <login-form />
      </v-col>
    </v-row>
</v-card>
</page-wrapper>
</template>

<script setup lang="ts">
import LoginForm from '@/components/LoginForm';
import PageWrapper from '@/components/PageWrapper/PageWrapper.vue'

defineOptions({
  name: 'LoginPage',
})

const quantityBarberShop = 400; // tem que vir do backend
const quantityScheduling = 30; // tem que vir do backend
</script>

<style scoped>

p, h2, span {
  color: rgb(var(--v-theme-surface))
}

.form-panel {
  border-top-left-radius: 40px;
  border-bottom-left-radius: 40px;;
  min-height: 560px;
  padding: 2rem;
  background-color: var(--bg-dark);

  .form-panel__metric {
    color: var(--text-muted);
    font-size: 11px;
    
    span {
      color: var(--btn-accent-bg);
      font-size: 20px;
    }
  }

  div {
    position: absolute;
    bottom: 30px;
    left: 30px;
    display: flex;
    gap: 30px;
    justify-self: end;
  }
}
</style>
