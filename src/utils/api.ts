import axios from 'axios'
import type { AxiosInstance,AxiosResponse } from 'axios'
import type { ApiResponse, ApiError } from '../types/satellite'

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://backend.digantara.dev/v1',
  timeout: 60000 *5 , // 60 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`, config.params)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API response from ${response.config.url}:`, response.status)
    return response
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message)
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      const apiError: ApiError = error.response.data
      throw new Error(apiError.message || 'Bad request')
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.')
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.')
    }
    
    throw new Error(error.message || 'An unexpected error occurred')
  }
)

// API methods
export const satelliteApi = {
  /**
   * Fetch satellites with optional filters
   */
  async getSatellites(params?: {
    objectTypes?: string[]
    attributes?: string[]
    search?: string
  }): Promise<ApiResponse> {
    const queryParams: Record<string, string> = {}
    
    if (params?.objectTypes?.length) {
      queryParams.objectTypes = params.objectTypes.join(',')
    }
    
    if (params?.attributes?.length) {
      queryParams.attributes = params.attributes.join(',')
    } else {
      // Default attributes
      queryParams.attributes = 'noradCatId,intlDes,name,launchDate,objectType,countryCode,orbitCode'
    }
    
    const response = await apiClient.get<ApiResponse>('/satellites', {
      params: queryParams
    })
    
    return response.data
  },

  /**
   * Get satellite counts by manually counting object types from the data
   */
  async getSatelliteCounts(): Promise<Record<string, number>> {
    try {
      const response = await apiClient.get<ApiResponse>('/satellites', {
        params: {
          attributes: 'objectType'
        }
      })
      
      // Manually count object types from the data array
      const counts: Record<string, number> = {
        'ROCKET BODY': 0,
        'DEBRIS': 0,
        'UNKNOWN': 0,
        'PAYLOAD': 0,
      }
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((satellite: any) => {
          const objectType = satellite.objectType
          if (counts.hasOwnProperty(objectType)) {
            counts[objectType]++
          }
        })
      }
      
      return counts
    } catch (error) {
      console.error('Failed to fetch satellite counts:', error)
      return {
        'ROCKET BODY': 0,
        'DEBRIS': 0,
        'UNKNOWN': 0,
        'PAYLOAD': 0,
      }
    }
  }
}

// Fixed fetchSatellites function for your Vue component
export const fetchSatellites = async (
  selectedObjectTypes: string[],
  loading: { value: boolean },
  error: { value: string },
  satellites: { value: any[] },
  apiCounts: { value: Record<string, number> },
  applyFiltersAndSearch: () => void
) => {
  loading.value = true
  error.value = ''
  
  try {
    const params: Record<string, string> = {
      attributes: 'noradCatId,intlDes,name,launchDate,objectType,countryCode,orbitCode'
    }
    
    // Only add objectTypes if we have selections
    if (selectedObjectTypes.length > 0) {
      params.objectTypes = selectedObjectTypes.join(',')
    }
    
    const response = await axios.get('https://backend.digantara.dev/v1/satellites', {
      params
    })
    
    satellites.value = response.data.data || []
    
    // Manually count object types since API doesn't provide counts
    const counts: Record<string, number> = {
      'ROCKET BODY': 0,
      'DEBRIS': 0,
      'UNKNOWN': 0,
      'PAYLOAD': 0,
    }
    satellites.value.forEach((satellite: any) => {
      const objectType = satellite.objectType
      if (counts.hasOwnProperty(objectType)) {
        counts[objectType]++
      }
    })
    
    apiCounts.value = counts
    applyFiltersAndSearch()
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch satellites'
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

// Debounce utility function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle utility function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Local storage utilities with error handling
export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error)
      return null
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Failed to set item in localStorage: ${key}`, error)
      return false
    }
  },

  remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error)
      return false
    }
  },

  clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear localStorage', error)
      return false
    }
  }
}

// Format utilities
export const formatters = {
  date(dateString: string | null): string {
    if (!dateString) return 'N/A'
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Failed to format date:', dateString, error)
      return 'Invalid Date'
    }
  },

  number(num: number | string): string {
    const parsed = typeof num === 'string' ? parseInt(num) : num
    return parsed.toLocaleString()
  }
}

export default apiClient