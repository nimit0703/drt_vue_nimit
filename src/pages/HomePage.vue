<template>
  <div class="min-h-screen bg-gray-900 text-white ">
    <!-- Mobile Layout -->
    <div class="lg:hidden">
      <!-- Mobile Header -->
      <div class="bg-gray-800 p-4 sticky top-0 z-20">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-bold">Create Asset List</h1>
          <!-- Mobile Selected Count Badge -->
          <div class="flex items-center space-x-2">
            <div class="bg-cyan-500 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              {{ selectedSatellites.length }} selected
            </div>
            <button
              @click="showMobilePanel = !showMobilePanel"
              class="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Search -->
        <div class="relative mb-3">
          <input
            v-model="searchInput"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Search satellites..."
            class="w-full px-4 py-3 pl-10 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          />
          <svg class="absolute left-3 top-3.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <!-- Mobile Filters Toggle -->
        <button
          @click="showMobileFilters = !showMobileFilters"
          class="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-between"
        >
          <span>Filters & Types</span>
          <svg 
            class="w-4 h-4 transition-transform"
            :class="showMobileFilters ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <!-- Mobile Filters Dropdown -->
        <div v-if="showMobileFilters" class="mt-3 space-y-3 pb-3 border-b border-gray-700">
          <!-- Object Type Pills -->
          <div class="space-y-2">
            <label class="text-xs text-gray-400 font-medium">OBJECT TYPES</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="type in objectTypeOptions.slice(0, 6)"
                :key="type.key"
                @click="toggleObjectType(type.key)"
                :class="[
                  'flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition',
                  selectedObjectTypes.includes(type.key) || type.key === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                ]"
              >
                <span class="mr-1">{{ type.label }}</span>
                <span class="bg-black bg-opacity-30 px-1.5 py-0.5 rounded-full text-xs">
                  {{ type.count }}
                </span>
              </button>
            </div>
          </div>

          <!-- Mobile Filter Selects -->
          <div class="grid grid-cols-2 gap-2">
            <select
              v-model="selectedConstellation"
              class="px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 text-sm"
            >
              <option value="">Constellation</option>
              <option v-for="constellation in constellationOptions" :key="constellation" :value="constellation">
                {{ constellation }}
              </option>
            </select>
            
            <select
              v-model="selectedCountry"
              class="px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 text-sm"
            >
              <option value="">Country</option>
              <option v-for="country in countryOptions" :key="country" :value="country">
                {{ country }}
              </option>
            </select>

            <select
              v-model="selectedPurpose"
              class="px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 text-sm"
            >
              <option value="">Purpose</option>
              <option v-for="purpose in purposeOptions" :key="purpose" :value="purpose">
                {{ purpose }}
              </option>
            </select>

            <select
              v-model="selectedRegime"
              class="px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 text-sm"
            >
              <option value="">Regime</option>
              <option v-for="regime in regimeOptions" :key="regime" :value="regime">
                {{ regime }}
              </option>
            </select>
          </div>
        </div>

        <!-- Mobile Select All -->
        <div class="flex items-center justify-between mt-3">
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              :checked="allFilteredSelected"
              @change="toggleSelectAll"
              class="rounded bg-gray-700 border-gray-600"
            />
            <span class="text-sm">Select all</span>
          </label>
          <span class="text-sm text-gray-400">{{ filteredSatellites.length }} objects</span>
        </div>
      </div>

      <!-- Mobile Loading/Error States -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-3">Loading...</span>
      </div>
      <div v-if="error" class="p-4">
        <div class="bg-red-900 border border-red-700 rounded-lg p-4 text-center">
          <p class="text-red-300 mb-2">{{ error }}</p>
          <button
            @click="fetchSatellites"
            class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Mobile Satellite Cards -->
      <div v-if="!loading && !error" class="p-4 space-y-3 pb-20">
        <div
          v-for="item in visibleMobileItems"
          :key="item.noradCatId"
          class="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-blue-400 font-medium text-sm">{{ item.noradCatId }}</span>
                <span class="w-2 h-2 rounded-full" :class="getRegimeColor(item.orbitCode)"></span>
              </div>
              <h3 class="font-medium text-white text-sm leading-tight">{{ item.name }}</h3>
            </div>
            <input
              type="checkbox"
              :checked="isSelected(item)"
              @change="toggleSelection(item)"
              class="rounded bg-gray-700 border-gray-600 ml-3 mt-1"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-400">COSPAR:</span>
              <span class="ml-1 text-gray-300">{{ item.intlDes || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-400">Country:</span>
              <span class="ml-1 text-gray-300">{{ item.countryCode || 'N/A' }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-gray-400">Regime:</span>
              <span class="ml-1 px-2 py-0.5 bg-gray-700 rounded text-xs">
                {{ getRegimeDisplay(item.orbitCode) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Mobile Load More -->
        <div v-if="hasMoreMobileItems" class="text-center py-4">
          <button
            @click="loadMoreMobileItems"
            class="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors text-sm"
          >
            Load More
          </button>
        </div>
      </div>

      <!-- Mobile Selected Panel (Slide-up) -->
      <div
        v-if="showMobilePanel"
        class="fixed inset-0 bg-black bg-opacity-50 z-30"
        @click="showMobilePanel = false"
      >
        <div
          class="fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-xl max-h-[70vh] flex flex-col"
          @click.stop
        >
          <div class="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 class="text-lg font-semibold">Selected Assets</h3>
            <button
              @click="showMobilePanel = false"
              class="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div class="flex-1 overflow-auto p-4">
            <div v-if="selectedSatellites.length === 0" class="text-center text-gray-500 py-8">
              No assets selected
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="satellite in selectedSatellites"
                :key="satellite.noradCatId"
                class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-blue-400">{{ satellite.noradCatId }}</div>
                  <div class="text-xs text-gray-400 truncate">{{ satellite.name }}</div>
                </div>
                <button
                  @click="removeSatellite(satellite)"
                  class="text-gray-400 hover:text-red-400 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-gray-700">
            <button
              @click="proceed"
              :disabled="selectedSatellites.length === 0"
              class="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors font-medium"
            >
              PROCEED ({{ selectedSatellites.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Floating Action Button -->
      <div v-if="selectedSatellites.length > 0" class="fixed bottom-4 right-4 z-20">
        <button
          @click="proceed"
          class="bg-cyan-500 hover:bg-cyan-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors"
        >
          <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Desktop Layout (unchanged) -->
    <div class="hidden lg:flex h-screen">
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <div class="bg-gray-800 p-6 border-b border-gray-700">
          <h1 class="text-2xl font-bold mb-4">Create My Asset list</h1>
          
          <!-- Filter Pills -->
          <div class="flex flex-wrap gap-2 mb-4">
            <button
              v-for="type in objectTypeOptions"
              :key="type.key"
              @click="toggleObjectType(type.key)"
              :class="[
                'flex items-center px-4 py-2 rounded-full text-sm font-medium transition',
                selectedObjectTypes.includes(type.key)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]"
            >
              <span class="mr-2">{{ type.label }}</span>
              <span class="bg-black bg-opacity-30 px-2 py-0.5 rounded-full text-xs">
                {{ type.count }}
              </span>
            </button>
          </div>

          <!-- Search and Filters Row -->
          <div class="flex gap-4 items-center">
            <div class="flex-1 relative">
              <input
                v-model="searchInput"
                @keyup.enter="handleSearch"
                type="text"
                placeholder="Search by Name/ NORAD ID"
                class="w-full px-4 py-2 pl-10 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            <select
              v-model="selectedConstellation"
              class="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Constellation</option>
              <option v-for="constellation in constellationOptions" :key="constellation" :value="constellation">
                {{ constellation }}
              </option>
            </select>
            
            <select
              v-model="selectedCountry"
              class="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Country</option>
              <option v-for="country in countryOptions" :key="country" :value="country">
                {{ country }}
              </option>
            </select>

            <select
              v-model="selectedPurpose"
              class="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Purpose</option>
              <option v-for="purpose in purposeOptions" :key="purpose" :value="purpose">
                {{ purpose }}
              </option>
            </select>

            <select
              v-model="selectedRegime"
              class="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Regime</option>
              <option v-for="regime in regimeOptions" :key="regime" :value="regime">
                {{ regime }}
              </option>
            </select>
              <button 
                @click="openFilterModal"
                class="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
              </button>
            </div>
            <FilterModal 
              :is-open="showFilterModal" 
              @close="closeFilterModal"
              @apply="applyAdvancedFilters"
            />

          <!-- Select All and Object Count -->
          <div class="flex items-center justify-between mt-4">
            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                :checked="allFilteredSelected"
                @change="toggleSelectAll"
                class="rounded bg-gray-700 border-gray-600"
              />
              <span class="text-sm">Select all</span>
            </label>
            <span class="text-sm text-gray-400">{{ filteredSatellites.length }} objects</span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex-1 flex justify-center items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span class="ml-3 text-lg">Loading satellites...</span>
        </div>

        <!-- Error State -->
        <div v-if="error" class="flex-1 flex justify-center items-center">
          <div class="bg-red-900 border border-red-700 rounded-lg p-4">
            <p class="text-red-300">{{ error }}</p>
            <button
              @click="fetchSatellites"
              class="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>

        <!-- Satellite Table -->
        <div v-if="!loading && !error" class="flex-1 overflow-hidden">
          <!-- Table Header -->
          <div class="bg-gray-800 px-6 py-3 border-b border-gray-700">
            <div class="grid grid-cols-12 gap-4 font-semibold text-sm text-gray-300">
              <div class="col-span-1"></div>
              <div class="col-span-1 cursor-pointer hover:text-blue-400" @click="sortBy('noradCatId')">
                NORAD ID {{ getSortIcon('noradCatId') }}
              </div>
              <div class="col-span-3 cursor-pointer hover:text-blue-400" @click="sortBy('name')">
                Name {{ getSortIcon('name') }}
              </div>
              <div class="col-span-2">COSPAR ID</div>
              <div class="col-span-2">Regime</div>
              <div class="col-span-2">Country</div>
            </div>
          </div>

          <!-- Virtualized List -->
          <div class="flex-1 overflow-auto h-[65vh]" ref="scrollContainer" @scroll="handleScroll">
            <div :style="{ height: totalHeight + 'px', position: 'relative' }">
              <div
                v-for="(item, index) in visibleItems"
                :key="item.noradCatId"
                :style="{
                  position: 'absolute',
                  top: (startIndex + index) * itemHeight + 'px',
                  width: '100%',
                  height: itemHeight + 'px',
                }"
                class="px-6 py-3 border-b border-gray-700 hover:bg-gray-800 transition-colors"
              >
                <div class="grid grid-cols-12 gap-4 items-center text-sm">
                  <div class="col-span-1">
                    <input
                      type="checkbox"
                      :checked="selectedSatellites.some((s) => s.noradCatId === item.noradCatId)"
                      @change="toggleSelection(item)"
                      :disabled="selectedSatellites.length >= 10 && !isSelected(item)"
                      class="rounded bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div class="col-span-1 text-blue-400 font-medium ml-4">
                    {{ item.noradCatId }}
                  </div>
                  <div class="col-span-3 font-medium truncate" :title="item.name">
                    {{ item.name }}
                  </div>
                  <div class="col-span-2 text-gray-400">
                    {{ item.intlDes || 'N/A' }}
                  </div>
                  <div class="col-span-2">
                    <div class="flex items-center">
                      <span class="px-2 py-1 bg-gray-700 rounded text-xs mr-2">
                        {{ getRegimeDisplay(item.orbitCode) }}
                      </span>
                      <span class="w-2 h-2 rounded-full" :class="getRegimeColor(item.orbitCode)"></span>
                    </div>
                  </div>
                  <div class="col-span-2 text-gray-400 ml-5">
                    {{ item.countryCode || 'N/A' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Assets Panel -->
      <div class="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div class="p-4 border-b border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Selected Assets</h2>
            <button
              @click="clearSelection"
              class="text-gray-400 hover:text-white text-sm"
            >
              Clear all ✕
            </button>
          </div>
          <p class="text-sm text-blue-400 mt-1">{{ selectedSatellites.length }} objects selected</p>
        </div>

        <div class="flex-1 overflow-auto p-4">
          <div v-if="selectedSatellites.length === 0" class="text-center text-gray-500 mt-8">
            No assets selected
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="satellite in selectedSatellites"
              :key="satellite.noradCatId"
              class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-blue-400">{{ satellite.noradCatId }}</span>
                  <span class="text-xs text-gray-400">{{ satellite.name }}</span>
                </div>
              </div>
              <button
                @click="removeSatellite(satellite)"
                class="text-gray-400 hover:text-red-400 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Proceed Button -->
        <div class="p-4 border-t border-gray-700">
          <button
            @click="proceed"
            :disabled="selectedSatellites.length === 0"
            class="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors font-medium"
          >
            PROCEED
          </button>
          <div v-if="selectionError" class="text-red-400 text-sm mt-2 text-center">
            {{ selectionError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
// Import the API utilities instead of direct axios
import { satelliteApi, storage, formatters, debounce } from "../utils/api.ts";

import FilterModal from '../components/FilterModal.vue'
import type { Satellite } from "../types/satellite.ts";

// Router
const router = useRouter();

// Reactive state
const satellites = ref<Satellite[]>([]);
const filteredSatellites = ref<Satellite[]>([]);
const selectedSatellites = ref<Satellite[]>([]);
const loading = ref(false);
const error = ref("");
const selectionError = ref("");

// Search and filters
const searchInput = ref("");
const currentSearch = ref("");
const selectedObjectTypes = ref<string[]>(['all']);
const selectedConstellation = ref("");
const selectedCountry = ref("");
const selectedPurpose = ref("");
const selectedRegime = ref("");

// Sorting
const sortField = ref<keyof Satellite>("name");
const sortDirection = ref<"asc" | "desc">("asc");

// Virtualization
const scrollContainer = ref<HTMLElement>();
const itemHeight = 60;
const visibleCount = ref(10);
const scrollTop = ref(0);

// API counts
const apiCounts = ref<Record<string, number>>({});

// Add these lines to your reactive state section (around line 20-30)
const showMobilePanel = ref(false);
const showMobileFilters = ref(false);

// Also add these mobile-specific variables for the load more functionality
const visibleMobileItems = ref([] as Satellite[]);
const hasMoreMobileItems = ref(true);
const mobileItemsPerPage = 20;
const currentMobilePage = ref(1);

// Add this method to handle loading more mobile items
const loadMoreMobileItems = () => {
  const startIndex = (currentMobilePage.value - 1) * mobileItemsPerPage;
  const endIndex = startIndex + mobileItemsPerPage;
  const newItems = filteredSatellites.value.slice(startIndex, endIndex);
  
  visibleMobileItems.value = [...visibleMobileItems.value, ...newItems];
  currentMobilePage.value++;
  
  hasMoreMobileItems.value = endIndex < filteredSatellites.value.length;
};

// Update the applyFiltersAndSearch method to reset mobile items
// Add this at the end of your existing applyFiltersAndSearch method:
const resetMobileItems = () => {
  currentMobilePage.value = 1;
  visibleMobileItems.value = filteredSatellites.value.slice(0, mobileItemsPerPage);
  hasMoreMobileItems.value = filteredSatellites.value.length > mobileItemsPerPage;
};

// Call resetMobileItems() at the end of applyFiltersAndSearch method
// Filter options
const objectTypeOptions = computed(() => [
  { key: 'all', label: 'All Objects', count: satellites.value.length },
  { key: 'PAYLOAD', label: 'Payloads', count: apiCounts.value['PAYLOAD'] || 0 },
  { key: 'DEBRIS', label: 'Debris', count: apiCounts.value['DEBRIS'] || 0 },
  { key: 'ROCKET BODY', label: 'Rocket Bodies', count: apiCounts.value['ROCKET BODY'] || 0 },
  { key: 'UNKNOWN', label: 'Unknown', count: apiCounts.value['UNKNOWN'] || 0 }
]);

// 1. Import the FilterModal component at the top of your script section:

// 2. Add these reactive variables to your existing state:
const showFilterModal = ref(false)
const advancedFilters = ref({
  launchDateFrom: '',
  launchDateTo: '',
  minAltitude: null,
  maxAltitude: null,
  minInclination: null,
  maxInclination: null,
  launchSite: '',
  operationalStatus: [],
  minPeriod: null,
  maxPeriod: null,
  rcsSize: []
})

// 3. Add these methods:
const openFilterModal = () => {
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

const applyAdvancedFilters = (filters:any) => {
  advancedFilters.value = { ...filters }
  selectedCountry.value = filters.countryCode || '';
  selectedRegime.value = filters.orbitCode || '';

  selectedObjectTypes.value = filters.objectTypes

  applyFiltersAndSearch()
}


const constellationOptions = ref(['Starlink', 'OneWeb', 'Iridium', 'GPS']);
const countryOptions = ref([
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
]);
const purposeOptions = ref(['Communications', 'Earth Observation', 'Navigation', 'Scientific']);
const regimeOptions = ref(['LEO', 'MEO', 'GEO', 'HEO']);

// Computed properties
const totalHeight = computed(() => filteredSatellites.value.length * itemHeight);
const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight));
const endIndex = computed(() =>
  Math.min(startIndex.value + visibleCount.value, filteredSatellites.value.length)
);
const visibleItems = computed(() =>
  filteredSatellites.value.slice(startIndex.value, endIndex.value)
);

const allFilteredSelected = computed(() => {
  const visibleIds = visibleItems.value.map((item) => item.noradCatId);
  return (
    visibleIds.length > 0 &&
    visibleIds.every((id) =>
      selectedSatellites.value.some((selected) => selected.noradCatId === id)
    )
  );
});

// Methods
const fetchSatellites = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await satelliteApi.getSatellites({
      objectTypes: selectedObjectTypes.value.length > 0 && selectedObjectTypes.value[0] != 'all' ? selectedObjectTypes.value : undefined,
    });

    satellites.value = response.data || [];
    await updateCounts();
    applyFiltersAndSearch();
  } catch (err: any) {
    error.value = err.message || "Failed to fetch satellites";
    satellites.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleObjectType = (type: string) => {
  if (type === 'all') {
    selectedObjectTypes.value = [];
  } else {
    // remove 'all' if present
    if (selectedObjectTypes.value.includes('all')) {
      selectedObjectTypes.value = [];
    }
    const index = selectedObjectTypes.value.indexOf(type);
    if (index > -1) {
      selectedObjectTypes.value.splice(index, 1);
    } else {
      selectedObjectTypes.value.push(type);
    }
  }
  applyFilters();
};

const updateCounts = async () => {
  try {
    const counts = await satelliteApi.getSatelliteCounts();
    apiCounts.value = counts;
  } catch (err) {
    console.error("Failed to get satellite counts:", err);
    const fallbackCounts: Record<string, number> = {
      "ROCKET BODY": 0,
      DEBRIS: 0,
      UNKNOWN: 0,
      PAYLOAD: 0,
    };

    satellites.value.forEach((satellite) => {
      if (fallbackCounts.hasOwnProperty(satellite.objectType)) {
        fallbackCounts[satellite.objectType]++;
      }
    });

    apiCounts.value = fallbackCounts;
  }
};

const applyFiltersAndSearch = () => {
  let filtered = [...satellites.value];
  // Apply search
  if (currentSearch.value) {
    const searchLower = currentSearch.value.toLowerCase();
    filtered = filtered.filter(
      (sat) =>
        sat.name.toLowerCase().includes(searchLower) ||
        sat.noradCatId.toLowerCase().includes(searchLower)
    );
  }

  // Apply filters
  if (selectedCountry.value) {
    filtered = filtered.filter((sat) => sat.countryCode === selectedCountry.value);
  }

  if (selectedRegime.value) {
    filtered = filtered.filter((sat) => sat.orbitCode?.includes(selectedRegime.value));
  }
  if (!selectedObjectTypes.value.includes('all')) {
    filtered = filtered.filter((sat) => {
      return selectedObjectTypes.value.some(type => type === sat.objectType);
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const aVal = a[sortField.value] || "";
    const bVal = b[sortField.value] || "";

    if (sortField.value === "launchDate") {
      const aDate = new Date(aVal as string).getTime() || 0;
      const bDate = new Date(bVal as string).getTime() || 0;
      return sortDirection.value === "asc" ? aDate - bDate : bDate - aDate;
    }

    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection.value === "asc" ? comparison : -comparison;
  });

  filteredSatellites.value = filtered;
  resetMobileItems();
  scrollTop.value = 0;
};

const debouncedSearch = debounce(() => {
  currentSearch.value = searchInput.value;
  applyFiltersAndSearch();
}, 300);

const handleSearch = () => {
  currentSearch.value = searchInput.value;
  applyFiltersAndSearch();
};

const applyFilters = () => {
  applyFiltersAndSearch();
};

const sortBy = (field: keyof Satellite) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
  applyFiltersAndSearch();
};

const getSortIcon = (field: keyof Satellite) => {
  if (sortField.value !== field) return "";
  return sortDirection.value === "asc" ? "↑" : "↓";
};

const toggleSelection = (item: Satellite) => {
  const index = selectedSatellites.value.findIndex(
    (s) => s.noradCatId === item.noradCatId
  );
  if (index >= 0) {
    selectedSatellites.value.splice(index, 1);
    selectionError.value = "";
  } else {
    selectedSatellites.value.push(item);
    selectionError.value = "";
  }
  if (selectedSatellites.value.length > 9) {
    selectionError.value = "Maximum 10 satellites can be selected";
    setTimeout(() => (selectionError.value = ""), 3000);
    return;
  }
  storage.set("selectedSatellites", selectedSatellites.value);
};

const toggleSelectAll = () => {
  const visibleIds = filteredSatellites.value.map((item) => item.noradCatId);
  const allSelected = visibleIds.every((id) =>
    selectedSatellites.value.some((selected) => selected.noradCatId === id)
  );

  if (allSelected) {
    selectedSatellites.value = selectedSatellites.value.filter(
      (selected) => !visibleIds.includes(selected.noradCatId)
    );
  } else {
    filteredSatellites.value.forEach((item) => {
      if (selectedSatellites.value.length < 10 && !isSelected(item)) {
        selectedSatellites.value.push(item);
      }
    });
  }

  storage.set("selectedSatellites", selectedSatellites.value);
};

const isSelected = (item: Satellite) => {
  return selectedSatellites.value.some((s) => s.noradCatId === item.noradCatId);
};

const clearSelection = () => {
  selectedSatellites.value = [];
  selectionError.value = "";
  storage.remove("selectedSatellites");
};

const removeSatellite = (satellite: Satellite) => {
  const index = selectedSatellites.value.findIndex(
    (s) => s.noradCatId === satellite.noradCatId
  );
  if (index >= 0) {
    selectedSatellites.value.splice(index, 1);
    storage.set("selectedSatellites", selectedSatellites.value);
  }
};

const proceed = () => {
  if (selectedSatellites.value.length === 0) return;
  storage.set("selectedSatellites", selectedSatellites.value);
  router.push("/selected");
};

const getRegimeDisplay = (orbitCode: string) => {
  return orbitCode || 'N/A';
};

const getRegimeColor = (orbitCode: string) => {
  const colors = {
    'LEO': 'bg-blue-500',
    'MEO': 'bg-green-500',
    'GEO': 'bg-yellow-500',
    'HEO': 'bg-purple-500'
  };
  const matchedRegime = Object.keys(colors).find(regime => orbitCode.includes(regime));

  return colors[matchedRegime as keyof typeof colors] || 'bg-gray-500';
};


const handleScroll = () => {
  if (scrollContainer.value) {
    scrollTop.value = scrollContainer.value.scrollTop;
  }
};

watch(searchInput, () => {
  debouncedSearch();
});

watch([selectedConstellation, selectedCountry, selectedPurpose, selectedRegime], () => {
  applyFiltersAndSearch();
});

onMounted(() => {
  fetchSatellites();  
  const saved = storage.get<Satellite[]>("selectedSatellites");
  if (saved) {
    selectedSatellites.value = saved;
  }

  if (scrollContainer.value) {
    const containerHeight = scrollContainer.value.clientHeight;
    visibleCount.value = Math.ceil(containerHeight / itemHeight) + 15;
    scrollContainer.value.addEventListener("scroll", handleScroll);
  }
});
</script>