export interface City {
  id: number
  name: string
  country: string
  coordinates: [number, number]
  stdDevBuildingHeight: number
  stdDevBuildingHeightRange: string
  windDirection: number | null
  planAreaDensity: string
  image?: string // Made optional with ?
  folderName: string
}
