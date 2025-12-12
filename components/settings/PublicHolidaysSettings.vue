<template>
  <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-xl font-bold text-[rgb(var(--foreground))]">Public Holidays</h2>
        <p class="text-sm text-[rgb(var(--muted-foreground))] mt-1">
          Manage holiday locations. Holidays are automatically fetched for all years.
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-5 h-5 text-[rgb(var(--destructive))]" />
          <p class="text-sm text-[rgb(var(--destructive))]">{{ error }}</p>
        </div>
      </div>

      <!-- Add Location Section -->
      <div class="mb-6 p-4 bg-[rgb(var(--muted))]/30 border border-[rgb(var(--border))] rounded-lg">
        <h3 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Add Holiday Location</h3>
        
        <div class="space-y-3">
          <!-- Country Selection with Search -->
          <div class="relative">
            <div class="flex gap-3">
              <div class="flex-1 relative">
                <input
                  ref="countrySearchInput"
                  v-model="countrySearchQuery"
                  @focus="showCountryDropdown = true"
                  @input="onCountrySearch"
                  type="text"
                  placeholder="Search for a country..."
                  class="w-full px-4 py-2.5 pr-10 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
                />
                <Icon name="lucide:search" class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
                
                <!-- Country Dropdown -->
                <div 
                  v-if="showCountryDropdown && filteredCountries.length > 0"
                  class="absolute z-50 w-full mt-1 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  <button
                    v-for="country in filteredCountries"
                    :key="country.countryCode"
                    @click="selectCountry(country)"
                    class="w-full px-4 py-2.5 text-left hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--foreground))] text-sm"
                  >
                    {{ country.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Country Display -->
          <div v-if="selectedCountry" class="flex items-center gap-2 p-3 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg">
            <Icon name="lucide:map-pin" class="w-4 h-4 text-[rgb(var(--primary))]" />
            <span class="text-sm font-medium text-[rgb(var(--foreground))]">{{ getCountryName(selectedCountry) }}</span>
            <button
              @click="clearCountrySelection"
              class="ml-auto p-1 hover:bg-[rgb(var(--muted))] rounded transition-colors"
            >
              <Icon name="lucide:x" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            </button>
          </div>

          <!-- State/Province Selection (if available) -->
          <div v-if="selectedCountry && countryHasSubdivisions(selectedCountry)" class="flex gap-3">
            <select
              v-model="selectedSubdivision"
              :disabled="loadingSubdivisions"
              class="flex-1 px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50"
            >
              <option value="">All states/provinces (National holidays only)</option>
              <option v-for="subdivision in availableSubdivisions" :key="subdivision.code" :value="subdivision.code">
                {{ subdivision.name }}
              </option>
            </select>
            <button
              @click="addLocation"
              :disabled="!selectedCountry || addingLocation"
              class="px-6 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              <Icon v-if="addingLocation" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <Icon v-else name="lucide:plus" class="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </div>

          <!-- Add Button (for countries without subdivisions) -->
          <div v-else-if="selectedCountry" class="flex gap-3">
            <button
              @click="addLocation"
              :disabled="!selectedCountry || addingLocation"
              class="px-6 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon v-if="addingLocation" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <Icon v-else name="lucide:plus" class="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </div>
        </div>

        <p class="text-xs text-[rgb(var(--muted-foreground))] mt-3">
          Public holidays will be shown in user calendars but won't deduct from their leave allowance.
          {{ selectedCountry && countryHasSubdivisions(selectedCountry) ? 'Select a specific state/province to include regional holidays.' : '' }}
        </p>
      </div>

      <!-- Active Locations -->
      <div v-if="uniqueLocations.length === 0" class="text-center py-12">
        <Icon name="lucide:calendar-off" class="w-12 h-12 mx-auto text-[rgb(var(--muted-foreground))] mb-3" />
        <p class="text-[rgb(var(--muted-foreground))] mb-2">You have no public holiday locations set up yet.</p>
        <p class="text-sm text-[rgb(var(--muted-foreground))]">
          Search and select a country above to get started.
        </p>
      </div>

      <!-- Locations List -->
      <div v-else class="space-y-4">
        <h3 class="text-sm font-semibold text-[rgb(var(--foreground))]">Active Locations</h3>
        
        <div
          v-for="location in uniqueLocations"
          :key="`${location.country}-${location.subdivision || 'national'}`"
          class="border border-[rgb(var(--border))] rounded-lg overflow-hidden"
        >
          <!-- Location Header -->
          <div class="flex items-center justify-between p-4 bg-[rgb(var(--background))]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-[rgb(var(--primary))]/10 flex items-center justify-center">
                <Icon name="lucide:map-pin" class="w-5 h-5 text-[rgb(var(--primary))]" />
              </div>
              <div>
                <h4 class="font-semibold text-[rgb(var(--foreground))]">
                  {{ getCountryName(location.country) }}
                  <span v-if="location.subdivision" class="text-sm font-normal text-[rgb(var(--muted-foreground))]">
                    ({{ location.subdivision }})
                  </span>
                </h4>
                <p class="text-xs text-[rgb(var(--muted-foreground))]">
                  Active location - holidays fetched automatically
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="confirmDeleteLocation(location)"
                class="p-2 text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/10 rounded transition-colors"
                title="Remove location"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Box -->
      <div class="mt-6 p-4 bg-[rgb(var(--primary))]/5 border border-[rgb(var(--primary))]/20 rounded-lg">
        <div class="flex gap-3">
          <Icon name="lucide:info" class="w-5 h-5 text-[rgb(var(--primary))] flex-shrink-0 mt-0.5" />
          <div class="text-sm text-[rgb(var(--foreground))]">
            <p class="font-medium mb-1">How public holidays work:</p>
            <ul class="space-y-1 text-[rgb(var(--muted-foreground))]">
              <li>• Public holidays are displayed in user calendars automatically</li>
              <li>• They do not count against users' leave allowances</li>
              <li>• Holidays are fetched automatically for any year viewed</li>
              <li>• Select specific states/provinces for region-specific holidays</li>
              <li>• Users cannot book leave on public holidays</li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- Delete Confirmation Modal -->
  <CustomModal v-model="showDeleteConfirm">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full bg-[rgb(var(--destructive))]/10 flex items-center justify-center">
          <Icon name="lucide:alert-triangle" class="w-6 h-6 text-[rgb(var(--destructive))]" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Remove Holiday Location</h3>
          <p class="text-sm text-[rgb(var(--muted-foreground))]">This action cannot be undone</p>
        </div>
      </div>

      <p class="text-sm text-[rgb(var(--foreground))] mb-6">
        Are you sure you want to remove <strong>{{ getCountryName(locationToDelete?.country || '') }}</strong>
        <span v-if="locationToDelete?.subdivision"> ({{ locationToDelete.subdivision }})</span>
        from your holiday locations?
        This will remove all associated holidays (all years) from user calendars.
      </p>

      <div class="flex gap-3">
        <button
          @click="showDeleteConfirm = false"
          class="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--foreground))]"
        >
          Cancel
        </button>
        <button
          @click="deleteLocation"
          :disabled="deleting"
          class="flex-1 px-4 py-2 bg-[rgb(var(--destructive))] text-white rounded-lg hover:bg-[rgb(var(--destructive))]/90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          <Icon v-if="deleting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span>{{ deleting ? 'Removing...' : 'Remove' }}</span>
        </button>
      </div>
    </div>
  </CustomModal>
</template>

<script setup lang="ts">
interface Country {
  countryCode: string
  name: string
}

interface Subdivision {
  code: string
  name: string
}

interface HolidayLocation {
  id: string
  country: string
  subdivision?: string | null
}

const loading = ref(true)
const error = ref('')
const locations = ref<HolidayLocation[]>([])
const availableCountries = ref<Country[]>([])
const availableSubdivisions = ref<Subdivision[]>([])
const selectedCountry = ref('')
const selectedSubdivision = ref('')
const addingLocation = ref(false)
const loadingSubdivisions = ref(false)

// Search functionality
const countrySearchQuery = ref('')
const showCountryDropdown = ref(false)
const filteredCountries = ref<Country[]>([])
const countrySearchInput = ref<HTMLInputElement | null>(null)

// Delete confirmation
const showDeleteConfirm = ref(false)
const locationToDelete = ref<HolidayLocation | null>(null)
const deleting = ref(false)

// Countries that support subdivisions
const countriesWithSubdivisions = ['US', 'CA', 'AU', 'DE', 'BR', 'IT', 'ES', 'CH', 'NZ', 'GB', 'CL', 'BA', 'PT']

// ✅ Get unique locations (remove duplicates)
const uniqueLocations = computed(() => {
  const seen = new Set<string>()
  return locations.value.filter(location => {
    const key = `${location.country}-${location.subdivision || 'national'}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})

// Check if country has subdivision support
const countryHasSubdivisions = (countryCode: string) => {
  return countriesWithSubdivisions.includes(countryCode)
}

// Handle country search
const onCountrySearch = () => {
  const query = countrySearchQuery.value.toLowerCase().trim()
  
  if (!query) {
    filteredCountries.value = availableCountries.value
  } else {
    filteredCountries.value = availableCountries.value.filter(country =>
      country.name.toLowerCase().includes(query) ||
      country.countryCode.toLowerCase().includes(query)
    )
  }
  
  showCountryDropdown.value = true
}

// Select country from dropdown
const selectCountry = async (country: Country) => {
  selectedCountry.value = country.countryCode
  countrySearchQuery.value = country.name
  showCountryDropdown.value = false
  
  // Reset subdivision
  selectedSubdivision.value = ''
  availableSubdivisions.value = []
  
  // Fetch subdivisions if available
  if (countryHasSubdivisions(country.countryCode)) {
    await fetchSubdivisions(country.countryCode)
  }
}

// Clear country selection
const clearCountrySelection = () => {
  selectedCountry.value = ''
  countrySearchQuery.value = ''
  selectedSubdivision.value = ''
  availableSubdivisions.value = []
  filteredCountries.value = availableCountries.value
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showCountryDropdown.value = false
  }
}

// Fetch available countries
const fetchAvailableCountries = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    const countries = await $fetch<Country[]>('/api/public-holidays/countries', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    availableCountries.value = countries.sort((a, b) => a.name.localeCompare(b.name))
    filteredCountries.value = availableCountries.value
  } catch (err) {
    console.error('Error fetching countries:', err)
    error.value = 'Failed to load available countries'
  }
}

// Fetch subdivisions for a country
const fetchSubdivisions = async (countryCode: string) => {
  loadingSubdivisions.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const subdivisions = await $fetch<Subdivision[]>(`/api/public-holidays/subdivisions/${countryCode}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    availableSubdivisions.value = subdivisions
  } catch (err) {
    console.error('Error fetching subdivisions:', err)
    availableSubdivisions.value = []
  } finally {
    loadingSubdivisions.value = false
  }
}

// ✅ Fetch distinct locations (not all holidays)
const fetchLocations = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    // This returns all holidays, but we'll extract unique locations
    const holidays = await $fetch<HolidayLocation[]>('/api/public-holidays', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    locations.value = holidays
  } catch (err: any) {
    console.error('Error fetching locations:', err)
    error.value = err.data?.message || 'Failed to load holiday locations'
  } finally {
    loading.value = false
  }
}

// Add new location
const addLocation = async () => {
  if (!selectedCountry.value) return
  
  addingLocation.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    const currentYear = new Date().getFullYear()
    
    await $fetch('/api/public-holidays', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        country: selectedCountry.value,
        subdivision: selectedSubdivision.value || null,
        year: currentYear,
      },
    })
    
    clearCountrySelection()
    await fetchLocations()
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to add holiday location'
  } finally {
    addingLocation.value = false
  }
}

// Confirm delete location
const confirmDeleteLocation = (location: HolidayLocation) => {
  locationToDelete.value = location
  showDeleteConfirm.value = true
}

// Delete location
const deleteLocation = async () => {
  if (!locationToDelete.value) return
  
  deleting.value = true
  try {
    const token = localStorage.getItem('auth_token')
    await $fetch(`/api/public-holidays/${locationToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    
    showDeleteConfirm.value = false
    locationToDelete.value = null
    await fetchLocations()
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to remove location'
    showDeleteConfirm.value = false
  } finally {
    deleting.value = false
  }
}

// Get country name from code
const getCountryName = (countryCode: string) => {
  const country = availableCountries.value.find(c => c.countryCode === countryCode)
  return country?.name || countryCode
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchAvailableCountries(),
    fetchLocations()
  ])
  
  document.addEventListener('click', handleClickOutside)
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>