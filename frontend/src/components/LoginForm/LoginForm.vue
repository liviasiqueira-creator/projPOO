<template>
    <div class="mb-6">
    <h4>Bem-vindo de volta<br> <span class="text-title-small">
      Entre com a sua conta para continuar
    </span></h4>
  </div>

  <v-form @submit.prevent="handleLogin">
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
      rounded="lg"
    >
      {{ errorMessage }}
    </v-alert>

    <v-text-field
      v-model="email"
      label="E-mail"
      type="email"
      prepend-inner-icon="mdi-account-outline"
      variant="outlined"
      class="mb-4"
      rounded="lg"
    />

    <v-text-field
      v-model="password"
      label="Senha"
      :type="showPassword ? 'text' : 'password'"
      prepend-inner-icon="mdi-lock-outline"
      :append-inner-icon="
        showPassword
          ? 'mdi-eye-off-outline'
          : 'mdi-eye-outline'
      "
      @click:append-inner="showPassword = !showPassword"
      variant="outlined"
      class="mb-6"
      rounded="lg"
    />

    <v-btn
      type="submit"
      block
      size="large"
      color="primary"
      :loading="loading"
      class="rounded-lg"
    >
      Entrar
    </v-btn>
  </v-form>

  <div class="text-center mt-6 d-flex flex-column">
    <span class="text-medium-emphasis">
      Não tem uma conta?
    </span>
    <v-btn
      variant="text"
      color="secondary"
      class="text-none"
      to="/register"
    >
      Cadastre-se grátis
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/auth'

defineOptions({
  name: 'LoginForm',
})

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const { accessToken } = await login({ email: email.value, password: password.value })
    localStorage.setItem('accessToken', accessToken)
    router.push('/home')
  } catch {
    errorMessage.value = 'E-mail ou senha inválidos.'
  } finally {
    loading.value = false
  }
}
</script>