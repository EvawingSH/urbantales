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
  // Height, wind, and density filters removed

  // Update filters when selected city changes
  useEffect(() => {
    if (selectedCity) {
      setCountryFilter(selectedCity.country)
      setCityFilter(selectedCity.name)
    } else {
      // When no city is selected, show all
      setCountryFilter("all")
      setCityFilter("all")
    }
  }, [selectedCity])

  // Notify parent component when filters change
  useEffect(() => {
    onFilterChange({
      country: countryFilter,
      city: cityFilter,
      height: "all",
      wind: "all",
      density: "all",
    })
  }, [countryFilter, cityFilter, onFilterChange])

  // Reset all filters
  const resetFilters = () => {
    setCountryFilter("all")
    setCityFilter("all")
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

    return filtered
  }

  // Get filtered data based on current selections
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

  // Available options for height, wind, and density removed

  // Handle filter changes
  const handleCountryChange = (value: string) => {
    setCountryFilter(value)
    setCityFilter("all")

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
        onCitySelect(selectedCityData)
      }
    } else {
      onCitySelect(null)
    }
  }

  // Handler functions for height, wind, and density filters removed

  return (
    <div className="p-2 bg-muted rounded-lg">
      <h2 className="text-lg font-medium mb-2">Filter Cities</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
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

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={resetFilters} className="flex items-center gap-1 h-8">
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
