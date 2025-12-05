<template>
  <span class="animate-gradient inline-block">
    <slot />
  </span>
</template>

<style>
@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}
</style>