<template>
  <div class="bg-background min-h-screen overflow-x-hidden">
    <!-- Hero Section -->
    <section class="relative py-24 md:py-32 px-4 overflow-hidden">
      <!-- Animated background gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5 opacity-50" />

      <!-- Floating shapes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="floating-shape-1 absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div class="floating-shape-2 absolute bottom-20 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div class="container max-w-7xl mx-auto relative z-10">
        <div class="text-center mb-16">
          <!-- Main Headline with staggered animation -->
          <div class="mb-6">
            <h1
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible="{ opacity: 1, y: 0, transition: { delay: 0, duration: 600 } }"
              class="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight"
            >
              Opensource PTO Management
            </h1>
            <h2
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible="{ opacity: 1, y: 0, transition: { delay: 200, duration: 600 } }"
              class="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            >
              Built for Modern Teams
            </h2>
          </div>

          <p
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 400, duration: 600 } }"
            class="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Open-source, self-hosted leave management platform with advanced approval workflows,
            calendar integrations, and complete organizational control.
          </p>

          <!-- CTA Buttons -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 600, duration: 600 } }"
            class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <button
              @click="scrollToDemo"
              class="group px-10 py-4 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:opacity-90 rounded-lg flex items-center justify-center gap-2 transition-all text-lg font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Icon name="lucide:play-circle" class="w-5 h-5 group-hover:scale-110 transition-transform" />
              See How It Works
            </button>
            <NuxtLink to="/register">
              <button
                class="group px-10 py-4 border-2 border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] rounded-lg flex items-center justify-center gap-2 transition-all text-lg font-medium text-[rgb(var(--foreground))] hover:scale-105"
              >
                <Icon name="lucide:rocket" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Start Free Trial
              </button>
            </NuxtLink>
          </div>

          <!-- Trust Badges -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :visible="{ opacity: 1, transition: { delay: 800, duration: 600 } }"
            class="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground"
          >
            <div class="flex items-center gap-2">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-500" />
              <span>100% Open Source</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="lucide:shield-check" class="w-4 h-4 text-green-500" />
              <span>GDPR Compliant</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="lucide:server" class="w-4 h-4 text-green-500" />
              <span>Self-Hosted</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="lucide:zap" class="w-4 h-4 text-green-500" />
              <span>5 Min Setup</span>
            </div>
            <a
              href="https://github.com/anhourtec/BookYourPTO"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 hover:text-[rgb(var(--foreground))] transition-colors"
            >
              <Icon name="lucide:star" class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span v-if="githubStars !== ''">
                  {{ githubStars === '0' ? 'Be the first to star ⭐' : `${githubStars} GitHub Stars` }}
                </span>              
                <span v-else>Star on GitHub</span>
            </a>
          </div>
        </div>

        <!-- Hero Image/Demo -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 800 } }"
          class="relative max-w-6xl mx-auto"
        >
          <div class="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
            <!-- Placeholder for main dashboard screenshot -->
            <div class="aspect-[16/10] bg-gradient-to-br from-muted via-card to-muted flex items-center justify-center">
              <div class="text-center space-y-4">
                <Icon name="lucide:layout-dashboard" class="w-24 h-24 mx-auto text-muted-foreground/30" />
                <p class="text-muted-foreground text-lg">Dashboard Preview</p>
              </div>
            </div>
            <!-- Browser chrome -->
            <div class="absolute top-0 left-0 right-0 h-10 bg-muted/50 backdrop-blur-sm flex items-center px-4 gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
          </div>
          <!-- Glow effect -->
          <div class="absolute -inset-4 bg-primary/20 blur-3xl -z-10 opacity-30"></div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 px-4 border-y border-border bg-muted/30">
      <div class="container max-w-7xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 0, duration: 500 } }"
            class="text-center"
          >
            <div class="text-4xl md:text-5xl font-bold text-foreground mb-2">∞</div>
            <div class="text-sm md:text-base text-muted-foreground">Organizations</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 100, duration: 500 } }"
            class="text-center"
          >
            <div class="text-4xl md:text-5xl font-bold text-foreground mb-2">100%</div>
            <div class="text-sm md:text-base text-muted-foreground">Open Source</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }"
            class="text-center"
          >
            <div class="text-4xl md:text-5xl font-bold text-foreground mb-2">21+</div>
            <div class="text-sm md:text-base text-muted-foreground">Leave Types</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }"
            class="text-center"
          >
            <div class="text-4xl md:text-5xl font-bold text-foreground mb-2">5 min</div>
            <div class="text-sm md:text-base text-muted-foreground">Setup Time</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Showcase 1: Calendar Management -->
    <section ref="demoSection" class="py-24 md:py-32 px-4">
      <div class="container max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            v-motion
            :initial="{ opacity: 0, x: -50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 700 } }"
          >
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Icon name="lucide:calendar" class="w-4 h-4" />
              Calendar Management
            </div>
            <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Visual Leave Calendar That Makes Sense
            </h2>
            <p class="text-lg text-muted-foreground mb-8 leading-relaxed">
              Interactive calendar view with color-coded leave types, team availability at a glance,
              and seamless integration with Google Calendar and Outlook. See who's off, when, and plan accordingly.
            </p>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">Team Availability View</div>
                  <div class="text-muted-foreground">See all team members' leave status in one place</div>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">Half & Quarter Day Support</div>
                  <div class="text-muted-foreground">Flexible leave booking for partial days</div>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">Public Holiday Integration</div>
                  <div class="text-muted-foreground">Automatic detection of regional holidays</div>
                </div>
              </li>
            </ul>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 700 } }"
            class="relative"
          >
            <div class="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
                  <img 
                    src="/views/calendar_view.png" 
                    alt="Interactive Calendar View - BookYourPTO dashboard showing team availability and leave requests"
                    class="w-full h-auto object-contain scale-105 hover:scale-110 transition-transform duration-500"
                  />
                </div>
            <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Showcase 2: Approval Workflow -->
    <section class="py-24 md:py-32 px-4 bg-muted/30">
      <div class="container max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            v-motion
            :initial="{ opacity: 0, x: -50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 700 } }"
            class="relative order-2 lg:order-1"
          >
            <div class="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
              <div class="aspect-[4/3] bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-green-950/20 dark:via-background dark:to-teal-950/20 flex items-center justify-center">
                <div class="text-center space-y-4 p-8">
                  <Icon name="lucide:git-pull-request" class="w-32 h-32 mx-auto text-muted-foreground/30" />
                  <p class="text-muted-foreground text-lg">Approval Dashboard</p>
                </div>
              </div>
            </div>
            <div class="absolute -bottom-6 -left-6 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -z-10"></div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 700 } }"
            class="order-1 lg:order-2"
          >
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-6">
              <Icon name="lucide:check-circle" class="w-4 h-4" />
              Approval Workflow
            </div>
            <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Two-Level Approval System
            </h2>
            <p class="text-lg text-muted-foreground mb-8 leading-relaxed">
              Configurable approval chains with manager and department head reviews.
              Set custom rules, automate notifications, and maintain complete audit trails for compliance.
            </p>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">Multi-Level Approvals</div>
                  <div class="text-muted-foreground">Manager → Department Head → HR workflow</div>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">Automated Notifications</div>
                  <div class="text-muted-foreground">Email alerts for pending approvals and status changes</div>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">Complete Audit Trail</div>
                  <div class="text-muted-foreground">Track every approval, rejection, and modification</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Showcase 3: Leave Balance Tracking -->
    <section class="py-24 md:py-32 px-4">
      <div class="container max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            v-motion
            :initial="{ opacity: 0, x: -50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 700 } }"
          >
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium mb-6">
              <Icon name="lucide:pie-chart" class="w-4 h-4" />
              Leave Tracking
            </div>
            <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Real-Time Leave Balance Management
            </h2>
            <p class="text-lg text-muted-foreground mb-8 leading-relaxed">
              Automatic balance calculations, carry-forward rules, and expiry tracking.
              Support for 21+ leave types including annual, sick, maternity, and custom categories.
            </p>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">Automatic Accruals</div>
                  <div class="text-muted-foreground">Monthly, yearly, or custom accrual schedules</div>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">Carry Forward Policies</div>
                  <div class="text-muted-foreground">Configurable rules for unused leave</div>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">21+ Leave Types</div>
                  <div class="text-muted-foreground">Annual, sick, maternity, paternity, and more</div>
                </div>
              </li>
            </ul>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 700 } }"
            class="relative"
          >
            <div class="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
              <div class="aspect-[4/3] bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/20 dark:via-background dark:to-pink-950/20 flex items-center justify-center">
                <div class="text-center space-y-4 p-8">
                  <Icon name="lucide:bar-chart-3" class="w-32 h-32 mx-auto text-muted-foreground/30" />
                  <p class="text-muted-foreground text-lg">Balance Dashboard</p>
                </div>
              </div>
            </div>
            <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-24 md:py-32 px-4 bg-muted/30">
      <div class="container max-w-7xl mx-auto">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          class="text-center mb-16"
        >
          <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get Started in Minutes
          </h2>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            Deploy your own instance with Docker in three simple steps
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 100, duration: 600 } }"
            class="relative"
          >
            <div class="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 h-full">
              <div class="absolute -top-4 left-8 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                STEP 1
              </div>
              <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mt-4">
                <Icon name="lucide:download" class="w-8 h-8 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-foreground mb-4">Clone & Configure</h3>
              <p class="text-muted-foreground leading-relaxed mb-6">
                Clone the repository, set your environment variables, and customize your organization settings.
              </p>
              <div class="bg-muted/50 rounded-lg p-4 font-mono text-sm text-foreground">
                git clone bookyourpto<br/>
                cd bookyourpto<br/>
                cp .env.example .env
              </div>
            </div>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 300, duration: 600 } }"
            class="relative"
          >
            <div class="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 h-full">
              <div class="absolute -top-4 left-8 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                STEP 2
              </div>
              <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mt-4">
                <Icon name="lucide:rocket" class="w-8 h-8 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-foreground mb-4">Deploy with Docker</h3>
              <p class="text-muted-foreground leading-relaxed mb-6">
                Launch your instance using Docker Compose. PostgreSQL and all dependencies included.
              </p>
              <div class="bg-muted/50 rounded-lg p-4 font-mono text-sm text-foreground">
                docker-compose up -d<br/>
                npm run db:migrate<br/>
                npm run db:seed
              </div>
            </div>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 500, duration: 600 } }"
            class="relative"
          >
            <div class="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 h-full">
              <div class="absolute -top-4 left-8 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                STEP 3
              </div>
              <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mt-4">
                <Icon name="lucide:check-circle" class="w-8 h-8 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-foreground mb-4">Start Managing</h3>
              <p class="text-muted-foreground leading-relaxed mb-6">
                Create your organization, invite team members, and start managing leave requests immediately.
              </p>
              <div class="flex flex-wrap gap-2">
                <div class="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm flex items-center gap-1">
                  <Icon name="lucide:users" class="w-3 h-3" />
                  Add Users
                </div>
                <div class="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm flex items-center gap-1">
                  <Icon name="lucide:settings" class="w-3 h-3" />
                  Configure
                </div>
                <div class="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm flex items-center gap-1">
                  <Icon name="lucide:zap" class="w-3 h-3" />
                  Go Live
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Comprehensive Features Grid -->
    <section class="py-24 md:py-32 px-4">
      <div class="container max-w-7xl mx-auto">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          class="text-center mb-16"
        >
          <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need, All In One Place
          </h2>
          <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive features designed for enterprise-level leave management
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <!-- Feature Card Template -->
          <div
            v-for="(feature, index) in features"
            :key="index"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: index * 50, duration: 500 } }"
            class="group bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Icon :name="feature.icon" class="w-7 h-7 text-primary" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-card-foreground">{{ feature.title }}</h3>
            <p class="text-muted-foreground leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Multi-Tenancy Section -->
    <section class="py-24 md:py-32 px-4 bg-muted/30">
      <div class="container max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            v-motion
            :initial="{ opacity: 0, x: -50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 700 } }"
          >
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium mb-6">
              <Icon name="lucide:building-2" class="w-4 h-4" />
              Multi-Tenancy
            </div>
            <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Built for Multiple Organizations
            </h2>
            <p class="text-lg text-muted-foreground mb-8 leading-relaxed">
              Complete data isolation, custom branding, and white-labeling capabilities.
              Perfect for managed service providers or enterprise deployments.
            </p>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">White-Labeling</div>
                  <div class="text-muted-foreground">Custom logos, colors, and branding per organization</div>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">Complete Isolation</div>
                  <div class="text-muted-foreground">Database-level separation ensures data security</div>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-1 p-1 rounded-full bg-green-500/10">
                  <Icon name="lucide:check" class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-semibold text-foreground mb-1">Custom Domains</div>
                  <div class="text-muted-foreground">Map each organization to its own subdomain</div>
                </div>
              </li>
            </ul>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 700 } }"
            class="relative"
          >
            <div class="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
              <div class="aspect-[4/3] bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-orange-950/20 dark:via-background dark:to-red-950/20 flex items-center justify-center">
                <div class="text-center space-y-4 p-8">
                  <Icon name="lucide:building" class="w-32 h-32 mx-auto text-muted-foreground/30" />
                  <p class="text-muted-foreground text-lg">Organization Settings</p>
                </div>
              </div>
            </div>
            <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-24 md:py-32 px-4">
      <div class="container max-w-7xl mx-auto">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          class="text-center mb-16"
        >
          <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose BookYourPTO?
          </h2>
          <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
            The open-source alternative to expensive SaaS solutions
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 100, duration: 600 } }"
            class="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-8 border border-green-500/20"
          >
            <!--
          <Icon name="lucide:dollar-sign" class="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
            -->
            <h3 class="text-2xl font-bold text-foreground mb-4">Zero Monthly Costs</h3>
            <p class="text-muted-foreground leading-relaxed">
              No per-user fees, no hidden costs. Deploy once and use forever.
              Perfect for growing teams that want predictable expenses.
            </p>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 200, duration: 600 } }"
            class="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-blue-500/20"
          >
          <!--
                      <Icon name="lucide:shield" class="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />

          -->
            <h3 class="text-2xl font-bold text-foreground mb-4">Complete Data Control</h3>
            <p class="text-muted-foreground leading-relaxed">
              Your data stays on your infrastructure. Full GDPR compliance,
              complete audit trails, and no third-party data access.
            </p>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 300, duration: 600 } }"
            class="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20"
          >
          <!--
                      <Icon name="lucide:code" class="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />

          -->
            <h3 class="text-2xl font-bold text-foreground mb-4">Fully Customizable</h3>
            <p class="text-muted-foreground leading-relaxed">
              Open-source means unlimited customization. Modify workflows,
              add features, or integrate with existing systems.
            </p>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 400, duration: 600 } }"
            class="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-orange-500/20"
          >
          <!--
                      <Icon name="lucide:trending-up" class="w-12 h-12 text-orange-600 dark:text-orange-400 mb-4" />

          -->
            <h3 class="text-2xl font-bold text-foreground mb-4">Scales With You</h3>
            <p class="text-muted-foreground leading-relaxed">
              From 10 to 10,000 employees. Multi-tenant architecture supports
              unlimited organizations without performance degradation.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-24 md:py-32 px-4 bg-muted/30">
      <div class="container max-w-7xl mx-auto">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          class="text-center mb-16"
        >
          <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Loved by Teams Worldwide
          </h2>
          <p class="text-xl text-muted-foreground">
            See what teams are saying about BookYourPTO
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 100, duration: 600 } }"
            class="bg-card rounded-2xl p-8 border border-border shadow-sm"
          >
            <div class="flex gap-1 mb-4">
              <Icon v-for="i in 5" :key="i" name="lucide:star" class="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p class="text-foreground mb-6 leading-relaxed">
              "Finally, a leave management system that doesn't charge per user.
              The self-hosted approach gives us complete control over our data."
            </p>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="lucide:user" class="w-6 h-6 text-primary" />
              </div>
              <div>
                <div class="font-semibold text-foreground">Sarah Johnson</div>
                <div class="text-sm text-muted-foreground">HR Director, Tech Corp</div>
              </div>
            </div>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 200, duration: 600 } }"
            class="bg-card rounded-2xl p-8 border border-border shadow-sm"
          >
            <div class="flex gap-1 mb-4">
              <Icon v-for="i in 5" :key="i" name="lucide:star" class="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p class="text-foreground mb-6 leading-relaxed">
              "The approval workflow is exactly what we needed. Two-level approvals
              with complete audit trails for compliance."
            </p>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="lucide:user" class="w-6 h-6 text-primary" />
              </div>
              <div>
                <div class="font-semibold text-foreground">Michael Chen</div>
                <div class="text-sm text-muted-foreground">Operations Manager, Finance Inc</div>
              </div>
            </div>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: 300, duration: 600 } }"
            class="bg-card rounded-2xl p-8 border border-border shadow-sm"
          >
            <div class="flex gap-1 mb-4">
              <Icon v-for="i in 5" :key="i" name="lucide:star" class="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p class="text-foreground mb-6 leading-relaxed">
              "Setup took less than 10 minutes with Docker. The calendar integration
              with Google Calendar is seamless."
            </p>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="lucide:user" class="w-6 h-6 text-primary" />
              </div>
              <div>
                <div class="font-semibold text-foreground">Emma Wilson</div>
                <div class="text-sm text-muted-foreground">IT Lead, Startup XYZ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack -->
    <section class="py-24 px-4">
      <div class="container max-w-7xl mx-auto">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          class="text-center mb-12"
        >
          <h3 class="text-2xl font-semibold text-foreground mb-4">
            Built with Modern Technologies
          </h3>
          <p class="text-muted-foreground">
            Leveraging the best open-source tools
          </p>
        </div>
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :visible="{ opacity: 1, transition: { delay: 200, duration: 600 } }"
          class="flex flex-wrap justify-center items-center gap-8 md:gap-12"
        >
          <div class="flex flex-col items-center gap-2 group">
            <div class="p-4 rounded-2xl bg-muted group-hover:bg-muted/70 transition-colors">
              <Icon name="lucide:layout-dashboard" class="w-8 h-8 text-muted-foreground" />
            </div>
            <span class="text-sm text-muted-foreground font-medium">Nuxt 3</span>
          </div>
          <div class="flex flex-col items-center gap-2 group">
            <div class="p-4 rounded-2xl bg-muted group-hover:bg-muted/70 transition-colors">
              <Icon name="lucide:database" class="w-8 h-8 text-muted-foreground" />
            </div>
            <span class="text-sm text-muted-foreground font-medium">PostgreSQL</span>
          </div>
          <div class="flex flex-col items-center gap-2 group">
            <div class="p-4 rounded-2xl bg-muted group-hover:bg-muted/70 transition-colors">
              <Icon name="lucide:box" class="w-8 h-8 text-muted-foreground" />
            </div>
            <span class="text-sm text-muted-foreground font-medium">Prisma</span>
          </div>
          <div class="flex flex-col items-center gap-2 group">
            <div class="p-4 rounded-2xl bg-muted group-hover:bg-muted/70 transition-colors">
              <Icon name="lucide:container" class="w-8 h-8 text-muted-foreground" />
            </div>
            <span class="text-sm text-muted-foreground font-medium">Docker</span>
          </div>
          <div class="flex flex-col items-center gap-2 group">
            <div class="p-4 rounded-2xl bg-muted group-hover:bg-muted/70 transition-colors">
              <Icon name="lucide:zap" class="w-8 h-8 text-muted-foreground" />
            </div>
            <span class="text-sm text-muted-foreground font-medium">TypeScript</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-24 md:py-32 px-4 bg-muted/30">
      <div class="container max-w-4xl mx-auto">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          class="text-center mb-16"
        >
          <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p class="text-xl text-muted-foreground">
            Everything you need to know about BookYourPTO
          </p>
        </div>

        <div class="space-y-4">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 1, y: 0, transition: { delay: index * 100, duration: 500 } }"
            class="bg-card rounded-xl border border-border overflow-hidden"
          >
            <button
              @click="toggleFaq(index)"
              class="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span class="font-semibold text-foreground text-lg">{{ faq.question }}</span>
              <Icon
                :name="activeFaq === index ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                class="w-5 h-5 text-muted-foreground transition-transform"
              />
            </button>
            <div
              v-show="activeFaq === index"
              class="px-8 pb-6 text-muted-foreground leading-relaxed"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 md:py-32 px-4">
      <div class="container max-w-7xl mx-auto">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{ opacity: 1, y: 0, transition: { duration: 700 } }"
          class="relative bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-12 md:p-20 text-center overflow-hidden shadow-2xl"
        >
          <!-- Decorative elements -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute inset-0" style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 30px 30px;"></div>
          </div>
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

          <div class="relative z-10">
            <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Ready to Transform Your Leave Management?
            </h2>
            <p class="text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto">
              Join teams worldwide who are managing time-off with complete control and zero monthly fees.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <NuxtLink to="/register">
                <button
                  class="group px-12 py-5 bg-white text-gray-900 hover:bg-white/90 rounded-lg flex items-center justify-center gap-2 transition-all text-lg font-medium shadow-2xl hover:scale-105"
                >
                  <Icon name="lucide:rocket" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Get Started Free
                </button>
              </NuxtLink>
              <a href="https://github.com/anhourtec/BookYourPTO" target="_blank" rel="noopener noreferrer">
                
                 <button
              class="group px-12 py-5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:opacity-90 rounded-lg flex items-center justify-center gap-2 transition-all text-lg font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Icon name="lucide:github" class="w-5 h-5 group-hover:scale-110 transition-transform" />
               View on GitHub
            </button>
              </a>
            </div>
            <p class="mt-8 text-primary-foreground/80 text-sm">
              No credit card required • Deploy in 5 minutes • Open source forever
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const demoSection = ref(null)
const activeFaq = ref<number | null>(null)
const githubStars = ref('')

const scrollToDemo = () => {
  if (demoSection.value) {
    (demoSection.value as HTMLElement).scrollIntoView({ behavior: 'smooth' })
  }
}

const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

// Fetch GitHub stars
const fetchGitHubStars = async () => {
  try {
    const res = await fetch('/api/github-stars')
    if (!res.ok) return

    const { stars } = await res.json()

    githubStars.value =
      stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars.toString()
  } catch (e) {
    console.warn('Failed to load GitHub stars')
  }
}



onMounted(() => {
  fetchGitHubStars()
})

const features = [
  {
    icon: 'lucide:building-2',
    title: 'Multi-Tenant Architecture',
    description: 'Support unlimited organizations with complete data isolation and custom branding capabilities.'
  },
  {
    icon: 'lucide:calendar-check',
    title: 'Calendar Integration',
    description: 'Seamless sync with Google Calendar and Outlook for automatic event creation and updates.'
  },
  {
    icon: 'lucide:users',
    title: 'User Management',
    description: 'Role-based access control with employee, manager, department head, and admin roles.'
  },
  {
    icon: 'lucide:git-pull-request',
    title: 'Approval Workflows',
    description: 'Configurable multi-level approval chains with automated notifications and escalations.'
  },
  {
    icon: 'lucide:bar-chart-3',
    title: 'Leave Balance Tracking',
    description: 'Real-time balance calculations with automatic accruals, carry-forwards, and expiry tracking.'
  },
  {
    icon: 'lucide:file-signature',
    title: 'Document Management',
    description: 'E-signature support for HR documents, contracts, and leave-related paperwork.'
  },
  {
    icon: 'lucide:globe',
    title: 'Public Holidays',
    description: 'Automatic detection of regional holidays with support for 200+ countries.'
  },
  {
    icon: 'lucide:mail',
    title: 'Email Notifications',
    description: 'Customizable email templates for leave requests, approvals, and status updates.'
  },
  {
    icon: 'lucide:file-text',
    title: 'Reports & Analytics',
    description: 'Comprehensive leave reports with CSV/Excel export for payroll and compliance.'
  },
  {
    icon: 'lucide:shield-check',
    title: 'Audit Trails',
    description: 'Complete audit logging of all actions for compliance and security purposes.'
  },
  {
    icon: 'lucide:palette',
    title: 'White-Labeling',
    description: 'Custom logos, colors, and branding for each organization in multi-tenant deployments.'
  },
  {
    icon: 'lucide:clock',
    title: 'Timezone Support',
    description: 'Global timezone handling for distributed teams and international organizations.'
  }
]

const faqs = [
  {
    question: 'Is BookYourPTO really free?',
    answer: 'Yes! BookYourPTO is 100% open-source and free to use. You only pay for your own hosting infrastructure (server, database). There are no per-user fees, no subscription costs, and no hidden charges.'
  },
  {
    question: 'How difficult is it to set up?',
    answer: 'Very easy! With Docker Compose, you can have BookYourPTO running in under 5 minutes. We provide complete documentation, example configurations, and migration scripts. If you can run docker-compose up, you can deploy BookYourPTO.'
  },
  {
    question: 'Can I customize the approval workflow?',
    answer: 'Absolutely! BookYourPTO supports configurable multi-level approval workflows. You can set up manager approvals, department head reviews, HR sign-offs, or any combination that fits your organization\'s needs.'
  },
  {
    question: 'Does it support multiple organizations?',
    answer: 'Yes! BookYourPTO is built with multi-tenancy from the ground up. Each organization gets complete data isolation, custom branding, and separate configurations. Perfect for managed service providers or holding companies.'
  },
  {
    question: 'What about data security and compliance?',
    answer: 'Since BookYourPTO is self-hosted, you have complete control over your data. All sensitive information stays on your infrastructure. We provide complete audit trails, GDPR compliance features, and encrypted password storage.'
  },
  {
    question: 'Can I integrate with our existing calendar?',
    answer: 'Yes! BookYourPTO integrates with Google Calendar and Microsoft Outlook. Approved leave requests are automatically added to calendars, and you can sync team availability.'
  },
  {
    question: 'What if I need help or support?',
    answer: 'BookYourPTO has comprehensive documentation, and our community is active on GitHub Discussions. For enterprise deployments, commercial support options are available.'
  },
  {
    question: 'Can I migrate from our current system?',
    answer: 'Yes! We provide migration guides and import tools for common PTO systems. You can bulk import users, leave balances, and historical data via CSV or our API.'
  }
]
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.floating-shape-1 {
  animation: float 15s ease-in-out infinite;
}

.floating-shape-2 {
  animation: float 20s ease-in-out infinite 2s;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}
</style>
