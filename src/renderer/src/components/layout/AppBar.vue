<template>
  <v-app-bar elevation="0" class="app-bar">
    <div class="d-flex align-center ml-4">
      <v-avatar class="mr-3" size="64">
        <!-- The logo is imported in the script section and bound here -->
        <v-img :src="logo" alt="App Logo" />
      </v-avatar>
      <div>
        <span class="logo-text-shadva">{{ logoTextShadva }}</span>
        <span class="logo-text-log">{{ logoTextLog }}</span>
      </div>
    </div>

    <v-spacer />

    <!-- ナビゲーションボタン -->
    <v-btn
      prepend-icon="mdi-view-dashboard"
      :variant="currentPath === '/' ? 'flat' : 'text'"
      :color="currentPath === '/' ? 'primary' : undefined"
      @click="router.push('/')"
    >
      ダッシュボード
    </v-btn>
    <v-btn
      prepend-icon="mdi-chart-box"
      :variant="currentPath === '/statistics' ? 'flat' : 'text'"
      :color="currentPath === '/statistics' ? 'primary' : undefined"
      @click="router.push('/statistics')"
    >
      統計
    </v-btn>
    <v-btn
      prepend-icon="mdi-shape"
      :variant="currentPath === '/archetypes' ? 'flat' : 'text'"
      :color="currentPath === '/archetypes' ? 'primary' : undefined"
      @click="router.push('/archetypes')"
    >
      アーキタイプ管理
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
// The logo image is imported directly to be bundled by Vite.
// This is the most reliable way to handle assets in Electron/Vite.
import logo from '@renderer/assets/logo.jpg'

const router = useRouter()
const route = useRoute()

// Title text is defined locally for component self-containment.
const logoTextShadva = 'SHADVA'
const logoTextLog = 'LOG'

// 現在のパスを取得
const currentPath = computed(() => route.path)
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

/* Styles for the logo text to ensure it looks good after removing v-app-bar-title */
.logo-text-shadva {
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.5;
  color: #2196F3; /* 青色 */
}

.logo-text-log {
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.5;
  color: #FF9800; /* オレンジ色 */
}
</style>