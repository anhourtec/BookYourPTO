<template>
  <div class="bg-background min-h-screen">
    <!-- Hero Section -->
    <section class="relative py-20 px-4 overflow-hidden">
      <!-- Animated background -->
      <div class="hero-gradient absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />
      
      <!-- Floating shapes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="floating-shape-1 absolute top-20 left-10 w-72 h-72 bg-foreground/5 rounded-full blur-3xl" />
        <div class="floating-shape-2 absolute bottom-20 right-10 w-96 h-96 bg-foreground/5 rounded-full blur-3xl" />
      </div>

      <div class="container mx-auto text-center relative z-10">
        <h1 class="fade-in-up text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          Open-Source<br />
          <span class="relative inline-block">
            <span class="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Time-Off Management
            </span>
            <span class="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-foreground to-foreground/70 rounded-full"></span>
          </span>
        </h1>
        
        <p class="fade-in-up delay-200 text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Self-hosted PTO tracking for modern teams. Simple, powerful, and completely free.
        </p>
        
        <div class="fade-in-up delay-400 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <UButton 
            size="xl" 
            class="button-hover bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg shadow-lg"
          >
            <Icon name="lucide:rocket" class="w-5 h-5 mr-2" />
            Get Started
          </UButton>
          <UButton 
            size="xl" 
            variant="outline"
            class="button-hover border-border hover:bg-muted px-8 py-4 text-lg"
          >
            <Icon name="lucide:github" class="w-5 h-5 mr-2" />
            View on GitHub
          </UButton>
        </div>

        <div class="fade-in-up delay-600 mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-foreground mb-1">100%</div>
            <div class="text-sm text-muted-foreground">Open Source</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-foreground mb-1">∞</div>
            <div class="text-sm text-muted-foreground">Organizations</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-foreground mb-1">🚀</div>
            <div class="text-sm text-muted-foreground">Easy Setup</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-4 bg-muted/30">
      <div class="container mx-auto">
        <h2 class="fade-in-up text-4xl md:text-5xl font-bold text-center text-foreground mb-4">
          Everything You Need
        </h2>
        <p class="fade-in-up delay-100 text-center text-muted-foreground mb-16 text-lg">
          Powerful features for teams of all sizes
        </p>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="feature-card fade-in-up delay-100 group bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl border border-border">
            <div class="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mb-6 icon-bounce group-hover:bg-foreground/10 transition-colors">
              <Icon name="lucide:building-2" class="w-7 h-7 text-foreground" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-card-foreground">Multi-Tenant Architecture</h3>
            <p class="text-muted-foreground leading-relaxed">
              Support multiple organizations with custom branding, domains, and isolated data.
            </p>
          </div>

          <div class="feature-card fade-in-up delay-200 group bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl border border-border">
            <div class="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mb-6 icon-bounce group-hover:bg-foreground/10 transition-colors">
              <Icon name="lucide:calendar-check" class="w-7 h-7 text-foreground" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-card-foreground">Calendar Integration</h3>
            <p class="text-muted-foreground leading-relaxed">
              Seamless sync with Google Calendar and Outlook.
            </p>
          </div>

          <div class="feature-card fade-in-up delay-300 group bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl border border-border">
            <div class="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mb-6 icon-bounce group-hover:bg-foreground/10 transition-colors">
              <Icon name="lucide:file-signature" class="w-7 h-7 text-foreground" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-card-foreground">Document Management</h3>
            <p class="text-muted-foreground leading-relaxed">
              E-signature support for contracts and HR documents.
            </p>
          </div>

          <div class="feature-card fade-in-up delay-400 group bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl border border-border">
            <div class="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mb-6 icon-bounce group-hover:bg-foreground/10 transition-colors">
              <Icon name="lucide:zap" class="w-7 h-7 text-foreground" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-card-foreground">Lightning Fast</h3>
            <p class="text-muted-foreground leading-relaxed">
              Redis caching and optimized queries.
            </p>
          </div>

          <div class="feature-card fade-in-up delay-500 group bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl border border-border">
            <div class="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mb-6 icon-bounce group-hover:bg-foreground/10 transition-colors">
              <Icon name="lucide:server" class="w-7 h-7 text-foreground" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-card-foreground">Self-Hosted</h3>
            <p class="text-muted-foreground leading-relaxed">
              Full control with Docker deployment.
            </p>
          </div>

          <div class="feature-card fade-in-up delay-600 group bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl border border-border">
            <div class="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mb-6 icon-bounce group-hover:bg-foreground/10 transition-colors">
              <Icon name="lucide:shield-check" class="w-7 h-7 text-foreground" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-card-foreground">Enterprise Security</h3>
            <p class="text-muted-foreground leading-relaxed">
              GDPR compliant with encryption.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4">
      <div class="container mx-auto">
        <div class="fade-in-up cta-card bg-primary text-primary-foreground rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div class="absolute inset-0 opacity-5">
            <div class="absolute inset-0" style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 30px 30px;"></div>
          </div>
          
          <div class="relative z-10">
            <h2 class="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join teams using BookYourPTO
            </p>
            <UButton 
              size="xl" 
              class="button-hover bg-background text-foreground hover:bg-background/90 px-10 py-5 text-lg shadow-2xl"
            >
              <Icon name="lucide:download" class="w-5 h-5 mr-2" />
              Deploy Now
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack -->
    <section class="py-20 px-4 border-t border-border">
      <div class="container mx-auto">
        <h3 class="fade-in-up text-2xl font-semibold text-center text-foreground mb-12">
          Built with Modern Technologies
        </h3>
        <div class="fade-in-up delay-200 flex flex-wrap justify-center items-center gap-12 opacity-60">
          <div class="flex items-center gap-2">
            <Icon name="lucide:layout-dashboard" class="w-6 h-6" />
            <span class="text-muted-foreground font-medium">Nuxt 3</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:database" class="w-6 h-6" />
            <span class="text-muted-foreground font-medium">PostgreSQL</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:zap" class="w-6 h-6" />
            <span class="text-muted-foreground font-medium">Redis</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:container" class="w-6 h-6" />
            <span class="text-muted-foreground font-medium">Docker</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
.delay-600 { animation-delay: 0.6s; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.floating-shape-1 {
  animation: float 8s ease-in-out infinite;
}

.floating-shape-2 {
  animation: float 10s ease-in-out infinite 1s;
}

.hero-gradient {
  animation: fadeInUp 1s ease-out forwards;
}

.feature-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-8px);
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.icon-bounce {
  animation: iconBounce 2s ease-in-out infinite;
}

.button-hover {
  transition: all 0.3s ease;
}

.button-hover:hover {
  transform: scale(1.05);
}

.cta-card {
  transition: transform 0.3s ease;
}

.cta-card:hover {
  transform: scale(1.02);
}
</style>