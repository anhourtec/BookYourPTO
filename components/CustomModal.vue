<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="emit('update:modelValue', false)"
      >
        <Transition name="modal-slide">
          <div
            v-if="modelValue"
            class="bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden mx-4"
          >
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: transform 0.3s ease;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  transform: scale(0.9) translateY(-20px);
}
</style>
