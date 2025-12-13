<template>
  <div class="bg-background min-h-screen">
    <!-- Hero Banner Section -->
    <section class="relative py-24 md:py-32 px-4 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div class="absolute inset-0 opacity-30">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle, rgb(var(--primary)) 1px, transparent 1px); background-size: 50px 50px;"></div>
      </div>

      <div class="container max-w-5xl mx-auto text-center relative z-10">
        <h1
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 800 } }"
          class="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
        >
          Key Features
        </h1>
        <p
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 200, duration: 800 } }"
          class="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          Explore our features to streamline your team's time-off management
        </p>
      </div>
    </section>

    <!-- Primary Features Grid -->
    <section class="py-20 md:py-28 px-4">
      <div class="container max-w-7xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8 md:gap-12">
          <div
            v-for="(feature, index) in primaryFeatures"
            :key="index"
            v-motion
            :initial="{ opacity: 0, y: 60 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: index * 150, duration: 700 } }"
            class="text-center group"
          >
            <div class="mb-6 inline-block">
              <div class="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon :name="feature.icon" class="w-10 h-10 text-[rgb(var(--primary))]" />
              </div>
            </div>
            <h3 class="text-2xl font-bold text-foreground mb-4">{{ feature.title }}</h3>
            <p class="text-muted-foreground leading-relaxed mb-6">{{ feature.description }}</p>
            <NuxtLink
              :to="feature.link"
              class="inline-flex items-center gap-2 text-[rgb(var(--primary))] font-medium hover:gap-3 transition-all"
            >
              Learn More Details
              <Icon name="lucide:arrow-right" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Essential Features Section -->
    <section class="py-20 md:py-28 px-4 bg-muted/30">
      <div class="container max-w-7xl mx-auto">
        <div
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 700 } }"
          class="text-center mb-16"
        >
          <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Essential Features for Modern Teams
          </h2>
          <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to manage leave requests efficiently
          </p>
        </div>

        <!-- 2x2 Feature Grid -->
        <div class="grid md:grid-cols-2 gap-8 mb-16">
          <div
            v-for="(feature, index) in essentialFeatures"
            :key="index"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :visible="{ opacity: 1, scale: 1, transition: { delay: index * 100, duration: 600 } }"
            class="bg-card border border-[rgb(var(--border))] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group"
          >
            <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Icon :name="feature.icon" class="w-8 h-8 text-[rgb(var(--primary))]" />
            </div>
            <h3 class="text-2xl font-bold text-foreground mb-4">{{ feature.title }}</h3>
            <p class="text-muted-foreground leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>

        <!-- Expandable Security Summary -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 700 } }"
          class="bg-card border border-[rgb(var(--border))] rounded-2xl p-8 md:p-12"
        >
          <div class="flex items-start gap-6">
            <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="lucide:shield-check" class="w-8 h-8 text-[rgb(var(--primary))]" />
            </div>
            <div class="flex-1">
              <h3 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Delivers an all-encompassing leave management solution
              </h3>
              <p class="text-muted-foreground leading-relaxed mb-8">
                Complete suite of tools for tracking, approving, and managing employee time-off with enterprise-grade security and compliance features.
              </p>
              <div class="grid md:grid-cols-3 gap-6">
                <div
                  v-for="(item, index) in comprehensiveFeatures"
                  :key="index"
                  class="flex items-start gap-3"
                >
                  <div class="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon name="lucide:check" class="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-foreground mb-1">{{ item.title }}</h4>
                    <p class="text-sm text-muted-foreground">{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Showcase Sections (Alternating Layout) -->
    <section class="py-20 md:py-28 px-4">
      <div class="container max-w-7xl mx-auto space-y-32">
        <!-- Feature 1: Left Image -->
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            v-motion
            :initial="{ opacity: 0, x: -60 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
            class="order-2 lg:order-1"
          >
            <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/30 border border-[rgb(var(--border))] shadow-2xl flex items-center justify-center">
              <div class="text-center space-y-4 p-8">
                <Icon name="lucide:calendar-days" class="w-32 h-32 mx-auto text-muted-foreground/30" />
                <p class="text-muted-foreground text-lg">Interactive Calendar</p>
              </div>
            </div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, x: 60 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
            class="order-1 lg:order-2"
          >
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
              <Icon name="lucide:sparkles" class="w-4 h-4" />
              Calendar Management
            </div>
            <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Visual Calendar That Makes Planning Easy
            </h2>
            <p class="text-lg text-muted-foreground mb-8 leading-relaxed">
              See team availability at a glance with our interactive calendar. Color-coded leave types,
              public holidays, and seamless integration with Google Calendar and Outlook keep everyone synchronized.
            </p>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span class="text-foreground font-medium">Team Availability View - </span>
                  <span class="text-muted-foreground">See who's off at a glance</span>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span class="text-foreground font-medium">Half & Quarter Day Support - </span>
                  <span class="text-muted-foreground">Flexible time-off options</span>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span class="text-foreground font-medium">Public Holiday Integration - </span>
                  <span class="text-muted-foreground">200+ countries supported</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Feature 2: Right Image -->
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            v-motion
            :initial="{ opacity: 0, x: -60 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
          >
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-semibold mb-6">
              <Icon name="lucide:sparkles" class="w-4 h-4" />
              Approval Workflows
            </div>
            <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Smart Approval Chains That Scale With You
            </h2>
            <p class="text-lg text-muted-foreground mb-8 leading-relaxed">
              Configure multi-level approval workflows that match your organizational structure.
              Automated routing, timeout escalations, and complete audit trails ensure nothing falls through the cracks.
            </p>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span class="text-foreground font-medium">Multi-Level Approvals - </span>
                  <span class="text-muted-foreground">Manager → Department Head → HR</span>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span class="text-foreground font-medium">Automated Notifications - </span>
                  <span class="text-muted-foreground">Email alerts for all actions</span>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span class="text-foreground font-medium">Complete Audit Trail - </span>
                  <span class="text-muted-foreground">Full compliance tracking</span>
                </div>
              </li>
            </ul>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, x: 60 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
          >
            <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/30 border border-[rgb(var(--border))] shadow-2xl flex items-center justify-center">
              <div class="text-center space-y-4 p-8">
                <Icon name="lucide:workflow" class="w-32 h-32 mx-auto text-muted-foreground/30" />
                <p class="text-muted-foreground text-lg">Approval Dashboard</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature 3: Left Image -->
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            v-motion
            :initial="{ opacity: 0, x: -60 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
            class="order-2 lg:order-1"
          >
            <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/30 border border-[rgb(var(--border))] shadow-2xl flex items-center justify-center">
              <div class="text-center space-y-4 p-8">
                <Icon name="lucide:bar-chart-3" class="w-32 h-32 mx-auto text-muted-foreground/30" />
                <p class="text-muted-foreground text-lg">Analytics Dashboard</p>
              </div>
            </div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, x: 60 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
            class="order-1 lg:order-2"
          >
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-semibold mb-6">
              <Icon name="lucide:sparkles" class="w-4 h-4" />
              Analytics & Reporting
            </div>
            <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Data-Driven Insights for Better Planning
            </h2>
            <p class="text-lg text-muted-foreground mb-8 leading-relaxed">
              Track leave patterns, forecast team capacity, and export comprehensive reports.
              Real-time analytics help you make informed decisions about staffing and resource planning.
            </p>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span class="text-foreground font-medium">Real-Time Analytics - </span>
                  <span class="text-muted-foreground">Live team capacity insights</span>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span class="text-foreground font-medium">Export Reports - </span>
                  <span class="text-muted-foreground">CSV, Excel, PDF formats</span>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span class="text-foreground font-medium">Trend Analysis - </span>
                  <span class="text-muted-foreground">Identify peak leave periods</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- All Features Grid -->
    <section class="py-20 md:py-28 px-4 bg-muted/30">
      <div class="container max-w-7xl mx-auto">
        <div
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 700 } }"
          class="text-center mb-16"
        >
          <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Complete Feature Set
          </h2>
          <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for enterprise-grade leave management
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(feature, index) in allFeatures"
            :key="index"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: index * 50, duration: 600 } }"
            class="bg-card border border-[rgb(var(--border))] rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon :name="feature.icon" class="w-6 h-6 text-[rgb(var(--primary))]" />
            </div>
            <h3 class="text-lg font-bold text-foreground mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 md:py-28 px-4 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary to-primary/80"></div>
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle, currentColor 2px, transparent 2px); background-size: 40px 40px;"></div>
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :visible="{ opacity: 1, scale: 1, transition: { duration: 800 } }"
        class="container max-w-4xl mx-auto text-center relative z-10"
      >
        <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">
          Secure Your Team's Time-Off with BookYourPTO
        </h2>
        <p class="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Start managing leave requests in 5 minutes. No credit card required.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/register">
            <button class="px-10 py-4 bg-white text-gray-900 hover:bg-white/90 rounded-lg font-semibold text-lg shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
              <Icon name="lucide:rocket" class="w-5 h-5" />
              Get Started
            </button>
          </NuxtLink>
          <a href="https://github.com/anhourtec/BookYourPTO" target="_blank" rel="noopener noreferrer">
            <button class="px-10 py-4 border-2 border-white text-white hover:bg-white/20 rounded-lg font-semibold text-lg hover:scale-105 transition-all duration-300 flex items-center gap-2">
              <Icon name="lucide:github" class="w-5 h-5" />
              View on GitHub
            </button>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const primaryFeatures = [
  {
    icon: 'lucide:calendar-days',
    title: 'Leave Management',
    description: 'Comprehensive leave tracking with 21+ leave types, flexible durations, and automatic balance calculations. Support for full-day, half-day, and quarter-day requests.',
    link: '/features'
  },
  {
    icon: 'lucide:git-pull-request',
    title: 'Approval Workflows',
    description: 'Configure multi-level approval chains that match your organizational structure. Automated routing, timeout escalations, and complete audit trails.',
    link: '/features'
  },
  {
    icon: 'lucide:building-2',
    title: 'Multi-Tenancy',
    description: 'Host unlimited organizations with complete data isolation. Perfect for managed service providers or enterprises with multiple entities.',
    link: '/features'
  }
]

const essentialFeatures = [
  {
    icon: 'lucide:users',
    title: 'User Management',
    description: 'Organize teams with departments, roles, and hierarchies. Bulk import users via CSV and manage permissions with role-based access control.'
  },
  {
    icon: 'lucide:mail',
    title: 'Email Notifications',
    description: 'Automated email alerts for leave requests, approvals, and status changes. Customizable templates for all workflow events.'
  },
  {
    icon: 'lucide:globe',
    title: 'Public Holidays',
    description: 'Automatic detection of regional holidays for 200+ countries. Holidays excluded from leave calculations and highlighted on calendars.'
  },
  {
    icon: 'lucide:palette',
    title: 'White-Labeling',
    description: 'Customize appearance with logos, colors, and custom CSS. Full visual customization per organization for branded experiences.'
  }
]

const comprehensiveFeatures = [
  {
    title: 'Real-Time Balance Tracking',
    description: 'Automatic accruals, carry-forwards, and expiry tracking with complete historical audit trails.'
  },
  {
    title: 'Calendar Integration',
    description: 'Two-way sync with Google Calendar and Outlook. Approved leave automatically appears on employee calendars.'
  },
  {
    title: 'Audit & Compliance',
    description: 'Complete logging of all actions with GDPR compliance features and exportable audit reports.'
  }
]

const allFeatures = [
  { icon: 'lucide:calendar-check', title: 'Leave Requests', description: 'Simple interface with instant balance preview' },
  { icon: 'lucide:bar-chart-3', title: 'Balance Tracking', description: 'Real-time leave balance calculations' },
  { icon: 'lucide:workflow', title: 'Custom Workflows', description: 'Design approval chains for your org' },
  { icon: 'lucide:shield-check', title: 'Audit Trails', description: 'Complete logging for compliance' },
  { icon: 'lucide:file-text', title: 'Reports & Analytics', description: 'Comprehensive reports with export' },
  { icon: 'lucide:clock', title: 'Timezone Support', description: 'Global timezone handling' },
  { icon: 'lucide:file-signature', title: 'Document Management', description: 'E-signature support for HR docs' },
  { icon: 'lucide:users-cog', title: 'Role-Based Access', description: 'Granular permissions control' },
  { icon: 'lucide:database', title: 'Self-Hosted', description: 'Complete control on your infrastructure' },
  { icon: 'lucide:zap', title: 'High Performance', description: 'Optimized queries and caching' },
  { icon: 'lucide:smartphone', title: 'Mobile Responsive', description: 'Works perfectly on all devices' },
  { icon: 'lucide:moon', title: 'Dark Mode', description: 'Full dark mode support' }
]
</script>

<style scoped>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}
</style>
