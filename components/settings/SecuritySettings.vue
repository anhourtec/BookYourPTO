<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] shadow-sm p-4 sm:p-6">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">Security & Compliance</h2>
          <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] mt-1 leading-relaxed">
            Monitor security events and compliance logs for your organization
          </p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] shadow-sm overflow-hidden">
      <!-- Mobile: Dropdown Tabs -->
      <div class="block sm:hidden border-b border-[rgb(var(--border))] p-4">
        <label for="mobile-tab-select" class="sr-only">Select a tab</label>
        <select
          id="mobile-tab-select"
          v-model="activeTab"
          class="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-[rgb(var(--border))] rounded-xl text-sm font-medium text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent"
        >
          <option
            v-for="tab in tabs"
            :key="tab.id"
            :value="tab.id"
          >
            {{ tab.label }}
          </option>
        </select>
      </div>

      <!-- Desktop: Horizontal Tabs with scroll -->
      <div class="hidden sm:block border-b border-[rgb(var(--border))] px-4 sm:px-6">
        <nav class="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:bg-[rgb(var(--muted))]/5 rounded-t-lg"
            :class="[
              activeTab === tab.id
                ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))] bg-[rgb(var(--primary))]/5'
                : 'border-transparent text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            ]"
          >
            <div class="flex items-center gap-2">
              <Icon :name="tab.icon" class="w-4 h-4" />
              <span class="hidden sm:inline">{{ tab.label }}</span>
              <span class="sm:hidden">{{ tab.mobileLabel || tab.label }}</span>
            </div>
          </button>
        </nav>
      </div>

      <div class="p-3 sm:p-4 md:p-6">
        <!-- Security Violations Tab -->
        <SecurityViolationsTable v-if="activeTab === 'violations'" />

        <!-- Audit Logs Tab -->
        <AuditLogsTable v-if="activeTab === 'audit'" />

        <!-- Sign-in Logs Tab -->
        <SignInLogsTable v-if="activeTab === 'signin'" />

        <!-- Leave Transactions Tab -->
        <LeaveTransactionsTable v-if="activeTab === 'transactions'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SecurityViolationsTable from './security/SecurityViolationsTable.vue'
import AuditLogsTable from './security/AuditLogsTable.vue'
import LeaveTransactionsTable from './security/LeaveTransactionsTable.vue'
import SignInLogsTable from './security/SignInLogsTable.vue'

const activeTab = ref('audit')

const tabs = [
  { id: 'audit', label: 'Audit Logs', mobileLabel: 'Audit', icon: 'lucide:file-text' },
  { id: 'signin', label: 'Sign-in Logs', mobileLabel: 'Sign-in', icon: 'lucide:lock' },
  { id: 'transactions', label: 'Leave Transactions', mobileLabel: 'Transactions', icon: 'lucide:calendar-check' },
  { id: 'violations', label: 'Security Violations', mobileLabel: 'Violations', icon: 'lucide:shield-alert' }
]
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
