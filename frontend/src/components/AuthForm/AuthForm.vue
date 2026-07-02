<template>
  <div>
    <div class="mb-6">
      <template v-if="mode === 'login'">
        <h4>Bem-vindo de volta<br><span class="text-title-small">Entre com a sua conta para continuar</span></h4>
      </template>
      <template v-else>
        <h1 class="text-h5 font-weight-medium">Criar conta</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Preencha os dados para se cadastrar.</p>
      </template>
    </div>

    <v-form ref="formRef" @submit.prevent="handleSubmit">
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
        v-if="mode === 'register'"
        v-model="name"
        label="Nome completo"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        rounded="lg"
        :rules="nameRules"
        class="mb-4"
      />

      <v-text-field
        v-model="email"
        label="E-mail"
        type="email"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        rounded="lg"
        :rules="emailRules"
        class="mb-4"
      />

      <v-text-field
        v-model="password"
        label="Senha"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        variant="outlined"
        rounded="lg"
        :rules="passwordRules"
        :class="mode === 'login' ? 'mb-6' : 'mb-4'"
        @click:append-inner="showPassword = !showPassword"
      />

      <v-text-field
        v-if="mode === 'register'"
        v-model="confirmPassword"
        label="Confirmar senha"
        :type="showConfirm ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-check-outline"
        :append-inner-icon="showConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        variant="outlined"
        rounded="lg"
        :rules="confirmPasswordRules"
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
        {{ mode === 'login' ? 'Entrar' : 'Criar conta' }}
      </v-btn>
    </v-form>

    <div class="text-center mt-5 d-flex flex-column">
      <span class="text-body-2 text-medium-emphasis">
        {{ mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?' }}
      </span>
      <v-btn
        variant="text"
        :color="mode === 'login' ? 'secondary' : 'primary'"
        class="text-none"
        :to="mode === 'login' ? '/register' : '/login'"
      >
        {{ mode === 'login' ? 'Cadastre-se grátis' : 'Entrar' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, createUser } from '@/services/auth'

defineOptions({ name: 'AuthForm' })

const props = defineProps<{
  mode: 'login' | 'register'
}>()

const router = useRouter()
const formRef = ref()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const nameRules = [
  (v: string) => !!v || 'Nome obrigatório',
  (v: string) => v.length >= 2 || 'Mínimo de 2 caracteres',
]

const emailRules = [
  (v: string) => !!v || 'E-mail obrigatório',
  (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
]

const passwordRules = [
  (v: string) => !!v || 'Senha obrigatória',
  (v: string) => v.length >= 6 || 'Mínimo de 6 caracteres',
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Confirmação obrigatória',
  (v: string) => v === password.value || 'As senhas não coincidem',
]

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  try {
    if (props.mode === 'login') {
      const { accessToken } = await login({ email: email.value, password: password.value })
      localStorage.setItem('accessToken', accessToken)
    } else {
      await createUser({ name: name.value, email: email.value, password: password.value, role: 'client' })
    }
    router.push('/home')
  } catch {
    errorMessage.value = props.mode === 'login'
      ? 'E-mail ou senha inválidos.'
      : 'Erro ao criar conta. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
