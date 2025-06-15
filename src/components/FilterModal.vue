<!-- FilterModal.vue Component -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background-color: #000000ab;">
    <div class="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 class="text-xl font-semibold text-white">Filters</h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <div class="space-y-4">
          <!-- Country -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Country</label>
            <select
              v-model="filters.countryCode"
              class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Countries</option>
              <option v-for="country in countryOptions" :key="country" :value="country">
                {{ country }}
              </option>
            </select>
          </div>

          <!-- Orbit Regime -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Orbit Regime</label>
            <select
              v-model="filters.orbitCode"
              class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Orbit Regimes</option>
              <option v-for="regime in orbitRegimeOptions" :key="regime" :value="regime">
                {{ regime }}
              </option>
            </select>
          </div>

          <!-- Object Type -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Object Type</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  value="all"
                  :checked="filters.objectTypes.includes('all')"
                  @change="handleObjectTypeChange('all')"
                  class="rounded bg-gray-700 border-gray-600 mr-2"
                />
                <span class="text-sm text-gray-300">All</span>
              </label>
              <label v-for="type in objectTypeOptions" :key="type" class="flex items-center">
                <input
                  type="checkbox"
                  :value="type"
                  :checked="filters.objectTypes.includes(type)"
                  @change="handleObjectTypeChange(type)"
                  class="rounded bg-gray-700 border-gray-600 mr-2"
                />
                <span class="text-sm text-gray-300">{{ type }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-700">
        <button
          @click="clearFilters"
          class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Clear All
        </button>
        <div class="flex space-x-3">
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="applyFilters"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface Props {
  isOpen: boolean
}

interface FilterData {
  countryCode: string
  orbitCode: string
  objectTypes: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  apply: [filters: FilterData]
}>()

const filters = reactive<FilterData>({
  countryCode: '',
  orbitCode: '',
  objectTypes: ['all']
})

// Common satellite countries
const countryOptions = [
    "US", "CIS", "ESA", "PRC", "FR", "ORB", "TURK", "SES", "NZ", "AUS",
    "TBD", "UK", "NOR", "CHLE", "TWN", "JPN", "SPN", "MA", "IT", "CA",
    "ISRA", "UAE", "CZE", "POL", "SAFR", "FIN", "UKR", "IND", "IRAN", "GER",
    "ARGN", "LUXE", "BRAZ", "SKOR", "MALA", "SING", "SVN", "HUN", "EUTE", "AGO",
    "SWED", "EUME", "SWTZ", "KWT", "KEN", "MCO", "LTU", "DEN", "INDO", "THAI",
    "NETH", "ASRA", "BEL", "DJI", "RWA", "IM", "EGYP", "ITSO", "HRV", "BGR",
    "POR", "ESRO", "PAKI", "GLOB", "ISS", "SEAL", "AB", "CHBZ", "ROM", "VTNM",
    "NKOR", "PER", "FRIT", "RP", "GREC", "SVK", "GHA", "MNG", "BGD", "NIG",
    "CRI", "COL", "MEX", "SDN", "PRY", "MMR", "MUS", "PRI", "MDA", "UGA",
    "ZWE", "ABS", "QAT", "SAUD", "BELA", "NATO", "STCT", "NICO", "ALG", "KAZ",
    "AC", "USBZ", "EST", "ECU", "TMMC", "RASC", "O3B", "VENZ", "IRAQ", "AZER",
    "BOL", "URY", "CZCH", "FGER", "LAOS", "BWA", "JOR", "TUN", "BHR", "LKA", "NPL"
];

// Common orbit regimes
const orbitRegimeOptions = [
  'LEO', 'MEO', 'GEO', 'HEO', 'SSO', 'GTO', 'Molniya'
]

// Common object types
const objectTypeOptions = [
  'PAYLOAD', 'ROCKET BODY', 'DEBRIS', 'UNKNOWN'
]

const handleObjectTypeChange = (value: string) => {
  if (value === 'all') {
    // If 'all' is clicked, clear everything and set only 'all'
    filters.objectTypes = ['all']
  } else {
    // If any other option is clicked, remove 'all' and toggle the specific option
    const filteredTypes = filters.objectTypes.filter(type => type !== 'all')
    const index = filteredTypes.indexOf(value)
    
    if (index > -1) {
      filteredTypes.splice(index, 1)
    } else {
      filteredTypes.push(value)
    }
    
    // If no specific types are selected, default back to 'all'
    filters.objectTypes = filteredTypes.length > 0 ? filteredTypes : ['all']
  }
}

const clearFilters = () => {
  Object.assign(filters, {
    countryCode: '',
    orbitCode: '',
    objectTypes: ['all']
  })
}

const closeModal = () => {
  emit('close')
}

const applyFilters = () => {
  emit('apply', { ...filters })
  closeModal()
}
</script>