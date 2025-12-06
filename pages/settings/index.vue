<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <!-- Header -->
    <div class="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-[rgb(var(--foreground))] mb-1">Settings</h1>
        <p class="text-sm text-[rgb(var(--muted-foreground))]">
          Manage your organization's configuration
        </p>
      </div>
    </div>

    <!-- Main Content with Full-Height Sidebar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex min-h-[calc(100vh-180px)]">
        <!-- Left Sidebar Navigation - Full Height -->
        <aside class="w-64 flex-shrink-0 border-r border-[rgb(var(--border))] py-8 pr-8">
          <nav class="space-y-1 sticky top-8">
            <button
              v-for="item in navigationItems"
              :key="item.id"
              @click="activeSection = item.id"
              class="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              :class="activeSection === item.id 
                ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]' 
                : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'"
            >
              <div class="flex items-center gap-3">
                <Icon :name="item.icon" class="w-5 h-5" />
                <span>{{ item.label }}</span>
              </div>
            </button>
          </nav>
        </aside>

        <!-- Right Content Area -->
        <main class="flex-1 py-8 pl-8">
          <!-- Use v-if instead of v-show for lazy loading -->
          <GeneralSettings v-if="activeSection === 'general'" />
          <CarryForwardSettings v-if="activeSection === 'carryforward'" />
          <LeaveTypesSettings v-if="activeSection === 'leavetypes'" />
          <DepartmentsSettings v-if="activeSection === 'departments'" />
          <PublicHolidaysSettings v-if="activeSection === 'holidays'" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GeneralSettings from '../../components/settings/GeneralSettings.vue'
import CarryForwardSettings from '../../components/settings/CarryForwardSettings.vue'
import LeaveTypesSettings from '../../components/settings/LeaveTypesSettings.vue'
import DepartmentsSettings from '../../components/settings/DepartmentsSettings.vue'
import PublicHolidaysSettings from '../../components/settings/PublicHolidaysSettings.vue'

const { canAccessSettings } = usePermissions()

onMounted(() => {
  if (!canAccessSettings()) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true,
    })
  }
})

const activeSection = ref('general')

const navigationItems = [
  { id: 'general', label: 'General', icon: 'lucide:settings' },
  { id: 'carryforward', label: 'Carry forward', icon: 'lucide:calendar-arrow-up' },
  { id: 'leavetypes', label: 'Leave types', icon: 'lucide:calendar-days' },
  { id: 'departments', label: 'Departments', icon: 'lucide:building-2' },
  { id: 'holidays', label: 'Public holidays', icon: 'lucide:calendar' },
]
</script>