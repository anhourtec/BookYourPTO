<template>
  <div 
    class="stat-item text-center"
    :class="delayClass"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  delay?: number
}>(), {
  delay: 0
})

const delayClass = computed(() => {
  if (props.delay === 100) return 'animation-delay-100'
  if (props.delay === 200) return 'animation-delay-200'
  return ''
})
</script>

<style>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.stat-item {
  animation: fadeInUp 0.6s ease-out forwards, pulse 3s ease-in-out infinite;
  opacity: 0;
  animation-delay: 0.6s;
}

.stat-item.animation-delay-100 {
  animation-delay: 0.7s;
}

.stat-item.animation-delay-200 {
  animation-delay: 0.8s;
}
</style>