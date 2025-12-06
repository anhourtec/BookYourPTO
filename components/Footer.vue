<template>
  <footer class="border-t border-gray-200 dark:border-gray-800 mt-auto bg-white dark:bg-gray-950">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="font-bold text-gray-900 dark:text-white mb-4">BookYourPTO</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Open-source time-off management for modern teams.
          </p>
        </div>
        
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="#" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Features</NuxtLink></li>
            <li><NuxtLink to="#" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Pricing</NuxtLink></li>
            <li><NuxtLink to="#" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Documentation</NuxtLink></li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="https://github.com/yourusername/bookyourpto" target="_blank" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">GitHub</a></li>
            <li><NuxtLink to="#" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Community</NuxtLink></li>
            <li><NuxtLink to="#" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Support</NuxtLink></li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="#" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Privacy</NuxtLink></li>
            <li><NuxtLink to="#" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Terms</NuxtLink></li>
            <li><NuxtLink to="#" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">License</NuxtLink></li>
          </ul>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <p class="text-center text-sm text-gray-600 dark:text-gray-400">
          © {{ new Date().getFullYear() }} BookYourPTO. Licensed under GNU GPL v3.0.
        </p>
      </div>
    </div>
  </footer>
</template>
