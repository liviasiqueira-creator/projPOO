<template>
  <v-container fluid class="login-page pa-0 d-flex justify-center align-center">
    <v-row class="fill-height ma-0" align="center" justify="center">
      <v-col cols="12" md="10" lg="9" xl="8">
        <v-card class="login-shell mx-auto" rounded="xl" elevation="0">
          <v-row no-gutters>
            <v-col cols="12" md="6" class="promo-panel d-flex flex-column justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-2">Barbearia</p>
                <h1 class="text-h4 font-weight-bold mb-3">subtitulo</h1>
                <p class="text-body-2 text-medium-emphasis mb-6">
                  Descricao
                </p>
              </div>

              <v-card class="bundle-card" rounded="lg" elevation="0">
                <v-card-title class="d-flex justify-space-between align-center py-3 px-4">
                  <span class="text-subtitle-2">Pacote Membro</span>
                  <span class="text-h6 font-weight-bold">$65</span>
                </v-card-title>
                <v-card-text class="pt-0 pb-4 px-4 text-body-2 text-medium-emphasis">
                  frase
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6" class="form-panel d-flex align-center">
              <v-card class="form-card mx-auto" rounded="xl" elevation="0">
                <v-card-title class="text-h5 font-weight-bold mb-1">Entrar</v-card-title>
                <v-card-subtitle class="px-0 pb-4">
                  Acesse sua conta e gerencie seus agendamentos.
                </v-card-subtitle>

                <v-form @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="username"
                    label="Usuário"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-outline"
                    class="mb-3"
                    hide-details="auto"
                    required
                  />

                  <v-text-field
                    v-model="password"
                    label="Senha"
                    :type="showPassword ? 'text' : 'password'"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    @click:append-inner="showPassword = !showPassword"
                    class="mb-3"
                    hide-details="auto"
                    required
                  />

                  <v-btn
                    type="submit"
                    block
                    size="large"
                    color="primary"
                    variant="flat"
                    class="login-btn text-none font-weight-bold"
                    :loading="loading"
                  >
                    Acessar
                  </v-btn>
                </v-form>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'LoginPage',
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
    router.push('/option-1')
  }, 700)
}
</script>

<style scoped>
.login-page {
  min-height: 100dvh;
  background:
    radial-gradient(circle at 18% 8%, rgba(var(--v-theme-primary), 0.28), transparent 42%),
    radial-gradient(circle at 100% 100%, rgba(var(--v-theme-primary), 0.18), transparent 44%),
    linear-gradient(135deg, rgba(var(--v-theme-brown-dark), 0.22) 0%, transparent 45%),
    rgb(var(--v-theme-background));
}

.login-shell {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-primary) / 0.18);
  overflow: hidden;
}

.promo-panel {
  min-height: 560px;
  padding: 2rem;
  background:
    radial-gradient(circle at 0 0, rgba(var(--v-theme-primary), 0.28), transparent 48%),
    radial-gradient(circle at 95% 85%, rgba(var(--v-theme-brown-muted), 0.35), transparent 50%),
    linear-gradient(
      135deg,
      rgba(var(--v-theme-brown-dark), 0.7) 0%,
      rgb(var(--v-theme-background)) 70%
    );
  border-right: 1px solid rgb(var(--v-theme-primary) / 0.15);
}

.bundle-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-primary) / 0.2);
}

.form-panel {
  min-height: 560px;
  padding: 2rem;
  background: rgb(var(--v-theme-background));
}

.form-card {
  width: min(440px, 100%);
  background: transparent;
  padding: 0.5rem;
}

.forgot-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
  letter-spacing: 0.03em;
}

:deep(.v-field) {
  background-color: rgb(var(--v-theme-surface));
  border-radius: 12px;
}

:deep(.v-label),
:deep(.v-field__input),
:deep(.v-icon) {
  color: rgb(var(--v-theme-secondary));
}

:deep(.v-selection-control .v-label) {
  color: rgb(var(--v-theme-secondary));
}

@media (max-width: 959px) {
  .promo-panel,
  .form-panel {
    min-height: auto;
    padding: 1.5rem;
  }

  .promo-panel {
    border-right: none;
    border-bottom: 1px solid rgb(var(--v-theme-primary) / 0.15);
  }
}
</style>
