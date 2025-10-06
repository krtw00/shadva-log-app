<template>
  <v-app>
    <!-- ナビゲーションバー -->
    <v-app-bar elevation="0" class="app-bar">
      <v-app-bar-title class="ml-4">
        <span class="logo-text-supicha">SHADVA</span>
        <span class="logo-text-log">LOG</span>
      </v-app-bar-title>

      <v-spacer />

      <v-btn
        prepend-icon="mdi-view-dashboard"
        variant="text"
        @click="$router.push('/')"
      >
        ダッシュボード
      </v-btn>
      <v-btn
        prepend-icon="mdi-chart-box"
        variant="text"
        @click="$router.push('/statistics')"
      >
        統計
      </v-btn>
      <v-btn
        prepend-icon="mdi-shape"
        variant="flat"
        color="primary"
      >
        アーキタイプ管理
      </v-btn>
    </v-app-bar>

    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <h1 class="text-h4 mb-6" style="color: #212121;">アーキタイプ管理</h1>

        <v-card class="archetype-card">
          <v-card-title class="d-flex align-center pa-4">
            <v-icon class="mr-2" color="primary">mdi-shape</v-icon>
            <span class="text-h6">登録済みアーキタイプ</span>
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openArchetypeDialog()"
              class="add-btn"
            >
              アーキタイプを追加
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="archetypes"
              :loading="loading"
              class="archetype-table"
              hover
              density="comfortable"
            >
              <template #item.actions="{ item }">
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  @click="openArchetypeDialog(item)"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  @click="deleteArchetype(item.id)"
                />
              </template>

              <template #no-data>
                <div class="text-center pa-8">
                  <v-icon size="64" color="grey">mdi-shape-outline</v-icon>
                  <p class="text-h6 text-grey mt-4">アーキタイプが登録されていません</p>
                  <p class="text-body-1 text-grey">「アーキタイプを追加」ボタンから登録を開始しましょう</p>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- アーキタイプ入力ダイアログ -->
    <v-dialog
      v-model="dialogOpen"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title class="pa-6">
          <v-icon class="mr-2" color="primary">mdi-shape-edit</v-icon>
          <span class="text-h5">{{ isEdit ? 'アーキタイプを編集' : '新規アーキタイプ' }}</span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-form ref="formRef" @submit.prevent="saveArchetype">
            <v-text-field
              v-model="archetypeForm.name"
              label="アーキタイプ名"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-4"
            />
            <v-select
              v-model="archetypeForm.class_name"
              :items="playerClasses"
              label="クラス"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-4"
            />
            <v-text-field
              v-model.number="archetypeForm.default_cr"
              label="デフォルトCR"
              type="number"
              :rules="[rules.numeric, rules.minZero]"
              variant="outlined"
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeDialog"
          >
            キャンセル
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            @click="saveArchetype"
          >
            <v-icon start>mdi-content-save</v-icon>
            {{ isEdit ? '更新' : '登録' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '../services/api'
import type { Archetype } from '@/types'


const api = useApi()

const archetypes = ref<Archetype[]>([])
const loading = ref(false)
const dialogOpen = ref(false)
const selectedArchetype = ref<Archetype | null>(null)

const defaultArchetypeForm = (): Archetype => ({
  name: '',
  class_name: '',
  default_cr: 0
})

const archetypeForm = ref<Archetype>(defaultArchetypeForm())

const isEdit = computed(() => !!selectedArchetype.value?.id)

const playerClasses = ['エルフ', 'ロイヤル', 'ウィッチ', 'ドラゴン', 'ナイトメア', 'ビショップ', 'ネメシス']

const headers = [
  { title: 'ID', key: 'id', sortable: true, width: 80 },
  { title: 'アーキタイプ名', key: 'name', sortable: true },
  { title: 'クラス', key: 'class_name', sortable: true },
  { title: 'デフォルトCR', key: 'default_cr', sortable: true },
  { title: 'アクション', key: 'actions', sortable: false, width: 150, align: 'center' }
] as const

const rules = {
  required: (v: any) => (v !== null && v !== undefined && v !== '') || '入力必須です',
  numeric: (v: any) => !isNaN(parseFloat(v)) || '数値を入力してください',
  minZero: (v: number) => v >= 0 || '0以上の値を入力してください',
}

const fetchArchetypes = async () => {
  loading.value = true
  try {
    const result = await api.getArchetypes()
    if (result.success && result.data) {
      archetypes.value = result.data
    }
  } catch (error) {
    console.error('Failed to fetch archetypes:', error)
  } finally {
    loading.value = false
  }
}

const openArchetypeDialog = (archetype?: Archetype) => {
  selectedArchetype.value = archetype || null
  archetypeForm.value = archetype ? { ...archetype } : defaultArchetypeForm()
  dialogOpen.value = true
}

const saveArchetype = async () => {
  // Form validation (assuming formRef is available and has a validate method)
  // const { valid } = await formRef.value.validate()
  // if (!valid) return

  loading.value = true
  try {
    if (isEdit.value) {
      await api.updateArchetype(archetypeForm.value)
    } else {
      await api.addArchetype(archetypeForm.value)
    }
    fetchArchetypes()
    closeDialog()
  } catch (error) {
    console.error('Failed to save archetype:', error)
  } finally {
    loading.value = false
  }
}

const deleteArchetype = async (id?: number) => {
  if (id === undefined) return
  if (!confirm('このアーキタイプを削除しますか？')) return

  try {
    await api.deleteArchetype(id)
    fetchArchetypes()
  } catch (error) {
    console.error('Failed to delete archetype:', error)
  }
}

const closeDialog = () => {
  dialogOpen.value = false
  selectedArchetype.value = null
  archetypeForm.value = defaultArchetypeForm()
  // formRef.value?.resetValidation() // Assuming formRef is available
}

onMounted(() => {
  fetchArchetypes()
})
</script>

<style scoped lang="scss">
.main-content {
  background: #ffffff;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 30%, rgba(33, 150, 243, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(158, 158, 158, 0.02) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
}

.app-bar {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(224, 224, 224, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.logo-text-supicha {
  font-weight: 900;
  font-size: 1.25rem;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

.logo-text-log {
  font-weight: 900;
  font-size: 1.25rem;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
  margin-left: 2px;
}



.archetype-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(224, 224, 224, 0.8);
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.archetype-table {
  background: transparent !important;

  .v-data-table__th {
    background: rgba(245, 245, 245, 0.8) !important;
    color: rgba(33, 33, 33, 0.87) !important;
    font-weight: 600 !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 10px !important;
    white-space: nowrap;
  }

  .v-data-table__td {
    border-bottom: 1px solid rgba(224, 224, 224, 0.5) !important;
    font-size: 20px !important;
    color: rgba(33, 33, 33, 0.87) !important;

    .v-chip {
      font-size: 20px !important;
    }
  }

  .v-data-table__tr:hover {
    background: rgba(33, 150, 243, 0.05) !important;
  }
}

.add-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(33, 150, 243, 0.2);
  }
}
</style>
