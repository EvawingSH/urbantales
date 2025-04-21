"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { ZoomIn, ZoomOut, MoveHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { City } from "../../../types/city"


interface WorldMapProps {
  filteredCities: City[]
  selectedCity: City | null
  setSelectedCity: (city: City) => void
  cityCounts: Record<string, number>
}

export default function WorldMap({ filteredCities, selectedCity, setSelectedCity, cityCounts }: WorldMapProps) {
  const [hoveredCity, setHoveredCity] = useState<City | null>(null)
  const [scale, setScale] = useState(150) // Initial zoom level
  const [center, setCenter] = useState<[number, number]>([0, 0]) // Initial center point
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Zoom functions
  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale * 1.5, 1000)) // Limit max zoom
  }

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale / 1.5, 50)) // Limit min zoom
  }

  // Reset map position
  const resetPosition = () => {
    setCenter([0, 0])
    setScale(150)
  }

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      // Calculate how much the mouse has moved
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      // Update the drag start position
      setDragStart({ x: e.clientX, y: e.clientY })

      // Calculate new center based on the drag distance and current scale
      // The division factor controls the speed of the drag
      const newCenter: [number, number] = [center[0] - (dx / scale) * 100, center[1] + (dy / scale) * 100]

      setCenter(newCenter)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  // Add event listeners for when mouse leaves the component or mouse up happens outside
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        setDragStart(null)
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging])

  // Get unique cities for markers (to avoid duplicate markers)
  const uniqueCities = filteredCities.reduce(
    (acc, city) => {
      const key = `${city.name}-${city.country}`
      if (!acc[key]) {
        acc[key] = city
      }
      return acc
    },
    {} as Record<string, City>,
  )

  return (
    <div
      ref={mapRef}
      className="bg-background rounded-lg border shadow-sm overflow-hidden h-full relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: scale,
          center: center,
        }}
      >
        <Geographies geography="/world-110m.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#EAEAEC"
                stroke="#FFFFFF"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none" }, // Removed fill change on hover
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {Object.values(uniqueCities)
          .filter((city) => city.coordinates && Array.isArray(city.coordinates) && city.coordinates.length === 2)
          .map((city) => (
            <Marker
              key={`${city.name}-${city.country}`}
              coordinates={city.coordinates}
              onClick={() => setSelectedCity(city)}
              onMouseEnter={() => {
                setHoveredCity(city)
              }}
              onMouseLeave={() => {
                setHoveredCity(null)
              }}
            >
              <circle
                r={selectedCity && selectedCity.name === city.name ? 8 : 4}
                fill={selectedCity && selectedCity.name === city.name ? "#FF5533" : "#F53"}
                stroke="#fff"
                strokeWidth={1}
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            </Marker>
          ))}
      </ComposableMap>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={zoomIn}
          className="bg-white/80 hover:bg-white shadow-md"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={zoomOut}
          className="bg-white/80 hover:bg-white shadow-md"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={resetPosition}
          className="bg-white/80 hover:bg-white shadow-md"
          aria-label="Reset position"
        >
          <MoveHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Tooltip */}
      {hoveredCity &&
        !isDragging &&
        hoveredCity.coordinates &&
        Array.isArray(hoveredCity.coordinates) &&
        hoveredCity.coordinates.length === 2 && (
          <div
            className="absolute bg-white p-2 rounded-md shadow-md border text-xs z-10 pointer-events-none"
            style={{
              left: `calc(${((hoveredCity.coordinates[0] + 180 - center[0]) / 360) * 100}% - 100px)`,
              top: `calc(${((90 - hoveredCity.coordinates[1] - center[1]) / 180) * 100}% - 120px)`,
              width: "auto",
              minWidth: "120px",
            }}
          >
            <div className="font-bold flex items-center gap-2">
              <span>
                {hoveredCity.name}, {hoveredCity.country}
              </span>
              {cityCounts[hoveredCity.name] > 1 && (
                <span className="inline-block">
                  <Badge variant="outline" className="text-xs">
                    {cityCounts[hoveredCity.name]} cases
                  </Badge>
                </span>
              )}
            </div>
          </div>
        )}
    </div>
  )
}
