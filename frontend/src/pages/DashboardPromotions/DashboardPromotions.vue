<template>
  <v-container class="pa-6">
    <div class="promotions-header mb-6">
      <div>
        <h1 class="text-h5 font-weight-medium">Promoções</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Gerencie as promoções da sua barbearia
        </p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        prepend-icon="mdi-plus"
        class="text-none"
        @click="openDialog()"
      >
        Nova promoção
      </v-btn>
    </div>

    <div v-if="promotions.length > 0">
      <v-row>
        <v-col
          v-for="promo in promotions"
          :key="promo.id"
          cols="12"
          md="6"
        >
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-5">
              <div class="d-flex align-start justify-space-between mb-3">
                <div class="d-flex align-center" style="gap: 12px;">
                  <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
                    <v-icon icon="mdi-tag-outline" size="20" />
                  </v-avatar>
                  <div>
                    <p class="text-body-1 font-weight-medium">{{ promo.title }}</p>
                    <p class="text-body-2 text-medium-emphasis">{{ promo.reward }}</p>
                  </div>
                </div>
                <v-switch
                  v-model="promo.active"
                  color="primary"
                  hide-details
                  density="compact"
                />
              </div>

              <p class="text-body-2 text-medium-emphasis mb-4">{{ promo.description }}</p>

              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center" style="gap: 6px;">
                  <v-icon icon="mdi-account-group-outline" size="16" color="secondary" />
                  <span class="text-caption text-medium-emphasis">
                    {{ promo.usageCount }} cliente{{ promo.usageCount !== 1 ? 's' : '' }} usando
                  </span>
                </div>
                <v-btn
                  variant="text"
                  size="small"
                  color="error"
                  class="text-none"
                  prepend-icon="mdi-delete-outline"
                  @click="remove(promo.id)"
                >
                  Remover
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-else class="promotions-empty">
      <v-icon icon="mdi-tag-off-outline" size="48" color="primary" class="mb-4" />
      <p class="text-body-1 font-weight-medium">Nenhuma promoção cadastrada</p>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Crie promoções para atrair mais clientes.
      </p>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        prepend-icon="mdi-plus"
        class="text-none mt-4"
        @click="openDialog()"
      >
        Nova promoção
      </v-btn>
    </div>

    <v-dialog v-model="dialog" max-width="480" rounded="lg">
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-2">
          <span class="text-h6 font-weight-medium">Nova promoção</span>
        </v-card-title>

        <v-card-text class="pa-5 pt-2">
          <v-text-field
            v-model="form.title"
            label="Título"
            placeholder="Ex: 3 agendamentos, 1 corte grátis"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
            hide-details
          />
          <v-textarea
            v-model="form.description"
            label="Descrição"
            placeholder="Explique como a promoção funciona..."
            variant="outlined"
            rounded="lg"
            density="comfortable"
            rows="3"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model="form.reward"
            label="Benefício"
            placeholder="Ex: Corte grátis"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model.number="form.goal"
            label="Número de agendamentos necessários"
            type="number"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
          />
        </v-card-text>

        <v-card-actions class="pa-5 pt-0" style="gap: 8px;">
          <v-btn
            variant="text"
            rounded="lg"
            class="text-none flex-1-1"
            @click="dialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-none flex-1-1"
            :disabled="!formValid"
            @click="save"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface Promotion {
  id: number
  title: string
  description: string
  reward: string
  goal: number
  active: boolean
  usageCount: number
}

const promotions = ref<Promotion[]>([
  {
    id: 1,
    title: '3 agendamentos, 1 corte grátis',
    description: 'O cliente que agendar 3 vezes pela plataforma ganha um corte gratuito.',
    reward: 'Corte grátis',
    goal: 3,
    active: true,
    usageCount: 5,
  },
  {
    id: 2,
    title: '5 agendamentos, 1 barba grátis',
    description: 'O cliente que agendar 5 vezes pela plataforma ganha uma barba gratuita.',
    reward: 'Barba grátis',
    goal: 5,
    active: false,
    usageCount: 2,
  },
])

const dialog = ref(false)
const form = reactive({ title: '', description: '', reward: '', goal: 3 })

const formValid = computed(() =>
  form.title.trim() && form.description.trim() && form.reward.trim() && form.goal > 0
)

let nextId = 3

function openDialog() {
  form.title = ''
  form.description = ''
  form.reward = ''
  form.goal = 3
  dialog.value = true
}

function save() {
  promotions.value.push({
    id: nextId++,
    title: form.title,
    description: form.description,
    reward: form.reward,
    goal: form.goal,
    active: true,
    usageCount: 0,
  })
  dialog.value = false
}

function remove(id: number) {
  promotions.value = promotions.value.filter(p => p.id !== id)
}
</script>

<style scoped>
.promotions-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.promotions-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 24px;
}
</style>
