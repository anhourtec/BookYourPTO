<template>
  <div 
    class="fade-in-up"
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
  if (props.delay === 600) return 'animation-delay-600'
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

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.animation-delay-100 { animation-delay: 0.1s; }
.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-300 { animation-delay: 0.3s; }
.animation-delay-400 { animation-delay: 0.4s; }
.animation-delay-500 { animation-delay: 0.5s; }
.animation-delay-600 { animation-delay: 0.6s; }
</style>