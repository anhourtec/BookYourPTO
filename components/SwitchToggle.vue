<template>
  <button
    type="button"
    @click="handleClick"
    :disabled="disabled"
    :class="[
      modelValue ? 'bg-[rgb(var(--primary))]' : 'bg-gray-200 dark:bg-gray-700',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90',
      'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]'
    ]"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
  >
    <span
      :class="[
        modelValue ? 'translate-x-5' : 'translate-x-0',
        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out'
      ]"
    >
      <!-- Optional: Add icons inside the toggle circle -->
      <span
        v-if="showIcons"
        :class="[
          modelValue ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
        ]"
        aria-hidden="true"
      >
        <Icon name="lucide:check" class="h-3 w-3 text-[rgb(var(--primary))]" />
      </span>
      <span
        v-if="showIcons"
        :class="[
          modelValue ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
        ]"
        aria-hidden="true"
      >
        <Icon name="lucide:x" class="h-3 w-3 text-gray-400" />
      </span>
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  modelValue: { 
    type: Boolean, 
    required: true 
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showIcons: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: 'Toggle switch'
  }
})

const emit = defineEmits(['update:modelValue'])

const handleClick = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>