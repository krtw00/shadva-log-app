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
        variant="flat"
        color="primary"
      >
        統計
      </v-btn>
      <v-btn
        prepend-icon="mdi-shape"
        variant="text"
        @click="$router.push('/archetypes')"
      >
        アーキタイプ管理
      </v-btn>
    </v-app-bar>

    <!-- メインコンテンツ -->
    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <h1 class="text-h4 mb-6" style="color: #212121;">
          <v-icon class="mr-2" color="primary">mdi-chart-box</v-icon>
          統計情報
        </h1>

        <!-- フィルター -->
        <v-row class="mb-4">
          <v-col cols="6" sm="3">
            <v-select
              v-model="selectedYear"
              :items="years"
              label="年"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="fetchStatistics"
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
              @update:model-value="fetchStatistics"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-tabs
              v-model="selectedRankTab"
              background-color="transparent"
              color="primary"
              grow
              @update:model-value="fetchStatistics"
            >
              <v-tab value="Beginner-AA">Beginner-AA</v-tab>
              <v-tab value="Master">Master</v-tab>
              <v-tab value="Grand Master">Grand Master</v-tab>
            </v-tabs>
          </v-col>
        </v-row>

        <!-- 全体サマリー -->
        <v-row class="mb-4">
          <v-col cols="6" md="3">
            <stat-card
              title="総試合数"
              :value="stats.totalMatches"
              icon="mdi-sword-cross"
              color="primary"
            />
          </v-col>
          <v-col cols="6" md="3">
            <stat-card
              title="全体勝率"
              :value="`${stats.overallWinRate.toFixed(1)}%`"
              icon="mdi-trophy"
              :color="getWinRateColor(stats.overallWinRate)"
            />
          </v-col>
          <v-col cols="6" md="3">
            <stat-card
              title="先手勝率"
              :value="`${stats.firstWinRate.toFixed(1)}%`"
              icon="mdi-numeric-1-circle"
              color="info"
            />
          </v-col>
          <v-col cols="6" md="3">
            <stat-card
              title="後手勝率"
              :value="`${stats.secondWinRate.toFixed(1)}%`"
              icon="mdi-numeric-2-circle"
              color="purple"
            />
          </v-col>
        </v-row>

        <v-row>
          <!-- 使用クラス別統計 -->
          <v-col cols="12" lg="6">
            <v-card class="stats-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
                使用クラス別成績
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-data-table
                  :headers="classStatsHeaders"
                  :items="classStats"
                  :loading="loading"
                  density="compact"
                  :items-per-page="10"
                  class="stats-table"
                >
                  <template #item.win_rate="{ item }">
                    <v-chip :color="getWinRateColor(item.win_rate)" variant="flat" size="small">
                      {{ item.win_rate.toFixed(1) }}%
                    </v-chip>
                  </template>
                  <template #no-data>
                    <div class="no-data-placeholder py-8">
                      <v-icon size="48" color="grey">mdi-table-off</v-icon>
                      <p class="text-body-2 text-grey mt-2">データがありません</p>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 対戦相手クラス別統計 -->
          <v-col cols="12" lg="6">
            <v-card class="stats-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="secondary">mdi-sword-cross</v-icon>
                対戦相手クラス別成績
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-data-table
                  :headers="opponentStatsHeaders"
                  :items="opponentStats"
                  :loading="loading"
                  density="compact"
                  :items-per-page="10"
                  class="stats-table"
                >
                  <template #item.win_rate="{ item }">
                    <v-chip :color="getWinRateColor(item.win_rate)" variant="flat" size="small">
                      {{ item.win_rate.toFixed(1) }}%
                    </v-chip>
                  </template>
                  <template #no-data>
                    <div class="no-data-placeholder py-8">
                      <v-icon size="48" color="grey">mdi-table-off</v-icon>
                      <p class="text-body-2 text-grey mt-2">データがありません</p>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- アーキタイプ別統計 -->
          <v-col cols="12" lg="6">
            <v-card class="stats-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="success">mdi-strategy</v-icon>
                使用アーキタイプ別成績
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-data-table
                  :headers="archetypeStatsHeaders"
                  :items="archetypeStats"
                  :loading="loading"
                  density="compact"
                  :items-per-page="10"
                  class="stats-table"
                >
                  <template #item.win_rate="{ item }">
                    <v-chip :color="getWinRateColor(item.win_rate)" variant="flat" size="small">
                      {{ item.win_rate.toFixed(1) }}%
                    </v-chip>
                  </template>
                  <template #no-data>
                    <div class="no-data-placeholder py-8">
                      <v-icon size="48" color="grey">mdi-table-off</v-icon>
                      <p class="text-body-2 text-grey mt-2">データがありません</p>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 対戦相手アーキタイプ別統計 -->
          <v-col cols="12" lg="6">
            <v-card class="stats-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="warning">mdi-target</v-icon>
                対戦相手アーキタイプ別成績
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-data-table
                  :headers="opponentArchetypeStatsHeaders"
                  :items="opponentArchetypeStats"
                  :loading="loading"
                  density="compact"
                  :items-per-page="10"
                  class="stats-table"
                >
                  <template #item.win_rate="{ item }">
                    <v-chip :color="getWinRateColor(item.win_rate)" variant="flat" size="small">
                      {{ item.win_rate.toFixed(1) }}%
                    </v-chip>
                  </template>
                  <template #no-data>
                    <div class="no-data-placeholder py-8">
                      <v-icon size="48" color="grey">mdi-table-off</v-icon>
                      <p class="text-body-2 text-grey mt-2">データがありません</p>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- クラス相性マトリックス -->
          <v-col cols="12">
            <v-card class="stats-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="info">mdi-grid</v-icon>
                クラス相性マトリックス
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-data-table
                  :headers="matchupHeaders"
                  :items="matchupData"
                  :loading="loading"
                  density="compact"
                  :items-per-page="15"
                  class="stats-table"
                >
                  <template #item.win_rate="{ item }">
                    <v-chip :color="getWinRateColor(item.win_rate)" variant="flat" size="small">
                      {{ item.total_matches }}戦 {{ item.win_rate.toFixed(1) }}%
                    </v-chip>
                  </template>
                  <template #no-data>
                    <div class="no-data-placeholder py-8">
                      <v-icon size="48" color="grey">mdi-table-off</v-icon>
                      <p class="text-body-2 text-grey mt-2">相性データがありません</p>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- クラス別勝率グラフ -->
          <v-col cols="12" lg="6">
            <v-card class="stats-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-chart-bar</v-icon>
                クラス別勝率
              </v-card-title>
              <v-divider />
              <v-card-text>
                <Bar
                  v-if="classWinRateChartData.labels.length > 0"
                  :data="classWinRateChartData"
                  :options="classWinRateChartOptions"
                  style="height: 300px;"
                />
                <div v-else class="no-data-placeholder py-8">
                  <v-icon size="48" color="grey">mdi-chart-bar</v-icon>
                  <p class="text-body-2 text-grey mt-2">データがありません</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 対戦相手アーキタイプ別対戦数円グラフ -->
          <v-col cols="12" lg="6">
            <v-card class="stats-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="warning">mdi-chart-pie</v-icon>
                対戦相手アーキタイプ別対戦数
              </v-card-title>
              <v-divider />
              <v-card-text>
                <Pie
                  v-if="opponentArchetypeMatchCountChartData.labels.length > 0"
                  :data="opponentArchetypeMatchCountChartData"
                  :options="opponentArchetypeMatchCountChartOptions"
                  style="height: 300px;"
                />
                <div v-else class="no-data-placeholder py-8">
                  <v-icon size="48" color="grey">mdi-chart-pie</v-icon>
                  <p class="text-body-2 text-grey mt-2">データがありません</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- クラス相性マトリックス ヒートマップ -->
          <v-col cols="12">
            <v-card class="stats-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="info">mdi-grid</v-icon>
                クラス相性マトリックス
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div v-if="allUniqueClasses.length > 0" class="heatmap-container">
                  <table class="heatmap-table">
                    <thead>
                      <tr>
                        <th>自分 \ 相手</th>
                        <th v-for="oClass in allUniqueClasses" :key="oClass">{{ oClass }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="pClass in allUniqueClasses" :key="pClass">
                        <th>{{ pClass }}</th>
                        <td
                          v-for="oClass in allUniqueClasses"
                          :key="oClass"
                          :class="getWinRateColor(matchupMatrix[pClass][oClass].win_rate)"
                          class="heatmap-cell"
                        >
                          <template v-if="matchupMatrix[pClass][oClass].total_matches > 0">
                            {{ matchupMatrix[pClass][oClass].win_rate.toFixed(1) }}%
                            <div class="text-caption text-grey-darken-1">({{ matchupMatrix[pClass][oClass].total_matches }}戦)</div>
                          </template>
                          <template v-else>
                            -
                          </template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="no-data-placeholder py-8">
                  <v-icon size="48" color="grey">mdi-grid</v-icon>
                  <p class="text-body-2 text-grey mt-2">相性データがありません</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- グループ別統計 (Beginner-AAのみ) -->
          <v-col cols="12" lg="6" v-if="selectedRankTab === 'Beginner-AA'">
            <v-card class="stats-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="purple">mdi-shape</v-icon>
                グループ別成績
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-data-table
                  :headers="groupStatsHeaders"
                  :items="groupStats"
                  :loading="loading"
                  density="compact"
                  :items-per-page="10"
                  class="stats-table"
                >
                  <template #item.win_rate="{ item }">
                    <v-chip :color="getWinRateColor(item.win_rate)" variant="flat" size="small">
                      {{ item.win_rate.toFixed(1) }}%
                    </v-chip>
                  </template>
                  <template #no-data>
                    <div class="no-data-placeholder py-8">
                      <v-icon size="48" color="grey">mdi-table-off</v-icon>
                      <p class="text-body-2 text-grey mt-2">データがありません</p>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 時間帯別勝率 -->
          <v-col cols="12" :lg="selectedRankTab === 'Beginner-AA' ? 6 : 12">
            <v-card class="stats-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="orange">mdi-clock-outline</v-icon>
                時間帯別勝率
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-data-table
                  :headers="timeStatsHeaders"
                  :items="timeStats"
                  :loading="loading"
                  density="compact"
                  :items-per-page="10"
                  class="stats-table"
                >
                  <template #item.win_rate="{ item }">
                    <v-chip :color="getWinRateColor(item.win_rate)" variant="flat" size="small">
                      {{ item.win_rate.toFixed(1) }}%
                    </v-chip>
                  </template>
                  <template #no-data>
                    <div class="no-data-placeholder py-8">
                      <v-icon size="48" color="grey">mdi-table-off</v-icon>
                      <p class="text-body-2 text-grey mt-2">データがありません</p>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '../services/api'
import type { Match } from '@/types'
import StatCard from '../components/duel/StatCard.vue'
import { Bar, Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)


const api = useApi()

const loading = ref(true)
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedRankTab = ref<'Beginner-AA' | 'Master' | 'Grand Master'>('Beginner-AA')

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})
const months = Array.from({ length: 12 }, (_, i) => ({ title: `${i + 1}月`, value: i + 1 }))

const allMatches = ref<Match[]>([])

// 統計データ
const stats = ref({
  totalMatches: 0,
  overallWinRate: 0,
  firstWinRate: 0,
  secondWinRate: 0
})

const classStats = ref<any[]>([])
const opponentStats = ref<any[]>([])
const archetypeStats = ref<any[]>([])
const opponentArchetypeStats = ref<any[]>([])
const matchupData = ref<any[]>([])
const groupStats = ref<any[]>([])
const timeStats = ref<any[]>([])

// テーブルヘッダー
const classStatsHeaders = [
  { title: 'クラス', key: 'class_name', sortable: true },
  { title: '試合数', key: 'total', sortable: true },
  { title: '勝利', key: 'wins', sortable: true },
  { title: '敗北', key: 'losses', sortable: true },
  { title: '勝率', key: 'win_rate', sortable: true }
]

const opponentStatsHeaders = [
  { title: '相手クラス', key: 'class_name', sortable: true },
  { title: '試合数', key: 'total', sortable: true },
  { title: '勝利', key: 'wins', sortable: true },
  { title: '敗北', key: 'losses', sortable: true },
  { title: '勝率', key: 'win_rate', sortable: true }
]

const archetypeStatsHeaders = [
  { title: 'クラス', key: 'class_name', sortable: true },
  { title: 'アーキタイプ', key: 'archetype', sortable: true },
  { title: '試合数', key: 'total', sortable: true },
  { title: '勝率', key: 'win_rate', sortable: true }
]

const opponentArchetypeStatsHeaders = [
  { title: '相手クラス', key: 'class_name', sortable: true },
  { title: '相手アーキタイプ', key: 'archetype', sortable: true },
  { title: '試合数', key: 'total', sortable: true },
  { title: '勝率', key: 'win_rate', sortable: true }
]

const matchupHeaders = [
  { title: '自分', key: 'player_class', sortable: true },
  { title: '相手', key: 'opponent_class', sortable: true },
  { title: '成績', key: 'win_rate', sortable: true }
]

const groupStatsHeaders = [
  { title: 'グループ', key: 'group_name', sortable: true },
  { title: '試合数', key: 'total', sortable: true },
  { title: '勝利', key: 'wins', sortable: true },
  { title: '敗北', key: 'losses', sortable: true },
  { title: '勝率', key: 'win_rate', sortable: true }
]

const timeStatsHeaders = [
  { title: '時間帯', key: 'time_range', sortable: false },
  { title: '試合数', key: 'total', sortable: true },
  { title: '勝利', key: 'wins', sortable: true },
  { title: '敗北', key: 'losses', sortable: true },
  { title: '勝率', key: 'win_rate', sortable: true }
]

const classWinRateChartData = computed(() => {
  const labels = classStats.value.map(s => s.class_name)
  const data = classStats.value.map(s => s.win_rate)
  const backgroundColors = data.map(rate => getWinRateColor(rate) === 'success' ? '#4CAF50' : getWinRateColor(rate) === 'warning' ? '#FF9800' : '#f44336')

  return {
    labels: labels,
    datasets: [
      {
        label: '勝率 (%)',
        backgroundColor: backgroundColors,
        data: data
      }
    ]
  }
})

const classWinRateChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'クラス別勝率',
      font: {
        size: 16
      },
      color: '#212121'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: '勝率 (%)',
        color: '#212121'
      },
      ticks: {
        color: '#212121'
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      ticks: {
        color: '#212121'
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  }
}

const opponentArchetypeMatchCountChartData = computed(() => {
  const labels = opponentArchetypeStats.value.map(s => s.archetype)
  const data = opponentArchetypeStats.value.map(s => s.total)
  const backgroundColors = [
    '#2196F3', '#FF9800', '#4CAF50', '#E91E63', '#9C27B0',
    '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#F44336'
  ] // Example colors

  return {
    labels: labels,
    datasets: [
      {
        backgroundColor: backgroundColors.slice(0, labels.length),
        data: data
      }
    ]
  }
})

const opponentArchetypeMatchCountChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#212121'
      }
    },
    title: {
      display: true,
      text: '対戦相手アーキタイプ別対戦数',
      font: {
        size: 16
      },
      color: '#212121'
    }
  }
} as const

const getWinRateColor = (winRate: number) => {
  if (winRate >= 60) return 'success'
  if (winRate >= 50) return 'warning'
  return 'error'
}

const allUniqueClasses = computed(() => {
  const classes = new Set<string>()
  matchupData.value.forEach(item => {
    classes.add(item.player_class)
    classes.add(item.opponent_class)
  })
  return Array.from(classes).sort()
})

const matchupMatrix = computed(() => {
  const matrix: { [playerClass: string]: { [opponentClass: string]: { total_matches: number; win_rate: number } } } = {}
  const classes = allUniqueClasses.value

  classes.forEach(pClass => {
    matrix[pClass] = {}
    classes.forEach(oClass => {
      matrix[pClass][oClass] = { total_matches: 0, win_rate: 0 } // Default to 0
    })
  })

  matchupData.value.forEach(item => {
    if (matrix[item.player_class] && matrix[item.player_class][item.opponent_class]) {
      matrix[item.player_class][item.opponent_class] = {
        total_matches: item.total_matches,
        win_rate: item.win_rate
      }
    }
  })
  return matrix
})

const fetchStatistics = async () => {
  loading.value = true
  try {
    const result = await api.getMatches()
    if (result.success && result.data) {
      allMatches.value = result.data

      // フィルタリング
      const filtered = allMatches.value.filter(match => {
        const matchDate = new Date(match.match_date)
        const yearMatch = matchDate.getFullYear() === selectedYear.value
        const monthMatch = matchDate.getMonth() + 1 === selectedMonth.value
        
        let rankMatch = false
        if (selectedRankTab.value === 'Beginner-AA') {
          rankMatch = ['Beginner', 'D', 'C', 'B', 'A', 'AA'].includes(match.player_rank)
        } else if (selectedRankTab.value === 'Master') {
          rankMatch = match.player_rank === 'Master'
        } else if (selectedRankTab.value === 'Grand Master') {
          rankMatch = match.player_rank === 'Grand Master'
        }
        
        return yearMatch && monthMatch && rankMatch
      })

      calculateStats(filtered)
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  } finally {
    loading.value = false
  }
}

const calculateStats = (matches: Match[]) => {
  const total = matches.length
  const wins = matches.filter(m => m.result === 1).length
  
  const firstMatches = matches.filter(m => m.is_first === 1)
  const firstWins = firstMatches.filter(m => m.result === 1).length
  
  const secondMatches = matches.filter(m => m.is_first === 0)
  const secondWins = secondMatches.filter(m => m.result === 1).length

  stats.value = {
    totalMatches: total,
    overallWinRate: total > 0 ? (wins / total) * 100 : 0,
    firstWinRate: firstMatches.length > 0 ? (firstWins / firstMatches.length) * 100 : 0,
    secondWinRate: secondMatches.length > 0 ? (secondWins / secondMatches.length) * 100 : 0
  }

  // 使用クラス別統計
  const classCounts: any = {}
  matches.forEach(m => {
    if (!classCounts[m.player_class]) {
      classCounts[m.player_class] = { wins: 0, losses: 0, total: 0 }
    }
    classCounts[m.player_class].total++
    if (m.result === 1) classCounts[m.player_class].wins++
    else classCounts[m.player_class].losses++
  })
  
  classStats.value = Object.entries(classCounts).map(([name, data]: [string, any]) => ({
    class_name: name,
    total: data.total,
    wins: data.wins,
    losses: data.losses,
    win_rate: data.total > 0 ? (data.wins / data.total) * 100 : 0
  })).sort((a, b) => b.total - a.total)

  // 対戦相手クラス別統計
  const opponentCounts: any = {}
  matches.forEach(m => {
    if (!opponentCounts[m.opponent_class]) {
      opponentCounts[m.opponent_class] = { wins: 0, losses: 0, total: 0 }
    }
    opponentCounts[m.opponent_class].total++
    if (m.result === 1) opponentCounts[m.opponent_class].wins++
    else opponentCounts[m.opponent_class].losses++
  })
  
  opponentStats.value = Object.entries(opponentCounts).map(([name, data]: [string, any]) => ({
    class_name: name,
    total: data.total,
    wins: data.wins,
    losses: data.losses,
    win_rate: data.total > 0 ? (data.wins / data.total) * 100 : 0
  })).sort((a, b) => b.total - a.total)

  // アーキタイプ別統計
  const archetypeCounts: any = {}
  matches.forEach(m => {
    if (m.player_archetype) {
      const key = `${m.player_class}|${m.player_archetype}`
      if (!archetypeCounts[key]) {
        archetypeCounts[key] = { class_name: m.player_class, archetype: m.player_archetype, wins: 0, total: 0 }
      }
      archetypeCounts[key].total++
      if (m.result === 1) archetypeCounts[key].wins++
    }
  })
  
  archetypeStats.value = Object.values(archetypeCounts).map((data: any) => ({
    ...data,
    win_rate: data.total > 0 ? (data.wins / data.total) * 100 : 0
  })).sort((a: any, b: any) => b.total - a.total)

  // 対戦相手アーキタイプ別統計
  const opponentArchetypeCounts: any = {}
  matches.forEach(m => {
    const archetype = m.opponent_archetype || 'アーキタイプなし'
    const key = `${m.opponent_class}|${archetype}`
    if (!opponentArchetypeCounts[key]) {
      opponentArchetypeCounts[key] = { class_name: m.opponent_class, archetype: archetype, wins: 0, total: 0 }
    }
    opponentArchetypeCounts[key].total++
    if (m.result === 1) opponentArchetypeCounts[key].wins++
  })
  
  opponentArchetypeStats.value = Object.values(opponentArchetypeCounts).map((data: any) => ({
    ...data,
    win_rate: data.total > 0 ? (data.wins / data.total) * 100 : 0
  })).sort((a: any, b: any) => b.total - a.total)

  // クラス相性マトリックス
  const matchups: any = {}
  matches.forEach(m => {
    const key = `${m.player_class}|${m.opponent_class}`
    if (!matchups[key]) {
      matchups[key] = { player_class: m.player_class, opponent_class: m.opponent_class, wins: 0, total: 0 }
    }
    matchups[key].total++
    if (m.result === 1) matchups[key].wins++
  })
  
  matchupData.value = Object.values(matchups).map((data: any) => ({
    ...data,
    total_matches: data.total,
    win_rate: data.total > 0 ? (data.wins / data.total) * 100 : 0
  })).sort((a: any, b: any) => b.total - a.total)

  // グループ別統計
  if (selectedRankTab.value === 'Beginner-AA') {
    const groupCounts: any = {}
    matches.forEach(m => {
      if (m.player_group) {
        if (!groupCounts[m.player_group]) {
          groupCounts[m.player_group] = { wins: 0, losses: 0, total: 0 }
        }
        groupCounts[m.player_group].total++
        if (m.result === 1) groupCounts[m.player_group].wins++
        else groupCounts[m.player_group].losses++
      }
    })
    
    groupStats.value = Object.entries(groupCounts).map(([name, data]: [string, any]) => ({
      group_name: name,
      total: data.total,
      wins: data.wins,
      losses: data.losses,
      win_rate: data.total > 0 ? (data.wins / data.total) * 100 : 0
    })).sort((a, b) => b.total - a.total)
  }

  // 時間帯別統計
  const timeCounts: any = {}
  const timeRanges = ['0-5時', '6-11時', '12-17時', '18-23時']
  matches.forEach(m => {
    const hour = new Date(m.match_date).getHours()
    let range = ''
    if (hour >= 0 && hour < 6) range = '0-5時'
    else if (hour >= 6 && hour < 12) range = '6-11時'
    else if (hour >= 12 && hour < 18) range = '12-17時'
    else range = '18-23時'
    
    if (!timeCounts[range]) {
      timeCounts[range] = { wins: 0, losses: 0, total: 0 }
    }
    timeCounts[range].total++
    if (m.result === 1) timeCounts[range].wins++
    else timeCounts[range].losses++
  })
  
  timeStats.value = timeRanges.map(range => {
    const data = timeCounts[range] || { wins: 0, losses: 0, total: 0 }
    return {
      time_range: range,
      total: data.total,
      wins: data.wins,
      losses: data.losses,
      win_rate: data.total > 0 ? (data.wins / data.total) * 100 : 0
    }
  })
}

onMounted(() => {
  fetchStatistics()
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



.stats-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(224, 224, 224, 0.8);
  border-radius: 12px !important;
  height: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.no-data-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.stats-table {
  background: transparent !important;

  :deep(.v-data-table__th) {
    background: rgba(245, 245, 245, 0.8) !important;
    color: rgba(33, 33, 33, 0.87) !important;
    font-weight: 600 !important;
  }

  :deep(.v-data-table__td) {
    border-bottom: 1px solid rgba(224, 224, 224, 0.5) !important;
    color: rgba(33, 33, 33, 0.87) !important;
  }

  :deep(.v-data-table__tr:hover) {
    background: rgba(33, 150, 243, 0.05) !important;
  }
}

.heatmap-container {
  overflow-x: auto;
  width: 100%;
}

.heatmap-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  th,
  td {
    border: 1px solid rgba(224, 224, 224, 0.5);
    padding: 8px;
    text-align: center;
    min-width: 80px; /* Adjust as needed */
  }

  thead th {
    background-color: rgba(245, 245, 245, 0.8);
    font-weight: 600;
    color: rgba(33, 33, 33, 0.87);
    position: sticky;
    top: 0;
    z-index: 2;
  }

  tbody th {
    background-color: rgba(245, 245, 245, 0.8);
    font-weight: 600;
    color: rgba(33, 33, 33, 0.87);
    position: sticky;
    left: 0;
    z-index: 1;
  }

  tbody tr:hover {
    background-color: rgba(33, 150, 243, 0.05);
  }

  .heatmap-cell {
    color: rgba(33, 33, 33, 0.87);
    transition: background-color 0.3s ease;

    &.success {
      background-color: rgba(76, 175, 80, 0.2); /* Green */
    }
    &.warning {
      background-color: rgba(255, 152, 0, 0.2); /* Orange */
    }
    &.error {
      background-color: rgba(244, 67, 54, 0.2); /* Red */
    }
  }
}
</style>
