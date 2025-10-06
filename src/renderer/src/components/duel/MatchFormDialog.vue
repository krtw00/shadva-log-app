<template>
  <v-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
  >
    <v-card class="match-form-card">
      
      <v-card-title class="pa-6">
        <v-icon class="mr-2" color="primary">mdi-file-document-edit</v-icon>
        <span class="text-h5">{{ isEdit ? '対戦記録を編集' : '新規対戦記録' }}</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-row>
            <!-- 自分のクラス -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.player_class"
                label="自分のクラス"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                :items="playerClasses"
                :rules="[rules.required]"
              />
            </v-col>

            <!-- 自分のアーキタイプ -->
            <v-col cols="12" md="6">
              <v-combobox
                v-model="form.player_archetype"
                label="自分のアーキタイプ"
                prepend-inner-icon="mdi-strategy"
                variant="outlined"
                :items="playerArchetypes.map(a => a.name)"
                :loading="loadingArchetypes"
                :disabled="!form.player_class"
                clearable
                placeholder="選択または新規入力"
              />
            </v-col>

            <!-- 相手のクラス -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.opponent_class"
                label="相手のクラス"
                prepend-inner-icon="mdi-account-multiple"
                variant="outlined"
                :items="playerClasses"
                :rules="[rules.required]"
              />
            </v-col>

            <!-- 相手のアーキタイプ -->
            <v-col cols="12" md="6">
              <v-combobox
                v-model="form.opponent_archetype"
                label="相手のアーキタイプ"
                prepend-inner-icon="mdi-strategy"
                variant="outlined"
                :items="opponentArchetypes.map(a => a.name)"
                :loading="loadingArchetypes"
                :disabled="!form.opponent_class"
                clearable
                placeholder="選択または新規入力"
              />
            </v-col>

            <!-- 先手後手 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.is_first"
                label="先手後手"
                prepend-inner-icon="mdi-swap-horizontal"
                variant="outlined"
                :items="firstOrSecondOptions"
                :rules="[rules.required]"
              />
            </v-col>

            <!-- 勝敗 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.result"
                label="勝敗"
                prepend-inner-icon="mdi-trophy"
                variant="outlined"
                :items="resultOptions"
                :rules="[rules.required]"
              />
            </v-col>

            <!-- ランク -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.player_rank"
                label="ランク"
                prepend-inner-icon="mdi-medal"
                variant="outlined"
                :items="availableRanks"
                :rules="[rules.required]"
              />
            </v-col>

            <!-- グループ (Beginner-AAのみ) -->
            <v-col cols="12" md="6" v-if="props.currentRankTab === 'Beginner-AA'">
              <v-select
                v-model="form.player_group"
                label="グループ"
                prepend-inner-icon="mdi-trophy-variant"
                variant="outlined"
                :items="groupOptions"
                :rules="[rules.required]"
              />
            </v-col>

            <!-- MP -->
            <v-col cols="12" md="6" v-if="props.currentRankTab === 'Master' || props.currentRankTab === 'Grand Master'">
              <v-text-field
                v-model.number="form.player_mp"
                label="MP"
                prepend-inner-icon="mdi-trophy-variant"
                variant="outlined"
                color="warning"
                type="number"
                min="0"
                placeholder="例: 18500"
              />
            </v-col>

            <!-- CR -->
            <v-col cols="12" md="6" v-if="props.currentRankTab === 'Grand Master'">
              <v-text-field
                v-model.number="form.player_cr"
                label="CR"
                prepend-inner-icon="mdi-chart-line"
                variant="outlined"
                color="info"
                type="number"
                min="0"
                placeholder="例: 1500"
              />
            </v-col>

            <!-- 対戦日時 -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.match_date"
                label="対戦日時"
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                type="datetime-local"
                :rules="[rules.required]"
              />
            </v-col>

            <!-- 備考 -->
            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="備考"
                prepend-inner-icon="mdi-note-text"
                variant="outlined"
                rows="3"
                counter="1000"
                placeholder="メモやコメントを入力"
                :rules="[rules.maxLength]"
              />
            </v-col>


          </v-row>
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
          @click="handleSubmit"
        >
          <v-icon start>mdi-content-save</v-icon>
          {{ isEdit ? '更新' : '登録' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useApi } from '../../services/api'
import type { Match, Archetype } from '@/types'

interface Props {
  modelValue: boolean
  match: Match | null
  currentRankTab: 'Beginner-AA' | 'Master' | 'Grand Master'
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'saved'])

const api = useApi()

const formRef = ref()
const loading = ref(false)

const playerArchetypes = ref<Archetype[]>([])
const opponentArchetypes = ref<Archetype[]>([])
const loadingArchetypes = ref(false)

const fetchArchetypes = async (className: string, type: 'player' | 'opponent') => {
  if (!className) {
    if (type === 'player') playerArchetypes.value = []
    else opponentArchetypes.value = []
    return
  }
  loadingArchetypes.value = true
  try {
    const result = await api.getArchetypes(className)
    if (result.success && result.data) {
      if (type === 'player') playerArchetypes.value = result.data
      else opponentArchetypes.value = result.data
    }
  } catch (error) {
    console.error(`Failed to fetch ${type} archetypes:`, error)
  } finally {
    loadingArchetypes.value = false
  }
}

const playerClasses = ['エルフ', 'ロイヤル', 'ウィッチ', 'ドラゴン', 'ナイトメア', 'ビショップ', 'ネメシス']
const ranks = ['Beginner', 'D', 'C', 'B', 'A', 'AA', 'Master', 'Grand Master']
const groupOptions = ['エメラルド', 'トパーズ', 'ルビー', 'サファイア', 'ダイヤモンド']

const defaultForm = (): Match => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`
  
  return {
    match_date: localDateTime,
    player_rank: '',
    player_group: undefined,
    player_cr: undefined,
    player_mp: undefined,
    player_class: '',
    player_archetype: '',
    opponent_class: '',
    opponent_archetype: '',
    is_first: 1,
    result: 1,
    notes: ''
  }
}

const form = ref<Match>(defaultForm())

const isEdit = computed(() => !!props.match)

// 各タブで利用可能なランクのリスト
const availableRanks = computed(() => {
  if (props.currentRankTab === 'Beginner-AA') {
    return ['Beginner', 'D', 'C', 'B', 'A', 'AA']
  } else if (props.currentRankTab === 'Master') {
    return ['Master']
  } else if (props.currentRankTab === 'Grand Master') {
    return ['Grand Master']
  }
  return ranks
})

const firstOrSecondOptions = [
  { title: '先手', value: 1 },
  { title: '後手', value: 0 }
]

const resultOptions = [
  { title: '勝ち', value: 1 },
  { title: '負け', value: 0 }
]

const rules = {
  required: (v: any) => (v !== null && v !== undefined && v !== '') || '入力必須です',
  number: (v: any) => (!isNaN(v) && v >= 0) || '0以上の数値を入力してください',
  maxLength: (v: string) => !v || v.length <= 1000 || '1000文字以内で入力してください'
}

// ダイアログが開いたらフォームを初期化
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    if (props.match) {
      // 編集モード
      form.value = { ...props.match }
      // 既存のクラスに基づいてアーキタイプを取得
      if (form.value.player_class) {
        fetchArchetypes(form.value.player_class, 'player')
      }
      if (form.value.opponent_class) {
        fetchArchetypes(form.value.opponent_class, 'opponent')
      }
    } else {
      // 新規作成モード
      form.value = defaultForm()

      // 現在のランクタブに応じた最新の試合データを取得してフォームに設定
      let latestMatch = null
      try {
        const latestMatchResult = await api.getLatestMatchByRankTab(props.currentRankTab)
        if (latestMatchResult.success && latestMatchResult.data) {
          latestMatch = latestMatchResult.data
        }
      } catch (error) {
        console.error('Failed to fetch latest match data for rank tab:', error)
      }

      // 最新のクラスとアーキタイプを適用
      form.value.player_class = latestMatch?.player_class || ''
      form.value.player_archetype = latestMatch?.player_archetype || ''

      // currentRankTabに基づいてplayer_rank, player_group, player_mpを初期化
      if (props.currentRankTab === 'Master') {
        form.value.player_rank = 'Master'
        form.value.player_mp = latestMatch?.player_mp || undefined
      } else if (props.currentRankTab === 'Grand Master') {
        form.value.player_rank = 'Grand Master'
        form.value.player_mp = latestMatch?.player_mp || undefined
        // CRはクラス選択時に設定されるため、ここでは設定しない
      } else if (props.currentRankTab === 'Beginner-AA') {
        form.value.player_rank = latestMatch?.player_rank && availableRanks.value.includes(latestMatch.player_rank) ? latestMatch.player_rank : 'Beginner'
        form.value.player_group = latestMatch?.player_group || 'エメラルド'
      }

      // 最新のクラスに基づいてアーキタイプを取得
      if (form.value.player_class) {
        fetchArchetypes(form.value.player_class, 'player')
      }
    }
  }
})

// Watch currentRankTab to update form.player_rank
watch(() => props.currentRankTab, (newTab) => {
  if (newTab === 'Master') {
    form.value.player_rank = 'Master'
  } else if (newTab === 'Grand Master') {
    form.value.player_rank = 'Grand Master'
  } else if (newTab === 'Beginner-AA') {
    // Beginner-AAタブではユーザーが選択するため、新規作成時のみデフォルト値を設定
    if (!form.value.player_rank || !['Beginner', 'D', 'C', 'B', 'A', 'AA'].includes(form.value.player_rank)) {
      form.value.player_rank = 'Beginner'
    }
  } else {
    form.value.player_rank = '' // Clear if other tab (should not happen with current tabs)
  }
})

// クラス選択時にアーキタイプをフェッチ
watch(() => form.value.player_class, async (newClass) => {
  if (newClass) {
    fetchArchetypes(newClass, 'player')
    // Grand Masterタブの場合のみCRを自動設定
    if (props.currentRankTab === 'Grand Master') {
      try {
        // 1. 最新のGrand Master CRを取得
        const latestCrResult = await api.getLatestCrForClass(newClass, 'Grand Master')
        if (latestCrResult.success && latestCrResult.data !== undefined) {
          form.value.player_cr = latestCrResult.data
        } else {
          // 2. Grand Masterデータがない場合、クラスのデフォルトCRを取得
          const archetypesResult = await api.getArchetypes(newClass)
          if (archetypesResult.success && archetypesResult.data && archetypesResult.data.length > 0) {
            form.value.player_cr = archetypesResult.data[0].default_cr
          } else {
            form.value.player_cr = undefined // デフォルトCRも設定されていない場合
          }
        }
      } catch (error) {
        console.error('Failed to set CR for class:', error)
        form.value.player_cr = undefined
      }
    }
  } else {
    playerArchetypes.value = []
    if (props.currentRankTab === 'Grand Master') {
      form.value.player_cr = undefined
    }
  }
})

watch(() => form.value.opponent_class, (newClass) => {
  if (newClass) {
    fetchArchetypes(newClass, 'opponent')
  } else {
    opponentArchetypes.value = []
  }
})

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    // Check and add new player archetype if it doesn't exist
    if (form.value.player_archetype && !playerArchetypes.value.some(a => a.name === form.value.player_archetype)) {
      await api.addArchetype({ name: form.value.player_archetype, class_name: form.value.player_class })
    }
    // Check and add new opponent archetype if it doesn't exist
    if (form.value.opponent_archetype && !opponentArchetypes.value.some(a => a.name === form.value.opponent_archetype)) {
      await api.addArchetype({ name: form.value.opponent_archetype, class_name: form.value.opponent_class })
    }

    if (isEdit.value && props.match?.id) {
      // TODO: updateMatch API がないため、ここでは新規追加として扱うか、APIを追加する必要がある
      // 現在は追加のみを想定
      await api.addMatch(form.value)
      // notificationStore.success('対戦記録を更新しました (実際は新規追加)') // Removed this line
    } else {
      await api.addMatch(form.value)
      // notificationStore.success('対戦記録を登録しました') // Removed this line
    }
    
    emit('saved')
    closeDialog()
  } catch (error) {
    console.error('Failed to save match:', error)
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
  formRef.value?.resetValidation()
}
</script>

<style scoped lang="scss">
.match-form-card {
  background: #ffffff !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(224, 224, 224, 0.8);
  border-radius: 12px !important;
  position: relative;
  overflow: hidden;
}
</style>
