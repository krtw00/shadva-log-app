<template>
  <v-data-table
    :headers="computedHeaders"
    :items="matches"
    :loading="loading"
    class="match-table"
    hover
    density="comfortable"
  >
    <!-- 勝敗カラム -->
    <template #item.result_display="{ item }">
      <v-chip
        :color="item.result === 1 ? 'success' : 'error'"
        variant="flat"
        class="font-weight-bold"
      >
        <v-icon start>
          {{ item.result === 1 ? 'mdi-check-circle' : 'mdi-close-circle' }}
        </v-icon>
        {{ item.result === 1 ? '勝利' : '敗北' }}
      </v-chip>
    </template>

    <!-- 自分のクラス/アーキタイプカラム -->
    <template #item.player_info="{ item }">
      <v-chip color="primary" variant="tonal">
        {{ item.player_class }} ({{ item.player_archetype || '-' }})
      </v-chip>
    </template>

    <!-- 相手のクラス/アーキタイプカラム -->
    <template #item.opponent_info="{ item }">
      <v-chip color="secondary" variant="tonal">
        {{ item.opponent_class }} ({{ item.opponent_archetype || '-' }})
      </v-chip>
    </template>

    <!-- 先手/後手カラム -->
    <template #item.is_first_display="{ item }">
      <v-icon :color="item.is_first === 1 ? 'info' : 'purple'">
        {{ item.is_first === 1 ? 'mdi-numeric-1-circle' : 'mdi-numeric-2-circle' }}
      </v-icon>
      {{ item.is_first === 1 ? '先手' : '後手' }}
    </template>

    <!-- ランクカラム -->
    <template #item.player_rank="{ item }">
      <v-chip v-if="item.player_rank" color="warning" variant="outlined" size="small">
        <v-icon start size="small">mdi-crown</v-icon>
        {{ item.player_rank }}
      </v-chip>
      <span v-else class="text-grey">-</span>
    </template>

    <!-- グループカラム (Beginner-AAのみ) -->
    <template #item.player_group="{ item }">
      <v-chip v-if="item.player_group" color="purple" variant="outlined" size="small">
        <v-icon start size="small">mdi-shape</v-icon>
        {{ item.player_group }}
      </v-chip>
      <span v-else class="text-grey">-</span>
    </template>

    <!-- MPカラム -->
    <template #item.player_mp="{ item }">
      <v-chip
        v-if="item.player_mp !== undefined && item.player_mp !== null"
        color="secondary"
        variant="outlined"
        size="small"
      >
        <v-icon start size="small">mdi-trophy-variant</v-icon>
        {{ item.player_mp }}
      </v-chip>
      <span v-else class="text-grey">-</span>
    </template>

    <!-- CRカラム -->
    <template #item.player_cr="{ item }">
      <v-chip
        v-if="item.player_cr !== undefined && item.player_cr !== null"
        color="info"
        variant="outlined"
        size="small"
      >
        <v-icon start size="small">mdi-chart-line</v-icon>
        {{ item.player_cr }}
      </v-chip>
      <span v-else class="text-grey">-</span>
    </template>

    <!-- 備考カラム -->
    <template #item.notes="{ item }">
      <span v-if="item.notes">{{ item.notes }}</span>
      <span v-else class="text-grey">-</span>
    </template>

    <!-- 対戦日時カラム -->
    <template #item.match_date="{ item }">
      {{ formatDateTime(item.match_date) }}
    </template>

    <!-- アクションカラム -->
    <template #item.actions="{ item }">
      <v-btn icon="mdi-pencil" variant="text" @click="$emit('edit', item)" />
      <v-btn icon="mdi-delete" variant="text" color="error" @click="$emit('delete', item.id)" />
    </template>

    <!-- ローディング -->
    <template #loading>
      <v-skeleton-loader type="table-row@10" />
    </template>

    <!-- データなし -->
    <template #no-data>
      <div class="text-center pa-8">
        <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
        <p class="text-h6 text-grey mt-4">対戦記録がありません</p>
        <p class="text-body-1 text-grey">「対戦記録を追加」ボタンから記録を開始しましょう</p>
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Match } from '@/types'

const props = defineProps<{
  matches: Match[]
  loading: boolean
  currentRankTab: 'Beginner-AA' | 'Master' | 'Grand Master'
}>()

defineEmits<{
  refresh: []
  edit: [match: Match]
  delete: [id: number | undefined]
}>()

// タブに応じてヘッダーを動的に変更
const computedHeaders = computed(() => {
  const baseHeaders = [
    { title: '自分', key: 'player_info', sortable: false },
    { title: '先手/後手', key: 'is_first_display', sortable: false, width: 120 },
    { title: '相手', key: 'opponent_info', sortable: false },
    { title: '勝敗', key: 'result_display', sortable: true, width: 100 },
    { title: 'ランク', key: 'player_rank', sortable: false, width: 120 }
  ]

  // Beginner-AAタブの場合はグループ列を追加
  if (props.currentRankTab === 'Beginner-AA') {
    baseHeaders.push({ title: 'グループ', key: 'player_group', sortable: false, width: 140 })
  }

  // Master/Grand Masterタブの場合はMP列を追加
  if (props.currentRankTab === 'Master' || props.currentRankTab === 'Grand Master') {
    baseHeaders.push({ title: 'MP', key: 'player_mp', sortable: false, width: 100 })
  }

  // Grand MasterタブのみCR列を追加
  if (props.currentRankTab === 'Grand Master') {
    baseHeaders.push({ title: 'CR', key: 'player_cr', sortable: false, width: 100 })
  }

  // 共通の最後の列
  baseHeaders.push(
    { title: '備考', key: 'notes', sortable: false, width: 200 },
    { title: '対戦日時', key: 'match_date', sortable: true },
    { title: 'アクション', key: 'actions', sortable: false, width: 120 }
  )

  return baseHeaders as any
})

const formatDateTime = (isoString: string) => {
  // ISO形式の文字列をそのまま表示用にフォーマット
  // "2025-10-04T05:36" → "2025/10/04 05:36"
  const cleanedString = isoString.replace(/\.\d{3}Z?$/, '')
  const [datePart, timePart] = cleanedString.split('T')
  const [year, month, day] = datePart.split('-')
  const [hour, minute] = timePart.split(':')
  return `${year}/${month}/${day} ${hour}:${minute}`
}
</script>

<style lang="scss">
.match-table {
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
</style>
