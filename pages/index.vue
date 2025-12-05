<template>
  <div class="bg-white dark:bg-gray-950">
    <section class="py-20 px-4">
      <div class="container mx-auto text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Open-Source Time-Off Management
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Self-hosted PTO tracking for modern teams. Simple, powerful, and completely free.
        </p>
        <div class="flex gap-4 justify-center">
          <UButton size="lg" color="primary">
            Get Started
          </UButton>
          <UButton size="lg" color="neutral" variant="outline">
            View on GitHub
          </UButton>
        </div>
      </div>
    </section>

    <section class="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto">
        <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Key Features
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Multi-Tenant</h3>
            <p class="text-gray-600 dark:text-gray-400">Support multiple organizations with custom branding</p>
          </div>
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Calendar Sync</h3>
            <p class="text-gray-600 dark:text-gray-400">Integrates with Google Calendar and Outlook</p>
          </div>
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Self-Hosted</h3>
            <p class="text-gray-600 dark:text-gray-400">Full control with Docker deployment</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
