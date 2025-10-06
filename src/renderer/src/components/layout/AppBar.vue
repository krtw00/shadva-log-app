<template>
  <v-app-bar elevation="0" class="app-bar">
    <v-app-bar-nav-icon
      class="hidden-md-and-up"
      @click="$emit('toggle-drawer')"
    />

    <v-app-bar-title class="ml-4 d-flex align-center">
      <img
        v-if="AppConfig.appLogoImage"
        :src="AppConfig.appLogoImage"
        alt="App Logo"
        class="mr-2"
        style="height: 32px; width: auto;"
      />
      <span class="logo-text-supicha">{{ AppConfig.appLogoTextSupicha }}</span>
      <span class="logo-text-log">{{ AppConfig.appLogoTextLog }}</span>
    </v-app-bar-title>

    <v-spacer />

    <template v-for="item in navItems" :key="item.view">
      <v-btn
        v-if="currentView !== item.view"
        :prepend-icon="item.icon"
        variant="text"
        class="hidden-sm-and-down"
        @click="router.push(item.path)"
      >
        {{ item.name }}
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AppConfig } from '@/config/app-config'

defineProps<{
  currentView: 'dashboard' | 'decks' | 'statistics' | 'archetypemanagement'
}>()

defineEmits(['toggle-drawer'])

const router = useRouter()

const navItems = [
  { name: 'ダッシュボード', path: '/', view: 'dashboard', icon: 'mdi-view-dashboard' },
  { name: 'デッキ管理', path: '/decks', view: 'decks', icon: 'mdi-cards' },
  { name: '統計', path: '/statistics', view: 'statistics', icon: 'mdi-chart-bar' },
  { name: 'アーキタイプ管理', path: '/archetypes', view: 'archetypemanagement', icon: 'mdi-shape' }
]
</script>

<style scoped lang="scss">
.app-bar {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(224, 224, 224, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  .v-btn,
  .v-chip {
    font-size: 20px;
  }
}
</style>
