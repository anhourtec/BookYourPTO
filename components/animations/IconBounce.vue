<template>
  <div 
    class="icon-bounce"
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
  if (props.delay === 0) return ''
  if (props.delay === 100) return 'animation-delay-100'
  if (props.delay === 200) return 'animation-delay-200'
  if (props.delay === 300) return 'animation-delay-300'
  if (props.delay === 400) return 'animation-delay-400'
  if (props.delay === 500) return 'animation-delay-500'
  return ''
})
</script>

<style>
@keyframes iconBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.icon-bounce {
  animation: iconBounce 2s ease-in-out infinite;
}

.animation-delay-100 { animation-delay: 0.1s; }
.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-300 { animation-delay: 0.3s; }
.animation-delay-400 { animation-delay: 0.4s; }
.animation-delay-500 { animation-delay: 0.5s; }
</style>