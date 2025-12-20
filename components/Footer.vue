<template>
  <footer class="relative border-t border-gray-200/50 dark:border-gray-800/50 mt-auto bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
    <!-- Subtle gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] via-purple-500/[0.02] to-blue-500/[0.02] dark:from-blue-500/[0.01] dark:via-purple-500/[0.01] dark:to-blue-500/[0.01] pointer-events-none"></div>

    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <!-- Brand Section - Full width on mobile, then adapts -->
      <div class="mb-8 lg:mb-12">
        <div class="flex items-center gap-2 mb-4">
          <AppLogo />
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-sm">
          Open-source time-off management for modern teams. Streamline your leave requests and approvals with ease.
        </p>

        <!-- Social Links -->
        <div class="flex items-center gap-3">
          <a
            href="https://github.com/yourusername/bookyourpto"
            target="_blank"
            rel="noopener noreferrer"
            class="group p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-110"
            aria-label="GitHub"
          >
            <Icon name="lucide:github" class="w-5 h-5" />
          </a>
          <a
            href="#"
            class="group p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-110"
            aria-label="Twitter"
          >
            <Icon name="lucide:twitter" class="w-5 h-5" />
          </a>
          <a
            href="#"
            class="group p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-110"
            aria-label="LinkedIn"
          >
            <Icon name="lucide:linkedin" class="w-5 h-5" />
          </a>
        </div>
      </div>

      <!-- Links Sections - 2 columns on mobile, 4 on tablet/desktop -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        <!-- Left Column on Mobile: Product -->
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
          <ul class="space-y-3">
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Features
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Pricing
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Documentation
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Changelog
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Left Column on Mobile: Resources -->
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Resources</h4>
          <ul class="space-y-3">
            <li>
              <a
                href="https://github.com/yourusername/bookyourpto"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                GitHub
              </a>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Community
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Support
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Blog
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Right Column on Mobile: Company -->
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
          <ul class="space-y-3">
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                About
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Careers
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Contact
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Right Column on Mobile: Legal -->
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
          <ul class="space-y-3">
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Privacy
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                Terms
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                License
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
            © {{ new Date().getFullYear() }} BookYourPTO. Licensed under
            <a
              href="https://www.gnu.org/licenses/gpl-3.0.en.html"
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              GNU GPL v3.0
            </a>
          </p>

          <div class="flex items-center gap-6 text-sm">
            <NuxtLink
              to="#"
              class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Status
            </NuxtLink>
            <NuxtLink
              to="#"
              class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Security
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
