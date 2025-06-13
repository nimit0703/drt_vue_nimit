<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold mb-6 text-center">🛰️ Satellite Dashboard</h1>

      <!-- Search Section -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="flex gap-4">
          <input
            v-model="searchInput"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Search by Name or NORAD ID (Press Enter to search)"
            class="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button 
            @click="handleSearch" 
            class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
          >
            Search
          </button>
          <button 
            @click="clearSearch" 
            class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Object Types Filter -->
          <div>
            <label class="block text-sm font-semibold mb-2">Object Types</label>
            <div class="space-y-2 max-h-32 overflow-y-auto bg-gray-700 p-2 rounded">
              <label v-for="type in objectTypeOptions" :key="type" class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  :value="type"
                  v-model="selectedObjectTypes"
                  class="rounded"
                />
                <span class="text-sm">{{ type }} ({{ getTypeCount(type) }})</span>
              </label>
            </div>
          </div>

          <!-- Orbit Codes Filter -->
          <div>
            <label class="block text-sm font-semibold mb-2">Orbit Codes</label>
            <div class="space-y-2 max-h-32 overflow-y-auto bg-gray-700 p-2 rounded">
              <label v-for="code in orbitCodeOptions" :key="code" class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  :value="code"
                  v-model="selectedOrbitCodes"
                  class="rounded"
                />
                <span class="text-sm">{{ code }} ({{ getOrbitCount(code) }})</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex gap-4 items-center">
          <button 
            @click="applyFilters" 
            class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
          <button 
            @click="clearFilters" 
            class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
          <span class="text-sm text-gray-400">
            Showing {{ filteredSatellites.length }} of {{ satellites.length }} satellites
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-lg">Loading satellites...</span>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
        <p class="text-red-300">{{ error }}</p>
        <button @click="fetchSatellites" class="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors">
          Retry
        </button>
      </div>

      <!-- Results Section -->
      <div v-if="!loading && !error" class="bg-gray-800 rounded-lg overflow-hidden">
        <!-- Table Header -->
        <div class="bg-gray-700 px-4 py-3 grid grid-cols-12 gap-4 font-semibold text-sm">
          <div class="col-span-1">
            <input
              type="checkbox"
              :checked="allFilteredSelected"
              @change="toggleSelectAll"
              class="rounded"
            />
          </div>
          <div class="col-span-3 cursor-pointer hover:text-blue-400" @click="sortBy('name')">
            Name {{ getSortIcon('name') }}
          </div>
          <div class="col-span-2 cursor-pointer hover:text-blue-400" @click="sortBy('noradCatId')">
            NORAD ID {{ getSortIcon('noradCatId') }}
          </div>
          <div class="col-span-2">Orbit Code</div>
          <div class="col-span-2">Object Type</div>
          <div class="col-span-1 cursor-pointer hover:text-blue-400" @click="sortBy('countryCode')">
            Country {{ getSortIcon('countryCode') }}
          </div>
          <div class="col-span-1 cursor-pointer hover:text-blue-400" @click="sortBy('launchDate')">
            Launch {{ getSortIcon('launchDate') }}
          </div>
        </div>

        <!-- Virtualized List -->
        <div class="h-96 overflow-auto" ref="scrollContainer" @scroll="handleScroll">
          <div :style="{ height: totalHeight + 'px', position: 'relative' }">
            <div
              v-for="(item, index) in visibleItems"
              :key="item.noradCatId"
              :style="{ 
                position: 'absolute',
                top: (startIndex + index) * itemHeight + 'px',
                width: '100%',
                height: itemHeight + 'px'
              }"
              class="px-4 py-2 border-b border-gray-700 hover:bg-gray-700 transition-colors grid grid-cols-12 gap-4 items-center text-sm"
            >
              <div class="col-span-1">
                <input
                  type="checkbox"
                  :checked="isSelected(item)"
                  @change="toggleSelection(item)"
                  class="rounded"
                />
              </div>
              <div class="col-span-3 font-medium truncate" :title="item.name">
                {{ item.name }}
              </div>
              <div class="col-span-2 text-blue-400">{{ item.noradCatId }}</div>
              <div class="col-span-2">
                <span class="px-2 py-1 bg-gray-600 rounded text-xs">
                  {{ item.orbitCode || 'N/A' }}
                </span>
              </div>
              <div class="col-span-2">
                <span :class="getObjectTypeColor(item.objectType)" class="px-2 py-1 rounded text-xs">
                  {{ item.objectType }}
                </span>
              </div>
              <div class="col-span-1">{{ item.countryCode || 'N/A' }}</div>
              <div class="col-span-1 text-xs">{{ formatDate(item.launchDate) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selection Summary and Proceed -->
      <div v-if="!loading && !error" class="mt-6 bg-gray-800 rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <span class="text-lg font-semibold">
              Selected: {{ selectedSatellites.length }} / 10
            </span>
            <div v-if="selectionError" class="text-red-400 text-sm">
              {{ selectionError }}
            </div>
          </div>
          <div class="flex gap-4">
            <button
              @click="clearSelection"
              :disabled="selectedSatellites.length === 0"
              class="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
            >
              Clear Selection
            </button>
            <button
              @click="proceed"
              :disabled="selectedSatellites.length === 0"
              class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition-colors"
            >
              Proceed with Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
// Import the API utilities instead of direct axios
import { satelliteApi, storage, formatters, debounce } from '../utils/api.ts'

// Types
interface Satellite {
  noradCatId: string
  intlDes: string
  name: string
  launchDate: string | null
  decayDate: string | null
  objectType: string
  launchSiteCode: string
  countryCode: string
  orbitCode: string
}

// Router
const router = useRouter()

// Reactive state
const satellites = ref<Satellite[]>([])
const filteredSatellites = ref<Satellite[]>([])
const selectedSatellites = ref<Satellite[]>([])
const loading = ref(false)
const error = ref('')
const selectionError = ref('')

// Search and filters
const searchInput = ref('')
const currentSearch = ref('')
const selectedObjectTypes = ref<string[]>([])
const selectedOrbitCodes = ref<string[]>([])

// Sorting
const sortField = ref<keyof Satellite>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Virtualization
const scrollContainer = ref<HTMLElement>()
const itemHeight = 50
const visibleCount = ref(10)
const scrollTop = ref(0)

// Filter options
const objectTypeOptions = ['ROCKET BODY', 'DEBRIS', 'UNKNOWN', 'PAYLOAD']
const orbitCodeOptions = [
  'LEO', 'LEO1', 'LEO2', 'LEO3', 'LEO4', 'MEO', 'GEO', 'HEO', 'IGO', 'EGO',
  'NSO', 'GTO', 'GHO', 'HAO', 'MGO', 'LMO', 'UFO', 'ESO', 'UNKNOWN'
]

// API counts
const apiCounts = ref<Record<string, number>>({})

// Computed properties
const totalHeight = computed(() => filteredSatellites.value.length * itemHeight)
const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight))
const endIndex = computed(() => Math.min(startIndex.value + visibleCount.value, filteredSatellites.value.length))
const visibleItems = computed(() => filteredSatellites.value.slice(startIndex.value, endIndex.value))

const allFilteredSelected = computed(() => {
  const visibleIds = visibleItems.value.map(item => item.noradCatId)
  return visibleIds.length > 0 && visibleIds.every(id => 
    selectedSatellites.value.some(selected => selected.noradCatId === id)
  )
})

// Methods - Now using the centralized API
const fetchSatellites = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Use the centralized API method
    const response = await satelliteApi.getSatellites({
      objectTypes: selectedObjectTypes.value.length > 0 ? selectedObjectTypes.value : undefined,
      attributes: ['noradCatId', 'intlDes', 'name', 'launchDate', 'objectType', 'countryCode', 'orbitCode']
    })
    
    satellites.value = response.data || []
    
    // Get counts manually since API doesn't provide them
    await updateCounts()
    
    applyFiltersAndSearch()
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch satellites'
    satellites.value = []
    apiCounts.value = {
      'ROCKET BODY': 0,
      'DEBRIS': 0,
      'UNKNOWN': 0,
      'PAYLOAD': 0,
    }
  } finally {
    loading.value = false
  }
}

// Update counts manually from the data
const updateCounts = async () => {
  try {
    const counts = await satelliteApi.getSatelliteCounts()
    apiCounts.value = counts
  } catch (err) {
    console.error('Failed to get satellite counts:', err)
    // Fallback: count from loaded data
    const fallbackCounts: Record<string, number> = {
      'ROCKET BODY': 0,
      'DEBRIS': 0,
      'UNKNOWN': 0,
      'PAYLOAD': 0,
    }
    
    satellites.value.forEach(satellite => {
      if (fallbackCounts.hasOwnProperty(satellite.objectType)) {
        fallbackCounts[satellite.objectType]++
      }
    })
    
    apiCounts.value = fallbackCounts
  }
}

const applyFiltersAndSearch = () => {
  let filtered = [...satellites.value]
  
  // Apply search
  if (currentSearch.value) {
    const searchLower = currentSearch.value.toLowerCase()
    filtered = filtered.filter(sat =>
      sat.name.toLowerCase().includes(searchLower) ||
      sat.noradCatId.toLowerCase().includes(searchLower)
    )
  }
  
  // Apply orbit code filter
  if (selectedOrbitCodes.value.length > 0) {
    filtered = filtered.filter(sat =>
      selectedOrbitCodes.value.includes(sat.orbitCode)
    )
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    const aVal = a[sortField.value] || ''
    const bVal = b[sortField.value] || ''
    
    if (sortField.value === 'launchDate') {
      const aDate = new Date(aVal as string).getTime() || 0
      const bDate = new Date(bVal as string).getTime() || 0
      return sortDirection.value === 'asc' ? aDate - bDate : bDate - aDate
    }
    
    const comparison = String(aVal).localeCompare(String(bVal))
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
  
  filteredSatellites.value = filtered
  scrollTop.value = 0
}

// Debounced search handler
const debouncedSearch = debounce(() => {
  currentSearch.value = searchInput.value
  applyFiltersAndSearch()
}, 300)

const handleSearch = () => {
  currentSearch.value = searchInput.value
  applyFiltersAndSearch()
}

const clearSearch = () => {
  searchInput.value = ''
  currentSearch.value = ''
  applyFiltersAndSearch()
}

const applyFilters = () => {
  fetchSatellites()
}

const clearFilters = () => {
  selectedObjectTypes.value = []
  selectedOrbitCodes.value = []
  fetchSatellites()
}

const sortBy = (field: keyof Satellite) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  applyFiltersAndSearch()
}

const getSortIcon = (field: keyof Satellite) => {
  if (sortField.value !== field) return '↕️'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const toggleSelection = (item: Satellite) => {
  const index = selectedSatellites.value.findIndex(s => s.noradCatId === item.noradCatId)
  
  if (index >= 0) {
    selectedSatellites.value.splice(index, 1)
    selectionError.value = ''
  } else {
    if (selectedSatellites.value.length >= 10) {
      selectionError.value = 'Maximum 10 satellites can be selected'
      setTimeout(() => selectionError.value = '', 3000)
      return
    }
    selectedSatellites.value.push(item)
    selectionError.value = ''
  }
  
  // Save selection using storage utility
  storage.set('selectedSatellites', selectedSatellites.value)
}

const toggleSelectAll = () => {
  const visibleIds = visibleItems.value.map(item => item.noradCatId)
  const allSelected = visibleIds.every(id => 
    selectedSatellites.value.some(selected => selected.noradCatId === id)
  )
  
  if (allSelected) {
    // Deselect all visible
    selectedSatellites.value = selectedSatellites.value.filter(selected =>
      !visibleIds.includes(selected.noradCatId)
    )
  } else {
    // Select all visible (up to limit)
    visibleItems.value.forEach(item => {
      if (selectedSatellites.value.length < 10 && !isSelected(item)) {
        selectedSatellites.value.push(item)
      }
    })
  }
  
  // Save selection using storage utility
  storage.set('selectedSatellites', selectedSatellites.value)
}

const isSelected = (item: Satellite) => {
  return selectedSatellites.value.some(s => s.noradCatId === item.noradCatId)
}

const clearSelection = () => {
  selectedSatellites.value = []
  selectionError.value = ''
  // Clear from storage using utility
  storage.remove('selectedSatellites')
}

const proceed = () => {
  if (selectedSatellites.value.length === 0) return
  
  // Save using storage utility
  storage.set('selectedSatellites', selectedSatellites.value)
  router.push('/selected')
}

const getTypeCount = (type: string) => {
  return apiCounts.value[type] || 0
}

const getOrbitCount = (code: string) => {
  return satellites.value.filter(sat => sat.orbitCode === code).length
}

const getObjectTypeColor = (type: string) => {
  const colors = {
    'PAYLOAD': 'bg-green-600',
    'ROCKET BODY': 'bg-blue-600',
    'DEBRIS': 'bg-red-600',
    'UNKNOWN': 'bg-gray-600'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-600'
}

// Use the formatter utility
const formatDate = (date: string | null) => {
  return formatters.date(date)
}

// Handle scroll for virtualization
const handleScroll = () => {
  if (scrollContainer.value) {
    scrollTop.value = scrollContainer.value.scrollTop
  }
}

// Watchers and lifecycle
watch([selectedObjectTypes, selectedOrbitCodes], () => {
  // Update counts when filters change
  nextTick(() => {
    orbitCodeOptions.forEach(code => {
      getOrbitCount(code)
    })
  })
})

// Add debounced search on input change
watch(searchInput, () => {
  debouncedSearch()
})

onMounted(() => {
  fetchSatellites()
  
  // Load persisted selection using storage utility
  const saved = storage.get<Satellite[]>('selectedSatellites')
  if (saved) {
    selectedSatellites.value = saved
  }
  
  // Set up virtualization
  if (scrollContainer.value) {
    const containerHeight = scrollContainer.value.clientHeight
    visibleCount.value = Math.ceil(containerHeight / itemHeight) + 5
    scrollContainer.value.addEventListener('scroll', handleScroll)
  }
})
</script>