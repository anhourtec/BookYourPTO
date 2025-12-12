<template>
  <div>
    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5 sm:mb-2">
      Pick an icon
    </label>
    
    <!-- Selected Icon Display + Trigger -->
    <button
      type="button"
      @click="showPicker = !showPicker"
      class="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] text-sm sm:text-base hover:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <Icon
          v-if="modelValue"
          :name="modelValue"
          class="w-5 h-5"
          :style="{ color: color }"
        />
        <Icon
          v-else
          name="lucide:calendar"
          class="w-5 h-5 text-[rgb(var(--muted-foreground))]"
        />
        <span>{{ selectedIconLabel }}</span>
      </div>
      <Icon 
        name="lucide:chevron-down" 
        class="w-4 h-4 text-[rgb(var(--muted-foreground))] transition-transform"
        :class="{ 'rotate-180': showPicker }"
      />
    </button>

    <!-- Icon Picker Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showPicker"
        v-click-outside="() => showPicker = false"
        class="absolute z-50 mt-2 left-0 right-0 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-xl overflow-hidden"
      >
        <!-- Search -->
        <div class="p-3 border-b border-[rgb(var(--border))]">
          <div class="relative">
            <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search icons..."
              class="w-full pl-9 pr-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        <!-- Icon Grid -->
        <div class="p-3 max-h-64 overflow-y-auto overflow-x-hidden">
          <div class="grid grid-cols-6 gap-1.5 sm:gap-2">
            <!-- Default/None Option -->
            <button
              type="button"
              @click="selectIcon('')"
              :class="[
                'flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all hover:bg-[rgb(var(--muted))]',
                !modelValue
                  ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10'
                  : 'border-transparent'
              ]"
              title="Default"
            >
              <Icon name="lucide:x" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <span class="text-[9px] mt-0.5 text-[rgb(var(--muted-foreground))] truncate w-full">None</span>
            </button>

            <!-- Icon Options -->
            <button
              v-for="icon in filteredIcons"
              :key="icon.value"
              type="button"
              @click="selectIcon(icon.value)"
              :class="[
                'flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all hover:bg-[rgb(var(--muted))]',
                modelValue === icon.value
                  ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10'
                  : 'border-transparent'
              ]"
              :title="icon.label"
            >
              <Icon 
                :name="icon.value" 
                class="w-5 h-5"
                :style="{ color: color }"
              />
              <span class="text-[9px] mt-0.5 text-[rgb(var(--muted-foreground))] truncate w-full text-center">
                {{ icon.label }}
              </span>
            </button>
          </div>

          <!-- No Results -->
          <div v-if="filteredIcons.length === 0" class="text-center py-8">
            <Icon name="lucide:search-x" class="w-8 h-8 mx-auto text-[rgb(var(--muted-foreground))] mb-2" />
            <p class="text-sm text-[rgb(var(--muted-foreground))]">No icons found</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface IconOption {
  value: string
  label: string
  keywords: string[]
}

interface Props {
  modelValue: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#3b82f6'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Icon library - organized by category
const ICONS: IconOption[] = [
  // Time off & vacation
  { value: 'lucide:umbrella-off', label: 'Umbrella', keywords: ['vacation', 'holiday', 'rain', 'weather'] },
  { value: 'lucide:palmtree', label: 'Palm Tree', keywords: ['vacation', 'holiday', 'tropical', 'beach'] },
  { value: 'lucide:plane', label: 'Plane', keywords: ['travel', 'vacation', 'flight', 'trip'] },
  { value: 'lucide:plane-takeoff', label: 'Takeoff', keywords: ['travel', 'vacation', 'flight', 'departure'] },
  { value: 'lucide:plane-landing', label: 'Landing', keywords: ['travel', 'vacation', 'flight', 'arrival'] },
  { value: 'lucide:luggage', label: 'Luggage', keywords: ['travel', 'vacation', 'trip', 'suitcase'] },
  { value: 'lucide:map', label: 'Map', keywords: ['travel', 'vacation', 'trip', 'navigation'] },
  { value: 'lucide:compass', label: 'Compass', keywords: ['travel', 'vacation', 'navigation', 'direction'] },
  
  // Medical & health
  { value: 'lucide:heart-pulse', label: 'Heart Pulse', keywords: ['medical', 'health', 'sick', 'hospital'] },
  { value: 'lucide:stethoscope', label: 'Stethoscope', keywords: ['medical', 'health', 'doctor', 'sick'] },
  { value: 'lucide:pill', label: 'Pill', keywords: ['medical', 'health', 'sick', 'medicine'] },
  { value: 'lucide:syringe', label: 'Syringe', keywords: ['medical', 'health', 'vaccine', 'hospital'] },
  { value: 'lucide:bandage', label: 'Bandage', keywords: ['medical', 'health', 'injury', 'sick'] },
  { value: 'lucide:thermometer', label: 'Thermometer', keywords: ['medical', 'health', 'sick', 'fever'] },
  { value: 'lucide:activity', label: 'Activity', keywords: ['medical', 'health', 'heartbeat', 'vital'] },
  
  // Family & parental
  { value: 'lucide:baby', label: 'Baby', keywords: ['family', 'parental', 'maternity', 'paternity'] },
  { value: 'lucide:home', label: 'Home', keywords: ['family', 'house', 'personal', 'remote'] },
  { value: 'lucide:heart', label: 'Heart', keywords: ['family', 'care', 'love', 'compassion'] },
  { value: 'lucide:users', label: 'Users', keywords: ['family', 'team', 'group', 'meeting'] },
  
  // Work & professional
  { value: 'lucide:briefcase', label: 'Briefcase', keywords: ['work', 'business', 'professional', 'office'] },
  { value: 'lucide:laptop', label: 'Laptop', keywords: ['work', 'remote', 'computer', 'wfh'] },
  { value: 'lucide:monitor', label: 'Monitor', keywords: ['work', 'computer', 'office', 'desk'] },
  { value: 'lucide:coffee', label: 'Coffee', keywords: ['break', 'work', 'office', 'meeting'] },
  { value: 'lucide:presentation', label: 'Presentation', keywords: ['work', 'meeting', 'conference', 'training'] },
  
  // Education & training
  { value: 'lucide:graduation-cap', label: 'Graduation', keywords: ['study', 'education', 'training', 'learning'] },
  { value: 'lucide:book-open', label: 'Book', keywords: ['study', 'education', 'learning', 'reading'] },
  { value: 'lucide:school', label: 'School', keywords: ['education', 'study', 'learning', 'training'] },
  { value: 'lucide:library', label: 'Library', keywords: ['study', 'education', 'books', 'learning'] },
  
  // Special occasions
  { value: 'lucide:party-popper', label: 'Party', keywords: ['celebration', 'event', 'special', 'festive'] },
  { value: 'lucide:gift', label: 'Gift', keywords: ['celebration', 'birthday', 'special', 'present'] },
  { value: 'lucide:cake', label: 'Cake', keywords: ['celebration', 'birthday', 'special', 'party'] },
  { value: 'lucide:sparkles', label: 'Sparkles', keywords: ['celebration', 'special', 'festive', 'event'] },
  
  // Religious & cultural
  { value: 'lucide:church', label: 'Church', keywords: ['religious', 'faith', 'spiritual', 'worship'] },
  { value: 'lucide:shrine', label: 'Shrine', keywords: ['religious', 'faith', 'spiritual', 'worship'] },
  
  // Emergency & urgent
  { value: 'lucide:siren', label: 'Siren', keywords: ['emergency', 'urgent', 'alert', 'critical'] },
  { value: 'lucide:alert-triangle', label: 'Alert', keywords: ['emergency', 'urgent', 'warning', 'critical'] },
  { value: 'lucide:shield-alert', label: 'Shield Alert', keywords: ['emergency', 'urgent', 'security', 'alert'] },
  
  // Time & calendar
  { value: 'lucide:calendar', label: 'Calendar', keywords: ['time', 'date', 'schedule', 'planning'] },
  { value: 'lucide:calendar-days', label: 'Calendar Days', keywords: ['time', 'date', 'schedule', 'days'] },
  { value: 'lucide:calendar-check', label: 'Calendar Check', keywords: ['time', 'approved', 'confirmed', 'scheduled'] },
  { value: 'lucide:calendar-clock', label: 'Calendar Clock', keywords: ['time', 'schedule', 'timing', 'appointment'] },
  { value: 'lucide:clock', label: 'Clock', keywords: ['time', 'hours', 'schedule', 'timing'] },
  { value: 'lucide:timer', label: 'Timer', keywords: ['time', 'countdown', 'duration', 'period'] },
  { value: 'lucide:hourglass', label: 'Hourglass', keywords: ['time', 'waiting', 'duration', 'pending'] },
  
  // Other
  { value: 'lucide:sun', label: 'Sun', keywords: ['day', 'morning', 'weather', 'bright'] },
  { value: 'lucide:moon', label: 'Moon', keywords: ['night', 'evening', 'rest', 'sleep'] },
  { value: 'lucide:cloud', label: 'Cloud', keywords: ['weather', 'sky', 'remote', 'online'] },
  { value: 'lucide:zap', label: 'Zap', keywords: ['energy', 'power', 'fast', 'quick'] },
  { value: 'lucide:star', label: 'Star', keywords: ['favorite', 'special', 'important', 'featured'] },
  { value: 'lucide:flag', label: 'Flag', keywords: ['marker', 'important', 'priority', 'milestone'] },
  { value: 'lucide:shield', label: 'Shield', keywords: ['protection', 'security', 'safety', 'guard'] },
  { value: 'lucide:file-text', label: 'File', keywords: ['document', 'paper', 'form', 'report'] },
  { value: 'lucide:clipboard', label: 'Clipboard', keywords: ['document', 'notes', 'form', 'list'] },
]

const showPicker = ref(false)
const searchQuery = ref('')

// Computed: Selected icon label
const selectedIconLabel = computed(() => {
  if (!props.modelValue) return 'Select an icon'
  const icon = ICONS.find(i => i.value === props.modelValue)
  return icon?.label || 'Custom icon'
})

// Computed: Filtered icons based on search
const filteredIcons = computed(() => {
  if (!searchQuery.value.trim()) return ICONS
  
  const query = searchQuery.value.toLowerCase()
  return ICONS.filter(icon => {
    return (
      icon.label.toLowerCase().includes(query) ||
      icon.keywords.some(keyword => keyword.includes(query))
    )
  })
})

// Select icon
const selectIcon = (value: string) => {
  emit('update:modelValue', value)
  showPicker.value = false
  searchQuery.value = ''
}
</script>