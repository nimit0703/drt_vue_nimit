<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-2">🛰️ Selected Satellites</h1>
        <p class="text-gray-400">Your curated list of space objects</p>
      </div>

      <!-- Back Navigation -->
      <div class="mb-6">
        <router-link 
          to="/" 
          class="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span>Back to Dashboard</span>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="selectedItems.length === 0" class="bg-gray-800 rounded-lg p-12 text-center">
        <div class="text-6xl mb-4">🚀</div>
        <h2 class="text-xl font-semibold mb-2">No satellites selected</h2>
        <p class="text-gray-400 mb-6">Go back to the dashboard and select some satellites to see them here.</p>
        <router-link 
          to="/" 
          class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors inline-block"
        >
          Go to Dashboard
        </router-link>
      </div>

      <!-- Selected Items -->
      <div v-else>
        <!-- Summary -->
        <div class="bg-gray-800 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <span class="text-lg font-semibold">
                Total Selected: {{ selectedItems.length }}
              </span>
              <div class="flex space-x-2">
                <span 
                  v-for="type in getObjectTypeCounts()" 
                  :key="type.name"
                  :class="getObjectTypeColor(type.name)"
                  class="px-2 py-1 rounded text-xs"
                >
                  {{ type.name }}: {{ type.count }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="exportToCSV"
                class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Export CSV
              </button>
              <button
                @click="clearSelection"
                class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        <!-- Satellites Grid -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(item, index) in selectedItems"
            :key="item.noradCatId"
            class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors relative group"
          >
            <!-- Remove Button -->
            <button
              @click="removeItem(index)"
              class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove from selection"
            >
              ×
            </button>

            <!-- Satellite Info -->
            <div class="pr-8">
              <h3 class="font-bold text-lg mb-2 text-blue-400">{{ item.name }}</h3>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-400">NORAD ID:</span>
                  <span class="font-mono">{{ item.noradCatId }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-400">Type:</span>
                  <span :class="getObjectTypeColor(item.objectType)" class="px-2 py-1 rounded text-xs">
                    {{ item.objectType }}
                  </span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-400">Orbit:</span>
                  <span class="bg-gray-600 px-2 py-1 rounded text-xs">
                    {{ item.orbitCode || 'N/A' }}
                  </span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-400">Country:</span>
                  <span>{{ item.countryCode || 'N/A' }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-400">Launch Date:</span>
                  <span>{{ formatDate(item.launchDate) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-400">Int'l Designator:</span>
                  <span class="font-mono text-xs">{{ item.intlDes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Table View Toggle -->
        <div class="mt-8">
          <button
            @click="showDetailedView = !showDetailedView"
            class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors mb-4"
          >
            {{ showDetailedView ? 'Hide' : 'Show' }} Detailed Table View
          </button>

          <!-- Detailed Table -->
          <div v-if="showDetailedView" class="bg-gray-800 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-700">
                  <tr>
                    <th class="px-4 py-3 text-left">#</th>
                    <th class="px-4 py-3 text-left">Name</th>
                    <th class="px-4 py-3 text-left">NORAD ID</th>
                    <th class="px-4 py-3 text-left">Type</th>
                    <th class="px-4 py-3 text-left">Orbit</th>
                    <th class="px-4 py-3 text-left">Country</th>
                    <th class="px-4 py-3 text-left">Launch Date</th>
                    <th class="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(item, index) in selectedItems" 
                    :key="item.noradCatId"
                    class="border-t border-gray-700 hover:bg-gray-700"
                  >
                    <td class="px-4 py-3">{{ index + 1 }}</td>
                    <td class="px-4 py-3 font-medium">{{ item.name }}</td>
                    <td class="px-4 py-3 font-mono text-blue-400">{{ item.noradCatId }}</td>
                    <td class="px-4 py-3">
                      <span :class="getObjectTypeColor(item.objectType)" class="px-2 py-1 rounded text-xs">
                        {{ item.objectType }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="bg-gray-600 px-2 py-1 rounded text-xs">
                        {{ item.orbitCode || 'N/A' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">{{ item.countryCode || 'N/A' }}</td>
                    <td class="px-4 py-3">{{ formatDate(item.launchDate) }}</td>
                    <td class="px-4 py-3">
                      <button
                        @click="removeItem(index)"
                        class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Satellite } from '../types/satellite'

const router = useRouter()
const selectedItems = ref<Satellite[]>([])
const showDetailedView = ref(false)

const getObjectTypeCounts = () => {
  const counts = selectedItems.value.reduce((acc, item) => {
    acc[item.objectType] = (acc[item.objectType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(counts).map(([name, count]) => ({ name, count }))
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

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const removeItem = (index: number) => {
  selectedItems.value.splice(index, 1)
  localStorage.setItem('selectedSatellites', JSON.stringify(selectedItems.value))
}

const clearSelection = () => {
  if (confirm('Are you sure you want to remove all selected satellites?')) {
    selectedItems.value = []
    localStorage.removeItem('selectedSatellites')
  }
}

const exportToCSV = () => {
  const headers = ['Name', 'NORAD ID', 'Object Type', 'Orbit Code', 'Country', 'Launch Date', 'International Designator']
  const csvContent = [
    headers.join(','),
    ...selectedItems.value.map(item => [
      `"${item.name}"`,
      item.noradCatId,
      item.objectType,
      item.orbitCode || 'N/A',
      item.countryCode || 'N/A',
      item.launchDate || 'N/A',
      item.intlDes
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `selected-satellites-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

onMounted(() => {
  const data = localStorage.getItem('selectedSatellites')
  if (data) {
    try {
      selectedItems.value = JSON.parse(data)
    } catch (error) {
      console.error('Failed to load selected satellites:', error)
      selectedItems.value = []
    }
  }
})
</script>