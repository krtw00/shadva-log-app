<template>
  <v-card class="stat-card" :class="`stat-card--${color}`">
    <div class="stat-card__glow"></div>
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between">
        <div>
          <p class="stat-card__title text-caption mb-2" style="color: rgba(0,0,0,0.6);">{{ title }}</p>
          <p class="stat-card__value text-h4 font-weight-bold" style="color: #212121;">{{ value }}</p>
        </div>
        <div class="stat-card__icon-wrapper">
          <v-icon :icon="icon" size="40" :class="`text-${color}`" style="-webkit-text-fill-color: initial;" />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon: string
  color: string
}>()
</script>

<style scoped lang="scss">
.stat-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(224, 224, 224, 0.8);
  border-radius: 12px !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: rgba(33, 150, 243, 0.3);
    
    .stat-card__glow {
      opacity: 1;
    }
  }

  &__glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  &--primary .stat-card__glow {
    background: linear-gradient(90deg, #2196F3, #1976D2);
  }

  &--success .stat-card__glow {
    background: linear-gradient(90deg, #4CAF50, #388E3C);
  }

  &--warning .stat-card__glow {
    background: linear-gradient(90deg, #FF9800, #F57C00);
  }

  &--secondary .stat-card__glow {
    background: linear-gradient(90deg, #9C27B0, #7B1FA2);
  }

  &--yellow .stat-card__glow {
    background: linear-gradient(90deg, #FFEB3B, #FDD835);
  }

  &--teal .stat-card__glow {
    background: linear-gradient(90deg, #009688, #00796B);
  }

  &--info .stat-card__glow {
    background: linear-gradient(90deg, #2196F3, #1976D2);
  }

  &--purple .stat-card__glow {
    background: linear-gradient(90deg, #9C27B0, #7B1FA2);
  }

  &__title {
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 20px !important;
  }

  &__value {
    color: #212121;
  }

  &__icon-wrapper {
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(33, 150, 243, 0.08);
    border-radius: 50%;
  }
}
</style>
