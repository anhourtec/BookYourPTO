<template>
  <div class="feature-card group bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl border border-border">
    <slot />
  </div>
</template>

<style>
.feature-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-8px);
}

.feature-card:hover .icon-bounce {
  animation: iconBounce 0.5s ease-in-out;
}

@keyframes iconBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>