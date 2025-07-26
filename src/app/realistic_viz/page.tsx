"use client"

import { useState, useCallback, useMemo } from "react"
import { useToast } from "@/components/ui/use-toast"
import cityDataRaw from "@/app/api/data/RealisticModelmeta.json"
import WorldMap from "@/components/component/worldmap"
import CityFilters from "@/components/component/cityfilters"
import CityInfo from "@/components/component/city-info"
import type { City } from "../../../types/city"
import {Header} from "@/components/component/header"
import {Footer} from "@/components/component/footer";

//defind a placeholder
const placeholderimage='/placeholder.png'

// Cast the imported JSON data to match our City type
const cityData: City[] = cityDataRaw.map((city, index) => {
  // Find PNG file in the Files array if available
  const pngFile = city.Files?.find((file) => file["File Name"]?.endsWith(".png"))
  const pngUrl = pngFile ? pngFile["Direct Download Link"] : null

  // Validate coordinates
  let validCoordinates: [number, number] = [0, 0] // Default fallback
  if (
    city.coordinates &&
    Array.isArray(city.coordinates) &&
    city.coordinates.length === 2 &&
    typeof city.coordinates[0] === "number" &&
    typeof city.coordinates[1] === "number"
  ) {
    validCoordinates = city.coordinates as [number, number]
  }

  return {
    id: index + 1,
    name: city.City,
    country: city.Country,
    coordinates: validCoordinates,
    stdDevBuildingHeight: city["Std of Building Height"],
    stdDevBuildingHeightRange: city["Standard Deviation of Building Height"],
    windDirection: city["Wind Direction"],
    planAreaDensity: city["Plan Area Density"],
    image: pngUrl || placeholderimage, // Use PNG URL if available, otherwise use placeholder
    folderName: city["Folder Name"], // Add folder name for reference
  }
})

// Group cities by name for counting cases
const cityCounts = cityData.reduce(
  (acc, city) => {
    acc[city.name] = (acc[city.name] || 0) + 1
    return acc
  },
  {} as Record<string, number>,
)

export default function WorldMapPage() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [filteredCities, setFilteredCities] = useState<City[]>(cityData)
  const [displayedCities, setDisplayedCities] = useState<City[]>(cityData)
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({})
  const [zoomToLocation, setZoomToLocation] = useState<{ coordinates: [number, number]; zoom: number } | null>(null)
  const { toast } = useToast()

  // Get all cases for the selected city (for showing additional info)
  const selectedCityCases = useMemo(() => {
    if (!selectedCity) return []
    return cityData.filter((city) => city.name === selectedCity.name)
  }, [selectedCity])

  // Handle filter changes from the filter component
  const handleFilterChange = useCallback(
    (filters: {
      country: string
      city: string
      height: string
      wind: string
      density: string
    }) => {
      let result = [...cityData]

      if (filters.country && filters.country !== "all") {
        result = result.filter((city) => city.country === filters.country)
      }

      if (filters.city && filters.city !== "all") {
        result = result.filter((city) => city.name === filters.city)

        // Find the first city that matches the filter and zoom to it
        const cityToZoom = cityData.find((city) => city.name === filters.city)
        if (cityToZoom) {
          setZoomToLocation({ coordinates: cityToZoom.coordinates, zoom: 500 })
        }
      } else {
        // When no specific city is selected, show global view
        setZoomToLocation({ coordinates: [0, 0], zoom: 100 })
      }

      setFilteredCities(result)

      // Always show all cities on the map, but highlight the filtered ones
      setDisplayedCities(cityData)
    },
    [cityData],
  )

  // Handle city selection from the map
  const handleMapCitySelect = useCallback((city: City) => {
    setSelectedCity(city)
    // Zoom to the selected city
    setZoomToLocation({ coordinates: city.coordinates, zoom: 500 })
  }, [])

  // Handle city selection from filters
  const handleCitySelect = useCallback((city: City | null) => {
    setSelectedCity(city)

    // Zoom to the selected city if one is selected
    if (city) {
      setZoomToLocation({ coordinates: city.coordinates, zoom: 500 })
    }
  }, [])

  // Handle download of all files for a case
  const handleDownload = useCallback(
    async (folderName: string) => {
      try {
        setIsDownloading((prev) => ({ ...prev, [folderName]: true }))

        // Find the original data for this folder
        const folderData = cityDataRaw.find((city) => city["Folder Name"] === folderName)

        if (!folderData || !folderData.Files || folderData.Files.length === 0) {
          throw new Error("No files found for this case")
        }

        // Dynamically import JSZip
        const JSZip = (await import("jszip")).default
        const zip = new JSZip()

        // Create a folder in the zip
        const folder = zip.folder(folderName)
        if (!folder) throw new Error("Failed to create folder in zip")

        // Add each file to the zip
        const filePromises = folderData.Files.map(async (file) => {
          try {
            const downloadLink = file["Direct Download Link"]
            const response = await fetch(downloadLink)
            if (!response.ok) throw new Error(`Failed to fetch ${file["File Name"]}`)

            const blob = await response.blob()
            folder.file(file["File Name"], blob)

            return { success: true, fileName: file["File Name"] }
          } catch (error) {
            console.error(`Error downloading ${file["File Name"]}:`, error)
            return { success: false, fileName: file["File Name"] }
          }
        })

        // Wait for all files to be processed
        const results = await Promise.all(filePromises)
        const successCount = results.filter((r) => r.success).length

        // Generate the zip file
        const zipBlob = await zip.generateAsync({ type: "blob" })

        // Create a download link and trigger the download
        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${folderName}.zip`
        document.body.appendChild(a)
        a.click()

        // Clean up
        URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Download Complete",
          description: `Successfully downloaded ${successCount} of ${folderData.Files.length} files for ${folderName}`,
        })
      } catch (error) {
        console.error("Download error:", error)
        toast({
          title: "Download Failed",
          description: error instanceof Error ? error.message : "Failed to download files",
          variant: "destructive",
        })
      } finally {
        setIsDownloading((prev) => ({ ...prev, [folderName]: false }))
      }
    },
    [toast],
  )

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">World Cities Explorer</h1>

        {/* Main container - increased to 70% of screen height */}
        <div className="h-[70vh] flex flex-col lg:flex-row">
          {/* Left Column - Filter and Map (70% width) */}
          <div className="lg:w-[70%] h-full flex flex-col pr-3 relative">
            {/* Filters - Positioned at the top */}
            <div className="z-10">
              <CityFilters
                cityData={cityData}
                selectedCity={selectedCity}
                onFilterChange={handleFilterChange}
                onCitySelect={handleCitySelect}
                cityCounts={cityCounts}
              />
            </div>

            {/* Map Section - Positioned to fill from below filters to bottom */}
            <div className="absolute top-[calc(100%-70vh+150px)] bottom-0 left-0 right-3">
              <WorldMap
                filteredCities={displayedCities}
                selectedCity={selectedCity}
                setSelectedCity={handleMapCitySelect}
                cityCounts={cityCounts}
                zoomToLocation={zoomToLocation}
              />
            </div>
          </div>

          {/* Right Column - City Details (30% width) */}
          <div className="lg:w-[30%] h-full pl-3">
            <CityInfo
              selectedCity={selectedCity}
              cityCounts={cityCounts}
              selectedCityCases={selectedCityCases}
              isDownloading={isDownloading}
              handleDownload={handleDownload}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
