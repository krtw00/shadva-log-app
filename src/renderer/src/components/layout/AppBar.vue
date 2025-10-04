<template>
  <v-app-bar elevation="0" class="app-bar">
    <div class="app-bar-glow"></div>

    <v-app-bar-nav-icon
      class="hidden-md-and-up"
      @click="$emit('toggle-drawer')"
    />

    <v-app-bar-title class="ml-4">
      <span class="text-primary font-weight-black">SHADVA</span>
      <span class="text-secondary font-weight-black">LOG</span>
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
  background: rgba(18, 22, 46, 0.95) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 217, 255, 0.1);
  position: relative;
  overflow: hidden;

  .v-btn,
  .v-chip {
    font-size: 20px;
  }
}

.app-bar-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #00d9ff, #b536ff, #ff2d95);
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>
