"use client"

import { useState, useEffect, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { City } from "../../../types/city"

interface CityFiltersProps {
  cityData: City[]
  selectedCity: City | null
  onFilterChange: (filters: {
    country: string
    city: string
    height: string
    wind: string
    density: string
  }) => void
  onCitySelect: (city: City | null) => void
  cityCounts: Record<string, number>
}

export default function CityFilters({
  cityData,
  selectedCity,
  onFilterChange,
  onCitySelect,
  cityCounts,
}: CityFiltersProps) {
  // Filter states
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [heightFilter, setHeightFilter] = useState<string>("all")
  const [windFilter, setWindFilter] = useState<string>("all")
  const [densityFilter, setDensityFilter] = useState<string>("all")

  // Update filters when selected city changes
  useEffect(() => {
    if (selectedCity) {
      setCountryFilter(selectedCity.country)
      setCityFilter(selectedCity.name)
      setHeightFilter(selectedCity.stdDevBuildingHeightRange)
      setWindFilter(selectedCity.windDirection ? selectedCity.windDirection.toString() : "all")
      setDensityFilter(selectedCity.planAreaDensity)
    }
  }, [selectedCity])

  // Notify parent component when filters change
  useEffect(() => {
    onFilterChange({
      country: countryFilter,
      city: cityFilter,
      height: heightFilter,
      wind: windFilter,
      density: densityFilter,
    })
  }, [countryFilter, cityFilter, heightFilter, windFilter, densityFilter, onFilterChange])

  // Reset all filters
  const resetFilters = () => {
    setCountryFilter("all")
    setCityFilter("all")
    setHeightFilter("all")
    setWindFilter("all")
    setDensityFilter("all")
    onCitySelect(null)
  }

  // Get filtered data based on current selections
  const getFilteredData = () => {
    let filtered = [...cityData]

    // Apply country filter
    if (countryFilter !== "all") {
      filtered = filtered.filter((city) => city.country === countryFilter)
    }

    // Apply city filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((city) => city.name === cityFilter)
    }

    // Apply height filter
    if (heightFilter !== "all") {
      filtered = filtered.filter((city) => city.stdDevBuildingHeightRange === heightFilter)
    }

    // Apply wind filter
    if (windFilter !== "all") {
      filtered = filtered.filter((city) => city.windDirection !== null && city.windDirection.toString() === windFilter)
    }

    // Apply density filter
    if (densityFilter !== "all") {
      filtered = filtered.filter((city) => city.planAreaDensity === densityFilter)
    }

    return filtered
  }

  // Get available options for each filter based on current selections
  const filteredData = getFilteredData()

  // Get unique countries
  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(cityData.map((city) => city.country))).sort()
  }, [cityData])

  // Get unique cities based on current country filter
  const uniqueCities = useMemo(() => {
    const cities = countryFilter === "all" ? cityData : cityData.filter((city) => city.country === countryFilter)

    return Array.from(new Set(cities.map((city) => city.name))).sort()
  }, [cityData, countryFilter])

  // Get all height ranges for the filtered data
  const availableHeights = useMemo(() => {
    let cities = cityData

    if (countryFilter !== "all") {
      cities = cities.filter((city) => city.country === countryFilter)
    }

    if (cityFilter !== "all") {
      cities = cities.filter((city) => city.name === cityFilter)
    }

    return Array.from(new Set(cities.map((city) => city.stdDevBuildingHeightRange))).sort()
  }, [cityData, countryFilter, cityFilter])

  // Get all wind directions for the filtered data
  const availableWinds = useMemo(() => {
    let cities = cityData

    if (countryFilter !== "all") {
      cities = cities.filter((city) => city.country === countryFilter)
    }

    if (cityFilter !== "all") {
      cities = cities.filter((city) => city.name === cityFilter)
    }

    return Array.from(new Set(cities.filter((city) => city.windDirection !== null).map((city) => city.windDirection!.toString()))).sort(
      (a, b) => Number(a) - Number(b),
    )
  }, [cityData, countryFilter, cityFilter])

  // Get all densities for the filtered data
  const availableDensities = useMemo(() => {
    let cities = cityData

    if (countryFilter !== "all") {
      cities = cities.filter((city) => city.country === countryFilter)
    }

    if (cityFilter !== "all") {
      cities = cities.filter((city) => city.name === cityFilter)
    }

    return Array.from(new Set(cities.map((city) => city.planAreaDensity))).sort()
  }, [cityData, countryFilter, cityFilter])

  // Handle filter changes
  const handleCountryChange = (value: string) => {
    setCountryFilter(value)
    setCityFilter("all")
    setHeightFilter("all")
    setWindFilter("all")
    setDensityFilter("all")

    // If only one city in this country, select it
    if (value !== "all") {
      const citiesInCountry = cityData.filter((city) => city.country === value)
      if (citiesInCountry.length === 1) {
        onCitySelect(citiesInCountry[0])
      } else {
        onCitySelect(null)
      }
    } else {
      onCitySelect(null)
    }
  }

  const handleCityChange = (value: string) => {
    setCityFilter(value)

    if (value !== "all") {
      const selectedCityData = cityData.find((city) => city.name === value)
      if (selectedCityData) {
        setCountryFilter(selectedCityData.country)
        setHeightFilter("all") // Reset height filter when city changes
        setWindFilter("all") // Reset wind filter when city changes
        setDensityFilter("all") // Reset density filter when city changes
        onCitySelect(selectedCityData)
      }
    } else {
      setHeightFilter("all")
      setWindFilter("all")
      setDensityFilter("all")
      onCitySelect(null)
    }
  }

  const handleHeightChange = (value: string) => {
    setHeightFilter(value)

    // If this narrows down to a single city, select it
    const filtered = getFilteredData().filter((city) => city.stdDevBuildingHeightRange === value)
    if (filtered.length === 1 && value !== "all") {
      setCityFilter(filtered[0].name)
      setCountryFilter(filtered[0].country)
      setWindFilter(filtered[0].windDirection ? filtered[0].windDirection.toString() : "all")
      setDensityFilter(filtered[0].planAreaDensity)
      onCitySelect(filtered[0])
    } else if (value === "all") {
      onCitySelect(null)
    }
  }

  const handleWindChange = (value: string) => {
    setWindFilter(value)

    // If this narrows down to a single city, select it
    const filtered = getFilteredData().filter((city) => city.windDirection !== null && city.windDirection.toString() === value)
    if (filtered.length === 1 && value !== "all") {
      setCityFilter(filtered[0].name)
      setCountryFilter(filtered[0].country)
      setHeightFilter(filtered[0].stdDevBuildingHeightRange)
      setDensityFilter(filtered[0].planAreaDensity)
      onCitySelect(filtered[0])
    } else if (value === "all") {
      onCitySelect(null)
    }
  }

  const handleDensityChange = (value: string) => {
    setDensityFilter(value)

    // If this narrows down to a single city, select it
    const filtered = getFilteredData().filter((city) => city.planAreaDensity === value)
    if (filtered.length === 1 && value !== "all") {
      setCityFilter(filtered[0].name)
      setCountryFilter(filtered[0].country)
      setHeightFilter(filtered[0].stdDevBuildingHeightRange)
      setWindFilter(filtered[0].windDirection ? filtered[0].windDirection.toString() : "all")
      onCitySelect(filtered[0])
    } else if (value === "all") {
      onCitySelect(null)
    }
  }

  return (
    <div className="p-2 bg-muted rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium">Filter Cities</h2>
        <Button variant="outline" size="sm" onClick={resetFilters} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div>
          <Label htmlFor="country-filter" className="text-xs">
            Country
          </Label>
          <Select value={countryFilter} onValueChange={handleCountryChange}>
            <SelectTrigger id="country-filter" className="h-8">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {uniqueCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="city-filter" className="text-xs">
            City
          </Label>
          <Select value={cityFilter} onValueChange={handleCityChange}>
            <SelectTrigger id="city-filter" className="h-8">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {uniqueCities.map((cityName) => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="height-filter" className="text-xs">
            Building Height Std Dev
          </Label>
          <Select value={heightFilter} onValueChange={handleHeightChange}>
            <SelectTrigger id="height-filter" className="h-8">
              <SelectValue placeholder="All Ranges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {availableHeights.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="wind-filter" className="text-xs">
            Wind Direction
          </Label>
          <Select value={windFilter} onValueChange={handleWindChange}>
            <SelectTrigger id="wind-filter" className="h-8">
              <SelectValue placeholder="All Directions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Directions</SelectItem>
              {availableWinds.map((direction) => (
                <SelectItem key={direction} value={direction}>
                  {direction}°
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="density-filter" className="text-xs">
            Plan Area Density
          </Label>
          <Select value={densityFilter} onValueChange={handleDensityChange}>
            <SelectTrigger id="density-filter" className="h-8">
              <SelectValue placeholder="All Densities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {availableDensities.map((density) => (
                <SelectItem key={density} value={density}>
                  {density}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
