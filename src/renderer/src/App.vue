<template>
  <v-app>
    <app-bar />

    <v-main>
      <router-view />
    </v-main>

    <!-- グローバル通知システム -->
    <toast-notification />

    <!-- グローバルローディングオーバーレイ -->
    <loading-overlay />
  </v-app>
</template>

<script setup lang="ts">
import AppBar from './components/layout/AppBar.vue'
import ToastNotification from './components/common/ToastNotification.vue'
import LoadingOverlay from './components/common/LoadingOverlay.vue'
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  overflow-x: hidden;
}
</style>
