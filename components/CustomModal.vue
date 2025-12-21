<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="modelValue"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

          <!-- Modal Content -->
          <div
            :class="[
              'relative bg-[rgb(var(--card))] rounded-lg shadow-2xl border border-[rgb(var(--border))] w-full',
              maxWidthClass
            ]"
            @click.stop
          >
            <slot></slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const maxWidthClass = computed(() => {
  const widthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  }
  return widthMap[props.maxWidth || 'lg']
})

const closeModal = () => {
  emit('update:modelValue', false)
}

// Close on ESC key (client-side only)
onMounted(() => {
  if (import.meta.client) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.modelValue) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleEscape)

    onUnmounted(() => {
      window.removeEventListener('keydown', handleEscape)
    })
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>