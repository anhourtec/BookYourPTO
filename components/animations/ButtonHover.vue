<template>
  <div class="button-hover inline-block">
    <slot />
  </div>
</template>

<style>
.button-hover {
  transition: all 0.3s ease;
}

.button-hover:hover {
  transform: scale(1.05);
}
</style>