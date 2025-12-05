<template>
  <div class="cta-card bg-primary text-primary-foreground rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden">
    <slot />
  </div>
</template>

<style>
.cta-card {
  transition: transform 0.3s ease;
}

.cta-card:hover {
  transform: scale(1.02);
}
</style>