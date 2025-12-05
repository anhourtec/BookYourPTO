<template>
  <div class="space-y-6">
    <!-- Filter Section Wrapper -->
    <div v-for="section in sections" :key="section.id" class="mb-6">
      <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-3">
        {{ section.label }}
      </label>

      <!-- Dropdown/Select -->
      <select
        v-if="section.type === 'select'"
        :value="section.value"
        @change="$emit('update:filter', section.id, ($event.target as HTMLSelectElement).value)"
        class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))]"
      >
        <option v-for="option in section.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <!-- Radio Group -->
      <div v-else-if="section.type === 'radio'" class="space-y-2">
        <label
          v-for="option in section.options"
          :key="option.value"
          class="flex items-center cursor-pointer hover:bg-[rgb(var(--muted))]/50 p-2 rounded-lg transition-colors"
        >
          <input
            type="radio"
            :name="section.id"
            :value="option.value"
            :checked="section.value === option.value"
            @change="$emit('update:filter', section.id, option.value)"
            class="mr-3 text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))]"
          />
          <span class="text-sm text-[rgb(var(--foreground))]">{{ option.label }}</span>
        </label>
      </div>

      <!-- Checkbox Group -->
      <div v-else-if="section.type === 'checkbox'" class="space-y-2">
        <label
          v-for="option in section.options"
          :key="option.value"
          class="flex items-center justify-between cursor-pointer hover:bg-[rgb(var(--muted))]/50 p-2 rounded-lg transition-colors"
        >
          <div class="flex items-center">
            <input
              type="checkbox"
              :value="option.value"
              :checked="Array.isArray(section.value) && section.value.includes(option.value)"
              @change="toggleCheckbox(section.id, option.value, section.value as string[])"
              class="mr-3 text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))] rounded"
            />
            <span class="text-sm text-[rgb(var(--foreground))]">{{ option.label }}</span>
          </div>
          <span v-if="option.badge" class="text-xs text-[rgb(var(--muted-foreground))]">
            {{ option.badge }}
          </span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FilterOption {
  label: string
  value: string
  badge?: string
}

interface FilterSection {
  id: string
  label: string
  type: 'select' | 'radio' | 'checkbox'
  value: string | string[]
  options: FilterOption[]
}

defineProps<{
  sections: FilterSection[]
}>()

const emit = defineEmits<{
  'update:filter': [id: string, value: string | string[]]
}>()

const toggleCheckbox = (sectionId: string, value: string, currentValues: string[]) => {
  const newValue = currentValues.includes(value)
    ? currentValues.filter(v => v !== value)
    : [...currentValues, value]
  emit('update:filter', sectionId, newValue)
}
</script>
