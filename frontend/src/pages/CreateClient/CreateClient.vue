<template>
  <PageWrapper>
    <v-card rounded="lg" elevation="0" class="create-card pa-6" width="100%" max-width="480">
      <div class="mb-6">
        <h1 class="text-h5 font-weight-medium">Criar conta</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Preencha os dados para se cadastrar.</p>
      </div>

      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="form.email"
          label="E-mail"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          rounded="lg"
          :rules="rules.email"
          class="mb-4"
        />

        <v-text-field
          v-model="form.password"
          label="Senha"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          variant="outlined"
          rounded="lg"
          :rules="rules.password"
          class="mb-4"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-text-field
          v-model="form.confirmPassword"
          label="Confirmar senha"
          :type="showConfirm ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-check-outline"
          :append-inner-icon="showConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          variant="outlined"
          rounded="lg"
          :rules="rules.confirmPassword"
          class="mb-6"
          @click:append-inner="showConfirm = !showConfirm"
        />

        <v-btn
          type="submit"
          block
          color="primary"
          variant="flat"
          rounded="lg"
          size="large"
          :loading="loading"
          class="text-none"
        >
          Criar conta
        </v-btn>
      </v-form>

      <div class="text-center mt-5">
        <span class="text-body-2 text-medium-emphasis">Já tem uma conta?</span>
        <v-btn variant="text" color="primary" class="text-none" to="/login">
          Entrar
        </v-btn>
      </div>
    </v-card>
  </PageWrapper>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import PageWrapper from '../../components/PageWrapper'

defineOptions({ name: 'CreateClientPage' })

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

const rules = {
  email: [
    (v: string) => !!v || 'E-mail obrigatório',
    (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
  ],
  password: [
    (v: string) => !!v || 'Senha obrigatória',
    (v: string) => v.length >= 6 || 'Mínimo de 6 caracteres',
  ],
  confirmPassword: [
    (v: string) => !!v || 'Confirmação obrigatória',
    (v: string) => v === form.password || 'As senhas não coincidem',
  ],
}

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  setTimeout(() => {
    loading.value = false
    router.push('/home')
  }, 700)
}
</script>

<style scoped>
.create-card {
  border: 1px solid rgb(var(--v-theme-outline));
}
</style>