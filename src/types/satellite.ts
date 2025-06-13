export interface Satellite {
  noradCatId: string
  intlDes: string
  name: string
  launchDate: string | null
  decayDate: string | null
  objectType: 'ROCKET BODY' | 'DEBRIS' | 'UNKNOWN' | 'PAYLOAD'
  launchSiteCode: string
  countryCode: string
  orbitCode: string
}

export interface ApiResponse {
  data: Satellite[]
  counts: {
    total: string
    PAYLOAD: string
    'ROCKET BODY': string
    UNKNOWN: string
    DEBRIS: string
  }
}

export interface ApiError {
  statusCode: number
  message: string
}

export type ObjectType = 'ROCKET BODY' | 'DEBRIS' | 'UNKNOWN' | 'PAYLOAD'

export type OrbitCode = 
  | 'LEO' | 'LEO1' | 'LEO2' | 'LEO3' | 'LEO4'
  | 'MEO' | 'GEO' | 'HEO' | 'IGO' | 'EGO'
  | 'NSO' | 'GTO' | 'GHO' | 'HAO' | 'MGO'
  | 'LMO' | 'UFO' | 'ESO' | 'UNKNOWN'

export type SortField = keyof Satellite
export type SortDirection = 'asc' | 'desc'

export interface FilterState {
  objectTypes: ObjectType[]
  orbitCodes: OrbitCode[]
  search: string
}

export interface SortState {
  field: SortField
  direction: SortDirection
}