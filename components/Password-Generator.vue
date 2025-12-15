<template>
  <div class="relative">
    <button
      type="button"
      @click="showGenerator = !showGenerator"
      class="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs font-medium text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded-lg transition-colors border border-[rgb(var(--primary))]/30"
      :title="showGenerator ? 'Close password generator' : 'Generate random password'"
    >
      <Icon name="lucide:wand-2" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span class="hidden sm:inline">{{ showGenerator ? 'Close Generator' : 'Generate Password' }}</span>
      <span class="sm:hidden">{{ showGenerator ? 'Close' : 'Generate' }}</span>
    </button>

    <!-- Mobile Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showGenerator"
        @click="showGenerator = false"
        class="fixed inset-0 bg-black/50 z-[90] sm:hidden"
      ></div>
    </Transition>

    <!-- Password Generator Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="showGenerator"
        v-click-outside="() => showGenerator = false"
        class="fixed sm:absolute inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-2 sm:w-80 md:w-96 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-xl z-[100] max-h-[80vh] sm:max-h-[min(600px,80vh)] flex flex-col"
      >
        <!-- Header - Fixed -->
        <div class="px-4 py-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/30 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-[rgb(var(--foreground))]">Password Generator</h3>
            <button
              @click="showGenerator = false"
              class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition p-1"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1 overflow-y-auto overscroll-contain">
          <!-- Generated Password Display -->
          <div>
            <label class="block text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1.5 sm:mb-2 uppercase tracking-wide">
              Generated Password
            </label>
            <div class="relative">
              <input
                :value="generatedPassword"
                :type="showGeneratedPassword ? 'text' : 'password'"
                readonly
                class="w-full px-3 py-2.5 pr-20 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] text-sm font-mono"
                placeholder="Click generate..."
              />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  @click="showGeneratedPassword = !showGeneratedPassword"
                  class="p-1.5 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition rounded"
                  title="Toggle visibility"
                >
                  <Icon :name="showGeneratedPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
                </button>
                <button
                  v-if="generatedPassword"
                  type="button"
                  @click="copyToClipboard"
                  class="p-1.5 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition rounded"
                  :title="copied ? 'Copied!' : 'Copy password'"
                >
                  <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="w-4 h-4" :class="copied ? 'text-green-600' : ''" />
                </button>
              </div>
            </div>
          </div>

          <!-- Password Length Slider -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wide">
                Length
              </label>
              <span class="text-sm font-semibold text-[rgb(var(--foreground))] bg-[rgb(var(--muted))]/50 px-2 py-0.5 rounded">
                {{ options.length }}
              </span>
            </div>
            <input
              v-model.number="options.length"
              type="range"
              min="8"
              max="32"
              step="1"
              class="w-full h-2 bg-[rgb(var(--muted))] rounded-lg appearance-none cursor-pointer accent-[rgb(var(--primary))]"
              @input="generatePassword"
            />
            <div class="flex justify-between text-[10px] text-[rgb(var(--muted-foreground))] mt-1">
              <span>8</span>
              <span>16</span>
              <span>24</span>
              <span>32</span>
            </div>
          </div>

          <!-- Options -->
          <div class="space-y-1.5 sm:space-y-2">
            <label class="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wide block mb-1.5 sm:mb-2">
              Include
            </label>
            
            <div class="flex items-center justify-between p-2 sm:p-2.5 rounded-lg hover:bg-[rgb(var(--muted))]/30 transition">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Icon name="lucide:case-upper" class="w-4 h-4 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                <span class="text-sm text-[rgb(var(--foreground))] truncate">Uppercase <span class="text-xs text-[rgb(var(--muted-foreground))]">(A-Z)</span></span>
              </div>
              <SwitchToggle v-model="options.uppercase" @update:modelValue="generatePassword" class="flex-shrink-0" />
            </div>

            <div class="flex items-center justify-between p-2 sm:p-2.5 rounded-lg hover:bg-[rgb(var(--muted))]/30 transition">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Icon name="lucide:case-lower" class="w-4 h-4 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                <span class="text-sm text-[rgb(var(--foreground))] truncate">Lowercase <span class="text-xs text-[rgb(var(--muted-foreground))]">(a-z)</span></span>
              </div>
              <SwitchToggle v-model="options.lowercase" @update:modelValue="generatePassword" class="flex-shrink-0" />
            </div>

            <div class="flex items-center justify-between p-2 sm:p-2.5 rounded-lg hover:bg-[rgb(var(--muted))]/30 transition">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Icon name="lucide:hash" class="w-4 h-4 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                <span class="text-sm text-[rgb(var(--foreground))] truncate">Numbers <span class="text-xs text-[rgb(var(--muted-foreground))]">(0-9)</span></span>
              </div>
              <SwitchToggle v-model="options.numbers" @update:modelValue="generatePassword" class="flex-shrink-0" />
            </div>

            <div class="flex items-center justify-between p-2 sm:p-2.5 rounded-lg hover:bg-[rgb(var(--muted))]/30 transition">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Icon name="lucide:asterisk" class="w-4 h-4 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                <span class="text-sm text-[rgb(var(--foreground))] truncate">Symbols <span class="text-xs text-[rgb(var(--muted-foreground))]">(!@#$%)</span></span>
              </div>
              <SwitchToggle v-model="options.symbols" @update:modelValue="generatePassword" class="flex-shrink-0" />
            </div>
          </div>

          <!-- Info -->
          <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 sm:p-3">
            <div class="flex gap-2">
              <Icon name="lucide:info" class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p class="text-[11px] sm:text-xs text-blue-600 leading-snug">
                Strong passwords include a mix of uppercase, lowercase, numbers, and symbols.
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons - Fixed Footer -->
        <div class="p-3 sm:p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--card))] flex-shrink-0">
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              @click="generatePassword"
              class="flex-1 px-4 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition text-[rgb(var(--foreground))] flex items-center justify-center gap-2 font-medium text-sm"
            >
              <Icon name="lucide:refresh-cw" class="w-4 h-4" />
              <span>Regenerate</span>
            </button>
            <button
              type="button"
              @click="usePassword"
              :disabled="!generatedPassword"
              class="flex-1 px-4 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm"
            >
              <Icon name="lucide:check" class="w-4 h-4" />
              <span>Use Password</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

const emit = defineEmits<{
  'password-generated': [password: string]
}>()

const showGenerator = ref(false)
const showGeneratedPassword = ref(false)
const generatedPassword = ref('')
const copied = ref(false)

const options = ref<PasswordOptions>({
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
})

// Character sets
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

const generatePassword = () => {
  let charset = ''
  let password = ''

  // Build charset based on options
  if (options.value.uppercase) charset += UPPERCASE
  if (options.value.lowercase) charset += LOWERCASE
  if (options.value.numbers) charset += NUMBERS
  if (options.value.symbols) charset += SYMBOLS

  // Ensure at least one character set is selected
  if (charset === '') {
    options.value.lowercase = true
    charset = LOWERCASE
  }

  // Ensure we include at least one character from each selected type
  const guaranteedChars: string[] = []
  
  if (options.value.uppercase && UPPERCASE.length > 0) {
    const char = UPPERCASE.charAt(Math.floor(Math.random() * UPPERCASE.length))
    if (char) guaranteedChars.push(char)
  }
  if (options.value.lowercase && LOWERCASE.length > 0) {
    const char = LOWERCASE.charAt(Math.floor(Math.random() * LOWERCASE.length))
    if (char) guaranteedChars.push(char)
  }
  if (options.value.numbers && NUMBERS.length > 0) {
    const char = NUMBERS.charAt(Math.floor(Math.random() * NUMBERS.length))
    if (char) guaranteedChars.push(char)
  }
  if (options.value.symbols && SYMBOLS.length > 0) {
    const char = SYMBOLS.charAt(Math.floor(Math.random() * SYMBOLS.length))
    if (char) guaranteedChars.push(char)
  }

  // Generate remaining characters
  const remainingLength = options.value.length - guaranteedChars.length
  const passwordChars: string[] = []
  
  for (let i = 0; i < remainingLength; i++) {
    const char = charset.charAt(Math.floor(Math.random() * charset.length))
    if (char) passwordChars.push(char)
  }

  // Combine all characters
  const allChars: string[] = [...guaranteedChars, ...passwordChars]
  
  // Fisher-Yates shuffle
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = allChars[i]
    const swap = allChars[j]
    
    if (temp !== undefined && swap !== undefined) {
      allChars[i] = swap
      allChars[j] = temp
    }
  }

  generatedPassword.value = allChars.join('')
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedPassword.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy password:', err)
  }
}

const usePassword = () => {
  if (generatedPassword.value) {
    emit('password-generated', generatedPassword.value)
    showGenerator.value = false
  }
}

// Generate initial password when component mounts
onMounted(() => {
  generatePassword()
})

// Watch for generator open and generate new password
watch(showGenerator, (isOpen) => {
  if (isOpen) {
    generatePassword()
    showGeneratedPassword.value = false
    copied.value = false
    
    // Lock body scroll on mobile when generator is open
    if (window.innerWidth < 640) {
      document.body.style.overflow = 'hidden'
    }
  } else {
    // Unlock body scroll when generator is closed
    document.body.style.overflow = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>