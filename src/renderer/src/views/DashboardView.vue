<template>
  <v-container fluid class="pa-6">
        <h1 class="text-h4 text-white mb-6"></h1>

        <!-- 年月選択 -->
        <v-row class="mb-4">
          <v-col cols="6" sm="3">
            <v-select
              v-model="selectedYear"
              :items="years"
              label="年"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="fetchMatches"
            ></v-select>
          </v-col>
          <v-col cols="6" sm="3">
            <v-select
              v-model="selectedMonth"
              :items="months"
              label="月"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="fetchMatches"
            ></v-select>
          </v-col>
        </v-row>

        <!-- ランク別タブ -->
        <v-row class="mb-4">
          <v-col cols="12">
            <v-tabs v-model="selectedRankTab" background-color="transparent" color="primary" grow>
              <v-tab value="Beginner-AA">Beginner-AA</v-tab>
              <v-tab value="Master">Master</v-tab>
              <v-tab value="Grand Master">Grand Master</v-tab>
            </v-tabs>
          </v-col>
        </v-row>

        <!-- 統計カード -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <stat-card
              title="総試合数"
              :value="currentStats.total_matches"
              icon="mdi-sword-cross"
              color="primary"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <stat-card
              title="勝率"
              :value="`${(currentStats.win_rate * 100).toFixed(1)}%`"
              icon="mdi-trophy"
              color="success"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <stat-card
              title="先手勝率"
              :value="`${(currentStats.first_turn_win_rate * 100).toFixed(1)}%`"
              icon="mdi-lightning-bolt"
              color="warning"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <stat-card
              title="後手勝率"
              :value="`${(currentStats.second_turn_win_rate * 100).toFixed(1)}%`"
              icon="mdi-shield"
              color="secondary"
            />
          </v-col>
        </v-row>

        <!-- マッチテーブル -->
        <v-card class="match-card">
          <v-card-title class="pa-4">
            <v-row align="center" class="ma-0 pa-0">
              <v-col cols="12" md="auto" class="d-flex align-center pa-0">
                <v-icon class="mr-2" color="primary">mdi-table</v-icon>
                <span class="text-h6">対戦履歴</span>
              </v-col>
              <v-col cols="12" md="auto" class="ml-auto d-flex justify-end pa-0">
                <v-btn
                  color="info"
                  prepend-icon="mdi-download"
                  @click="exportCSV"
                  class="mr-2"
                  variant="outlined"
                  size="small"
                >
                  CSVエクスポート
                </v-btn>
                <v-btn
                  color="warning"
                  prepend-icon="mdi-upload"
                  @click="triggerImportCSV"
                  class="mr-2"
                  variant="outlined"
                  size="small"
                >
                  CSVインポート
                </v-btn>
                <input
                  ref="fileInput"
                  type="file"
                  accept=".csv"
                  style="display: none"
                  @change="importCSV"
                />
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="openMatchDialog"
                  class="add-btn"
                  size="small"
                >
                  対戦記録を追加
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>

          <v-divider />

          <match-table
            :matches="filteredMatches"
            :loading="loading"
            :current-rank-tab="selectedRankTab"
            @refresh="fetchMatches"
            @edit="editMatch"
            @delete="deleteMatch"
          />
        </v-card>
  </v-container>

  <!-- 対戦記録入力ダイアログ -->
  <match-form-dialog
    v-model="dialogOpen"
    :match="selectedMatch"
    :current-rank-tab="selectedRankTab"
    @saved="handleSaved"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '../services/api'
import type { Match } from '@/types'
import StatCard from '../components/duel/StatCard.vue'
import MatchTable from '../components/duel/MatchTable.vue'
import MatchFormDialog from '../components/duel/MatchFormDialog.vue'
import { useNotificationStore } from '../stores/notification'

const api = useApi()
const notificationStore = useNotificationStore()
const fileInput = ref<HTMLInputElement | null>(null)

const matches = ref<Match[]>([])
const loading = ref(false)
const dialogOpen = ref(false)
const selectedMatch = ref<Match | null>(null)

// 年月選択関連
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)

// ランク別タブ選択
const selectedRankTab = ref<'Beginner-AA' | 'Master' | 'Grand Master'>('Beginner-AA')
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i) // 過去5年
})
const months = Array.from({ length: 12 }, (_, i) => i + 1)

const filteredMatches = computed(() => {
  let filtered = matches.value

  // 年月でフィルタリング
  filtered = filtered.filter((match) => {
    const matchDate = new Date(match.match_date)
    return (
      matchDate.getFullYear() === selectedYear.value &&
      matchDate.getMonth() + 1 === selectedMonth.value
    )
  })

  // ランク別タブでフィルタリング
  if (selectedRankTab.value === 'Beginner-AA') {
    const beginnerAARanks = ['Beginner', 'D', 'C', 'B', 'A', 'AA']
    filtered = filtered.filter((match) => beginnerAARanks.includes(match.player_rank))
  } else if (selectedRankTab.value === 'Master') {
    filtered = filtered.filter((match) => match.player_rank === 'Master')
  } else if (selectedRankTab.value === 'Grand Master') {
    filtered = filtered.filter((match) => match.player_rank === 'Grand Master')
  }

  return filtered
})

interface MatchStats {
  total_matches: number
  win_count: number
  lose_count: number
  win_rate: number
  first_turn_win_rate: number
  second_turn_win_rate: number
}

const emptyStats = (): MatchStats => ({
  total_matches: 0,
  win_count: 0,
  lose_count: 0,
  win_rate: 0,
  first_turn_win_rate: 0,
  second_turn_win_rate: 0
})

const currentStats = computed(() => calculateStats(filteredMatches.value))

const fetchMatches = async () => {
  loading.value = true
  try {
    const result = await api.getMatches()
    if (result.success && result.data) {
      matches.value = result.data
    }
  } catch (error) {
    console.error('Failed to fetch matches:', error)
  } finally {
    loading.value = false
  }
}

const calculateStats = (matchList: Match[]): MatchStats => {
  const total = matchList.length
  if (total === 0) {
    return emptyStats()
  }

  const wins = matchList.filter((m) => m.result === 1).length
  const firstTurnTotal = matchList.filter((m) => m.is_first === 1).length
  const firstTurnWins = matchList.filter((m) => m.result === 1 && m.is_first === 1).length
  const secondTurnTotal = matchList.filter((m) => m.is_first === 0).length
  const secondTurnWins = matchList.filter((m) => m.result === 1 && m.is_first === 0).length

  return {
    total_matches: total,
    win_count: wins,
    lose_count: total - wins,
    win_rate: wins / total,
    first_turn_win_rate: firstTurnTotal > 0 ? firstTurnWins / firstTurnTotal : 0,
    second_turn_win_rate: secondTurnTotal > 0 ? secondTurnWins / secondTurnTotal : 0
  }
}

const openMatchDialog = () => {
  selectedMatch.value = null
  dialogOpen.value = true
}

const editMatch = (match: Match) => {
  selectedMatch.value = match
  dialogOpen.value = true
}

const deleteMatch = async (matchId: number | undefined) => {
  if (matchId === undefined) return
  if (!confirm('この対戦記録を削除しますか？')) return

  try {
    await api.deleteMatch(matchId)
    await fetchMatches()
  } catch (error) {
    console.error('Failed to delete match:', error)
  }
}

const handleSaved = () => {
  dialogOpen.value = false
  fetchMatches()
}

const exportCSV = () => {
  try {
    // CSVヘッダー
    const headers = [
      'ID',
      '対戦日時',
      'ランク',
      'グループ',
      'CR',
      'MP',
      '自分のクラス',
      '自分のアーキタイプ',
      '相手のクラス',
      '相手のアーキタイプ',
      '先手後手',
      '勝敗',
      '備考'
    ]

    // CSVデータを作成
    const rows = matches.value.map((match) => [
      match.id || '',
      match.match_date,
      match.player_rank,
      match.player_group || '',
      match.player_cr || '',
      match.player_mp || '',
      match.player_class,
      match.player_archetype || '',
      match.opponent_class,
      match.opponent_archetype || '',
      match.is_first === 1 ? '先手' : '後手',
      match.result === 1 ? '勝ち' : '負け',
      match.notes || ''
    ])

    // CSV文字列を生成
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n')

    // BOM付きUTF-8でエンコード
    const bom = '\ufeff'
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `matches_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    notificationStore.success('CSVファイルをエクスポートしました')
  } catch (error) {
    console.error('CSV export error:', error)
    notificationStore.error('CSVエクスポートに失敗しました')
  }
}

const triggerImportCSV = () => {
  fileInput.value?.click()
}

const importCSV = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const lines = text.split('\n').filter((line) => line.trim())

    if (lines.length < 2) {
      notificationStore.error('CSVファイルが空です')
      return
    }

    // ヘッダーをスキップ
    const dataLines = lines.slice(1)
    let importCount = 0

    for (const line of dataLines) {
      // CSVパース (ダブルクォート内のカンマを考慮)
      const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/
      const values = line.split(regex).map((v) => v.replace(/^"|"$/g, '').trim())

      if (values.length < 11) continue

      const match: Match = {
        match_date: values[1],
        player_rank: values[2],
        player_group: values[3] || undefined,
        player_cr: values[4] ? parseInt(values[4]) : undefined,
        player_mp: values[5] ? parseInt(values[5]) : undefined,
        player_class: values[6],
        player_archetype: values[7] || undefined,
        opponent_class: values[8],
        opponent_archetype: values[9] || undefined,
        is_first: values[10] === '先手' ? 1 : 0,
        result: values[11] === '勝ち' ? 1 : 0,
        notes: values[12] || undefined
      }

      await api.addMatch(match)
      importCount++
    }

    notificationStore.success(`${importCount}件の対戦記録をインポートしました`)
    await fetchMatches()
  } catch (error) {
    console.error('CSV import error:', error)
    notificationStore.error('CSVインポートに失敗しました')
  } finally {
    // ファイル入力をリセット
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

onMounted(() => {
  fetchMatches()
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

.logo-text-shadva {
  font-weight: 900;
  font-size: 1.25rem;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

.logo-text-log {
  font-weight: 900;
  font-size: 1.25rem;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
  margin-left: 2px;
}

.match-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(224, 224, 224, 0.8);
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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
