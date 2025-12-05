<template>
  <div class="hero-gradient absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />
</template>

<style>
@keyframes heroGradient {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.hero-gradient {
  animation: heroGradient 1s ease-out forwards;
}
</style>