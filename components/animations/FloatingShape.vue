<template>
  <div 
    class="floating-shape absolute rounded-full blur-3xl bg-foreground/5"
    :class="[sizeClass, positionClass, variantClass]"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 1 | 2
  size?: 'sm' | 'md' | 'lg'
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}>(), {
  variant: 1,
  size: 'md',
  position: 'top-left'
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-48 h-48',
    md: 'w-72 h-72',
    lg: 'w-96 h-96'
  }
  return sizes[props.size]
})

const positionClass = computed(() => {
  const positions = {
    'top-left': 'top-20 left-10',
    'top-right': 'top-20 right-10',
    'bottom-left': 'bottom-20 left-10',
    'bottom-right': 'bottom-20 right-10'
  }
  return positions[props.position]
})

const variantClass = computed(() => {
  return props.variant === 2 ? 'floating-shape-2' : 'floating-shape-1'
})
</script>

<style>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.floating-shape {
  animation: float 6s ease-in-out infinite;
}

.floating-shape-1 {
  animation-delay: 0s;
  animation-duration: 8s;
}

.floating-shape-2 {
  animation-delay: 1s;
  animation-duration: 10s;
}
</style>