<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-6">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold text-[rgb(var(--foreground))]">Security & Compliance</h2>
          <p class="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            Monitor security events and compliance logs for your organization
          </p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm">
      <div class="border-b border-[rgb(var(--border))] px-6">
        <nav class="flex gap-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
            :class="[
              activeTab === tab.id
                ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                : 'border-transparent text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            ]"
          >
            <div class="flex items-center gap-2">
              <Icon :name="tab.icon" class="w-4 h-4" />
              {{ tab.label }}
            </div>
          </button>
        </nav>
      </div>

      <div class="p-6">
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
  { id: 'audit', label: 'Audit Logs', icon: 'lucide:file-text' },
  { id: 'signin', label: 'Sign-in Logs', icon: 'lucide:lock' },
  { id: 'transactions', label: 'Leave Transactions', icon: 'lucide:calendar-check' },
  { id: 'violations', label: 'Security Violations', icon: 'lucide:shield-alert' }

]
</script>
