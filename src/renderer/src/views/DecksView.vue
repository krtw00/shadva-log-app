<template>
  <v-app>
    <!-- メインコンテンツ -->
    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <h1 class="text-h4 mb-6" style="color: #212121">デッキ管理</h1>

        <v-card class="deck-card">
          <v-card-title class="d-flex align-center pa-4">
            <v-icon class="mr-2" color="primary">mdi-cards</v-icon>
            <span class="text-h6">デッキ管理機能は現在開発中です。</span>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4">
            <div class="text-center pa-8">
              <v-icon size="64" color="grey">mdi-tools</v-icon>
              <p class="text-body-1 text-grey mt-4">今後のアップデートで実装予定です。</p>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// デッキ管理機能は現在開発中のため、ダミーのビューを表示
</script>

<style scoped lang="scss">
.main-content {
  background: #ffffff;
  min-height: 100vh;
}

.deck-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(224, 224, 224, 0.8);
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
</style>
