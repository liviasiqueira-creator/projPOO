<template>
    <div class="mb-6">
    <h4>Bem-vindo de volta<br> <span class="text-title-small">
      Entre com a sua conta para continuar
    </span></h4>
  </div>

  <v-form @submit.prevent="handleLogin">
    <v-text-field
      v-model="username"
      label="Usuário"
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

defineOptions({
  name: 'LoginForm',
})

const router = useRouter()
const username = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
    console.log('Login payload:', {
      username: username.value,
      password: password.value,
      remember: remember.value,
    })
    router.push('/home')
  }, 700)
}
</script>