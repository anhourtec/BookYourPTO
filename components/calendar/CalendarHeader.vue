<template>
  <div class="flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
        {{ initials }}
      </div>
      <div>
        <div class="font-semibold text-gray-900 dark:text-white">
          {{ fullName }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ subtitle }}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
        @click="$emit('prev-year')"
      >
        <Icon name="lucide:chevron-left" class="w-5 h-5" />
      </button>
      <div class="min-w-[120px] text-center">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Calendar year
        </div>
        <div class="font-semibold text-gray-900 dark:text-white">
          {{ year }}
        </div>
      </div>
      <button
        type="button"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
        @click="$emit('next-year')"
      >
        <Icon name="lucide:chevron-right" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  year: number
  firstName?: string
  lastName?: string
  jobTitle?: string
  departmentName?: string
}

const props = defineProps<Props>()

const fullName = computed(() => {
  if (!props.firstName && !props.lastName) return 'My calendar'
  return `${props.firstName ?? ''} ${props.lastName ?? ''}`.trim()
})

const initials = computed(() => {
  const f = props.firstName?.[0] ?? ''
  const l = props.lastName?.[0] ?? ''
  const val = `${f}${l}`.trim()
  return val || 'U'
})

const subtitle = computed(() => {
  if (props.jobTitle && props.departmentName) {
    return `${props.jobTitle} · ${props.departmentName}`
  }
  if (props.jobTitle) return props.jobTitle
  if (props.departmentName) return props.departmentName
  return 'Time off overview'
})

defineEmits<{
  'prev-year': []
  'next-year': []
}>()
</script>
