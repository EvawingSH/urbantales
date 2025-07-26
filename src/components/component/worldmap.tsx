"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ZoomIn, ZoomOut, MoveHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { City } from "../../../types/city"

interface WorldMapProps {
  filteredCities: City[]
  selectedCity: City | null
  setSelectedCity: (city: City) => void
  cityCounts: Record<string, number>
  zoomToLocation?: { coordinates: [number, number]; zoom: number } | null
}

export default function WorldMap({
  filteredCities,
  selectedCity,
  setSelectedCity,
  cityCounts,
  zoomToLocation,
}: WorldMapProps) {
  const [hoveredCity, setHoveredCity] = useState<City | null>(null)
  const [zoom, setZoom] = useState(2) // Initial zoom level to show entire world
  const [center, setCenter] = useState<[number, number]>([0, 0]) // Initial center point
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number; centerX: number; centerY: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // CartoDB map style
  const mapUrl = "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
  const mapAttribution = "© CartoDB, © OpenStreetMap contributors"

  // Effect to handle zooming to a location
  useEffect(() => {
    if (zoomToLocation) {
      setCenter(zoomToLocation.coordinates)
      if (zoomToLocation.zoom === 100) {
        // Global view
        setZoom(2)
      } else {
        // Convert from our custom zoom scale to tile zoom level (1-18)
        const newZoom = Math.min(Math.max(Math.round(zoomToLocation.zoom / 50), 2), 18)
        setZoom(newZoom)
      }
    }
  }, [zoomToLocation])

  // Convert lat/lng to tile coordinates (same system for both tiles and markers)
  const latLngToTile = (lat: number, lng: number, z: number) => {
    const n = Math.pow(2, z)
    const x = ((lng + 180) / 360) * n
    const latRad = (lat * Math.PI) / 180
    const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
    return { x, y }
  }

  // Convert tile coordinates to pixel coordinates
  const tileToPixel = (tileX: number, tileY: number, centerTileX: number, centerTileY: number) => {
    if (!mapContainerRef.current) return { x: 0, y: 0 }

    const mapWidth = mapContainerRef.current.offsetWidth
    const mapHeight = mapContainerRef.current.offsetHeight

    const pixelX = (tileX - centerTileX) * 256 + mapWidth / 2
    const pixelY = (tileY - centerTileY) * 256 + mapHeight / 2

    return { x: pixelX, y: pixelY }
  }

  // Convert lat/lng to pixel coordinates (using the same tile system)
  const latLngToPixel = (lat: number, lng: number) => {
    const centerTile = latLngToTile(center[1], center[0], zoom)
    const pointTile = latLngToTile(lat, lng, zoom)

    return tileToPixel(pointTile.x, pointTile.y, centerTile.x, centerTile.y)
  }

  // Zoom functions
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 18))
  }

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 1))
  }

  // Reset map position to global view
  const resetPosition = () => {
    setCenter([0, 0])
    setZoom(2)
  }

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      centerX: center[0],
      centerY: center[1],
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart && mapContainerRef.current) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      // Calculate the movement in tile coordinates
      const tileDx = dx / 256
      const tileDy = dy / 256

      // Convert current center to tile coordinates
      const centerTile = latLngToTile(dragStart.centerY, dragStart.centerX, zoom)

      // Apply movement in tile space
      const newCenterTileX = centerTile.x - tileDx
      const newCenterTileY = centerTile.y - tileDy

      // Convert back to lat/lng
      const n = Math.pow(2, zoom)
      const newLng = (newCenterTileX / n) * 360 - 180
      const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * newCenterTileY) / n)))
      const newLat = (latRad * 180) / Math.PI

      // Clamp latitude to valid range
      const clampedLat = Math.max(-85, Math.min(85, newLat))

      setCenter([newLng, clampedLat])
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  // Add event listeners for global mouse events
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

  // Generate tiles for current view
  const generateTiles = () => {
    if (!mapContainerRef.current) return []

    const mapWidth = mapContainerRef.current.offsetWidth
    const mapHeight = mapContainerRef.current.offsetHeight

    const centerTile = latLngToTile(center[1], center[0], zoom)

    // Calculate how many tiles we need to cover the viewport
    const tilesX = Math.ceil(mapWidth / 256) + 2
    const tilesY = Math.ceil(mapHeight / 256) + 2

    const tiles = []

    for (let x = Math.floor(centerTile.x - tilesX / 2); x <= Math.floor(centerTile.x + tilesX / 2); x++) {
      for (let y = Math.floor(centerTile.y - tilesY / 2); y <= Math.floor(centerTile.y + tilesY / 2); y++) {
        // Ensure we're only requesting valid tiles
        const wrappedX = ((x % Math.pow(2, zoom)) + Math.pow(2, zoom)) % Math.pow(2, zoom)

        if (y >= 0 && y < Math.pow(2, zoom)) {
          const pixel = tileToPixel(x, y, centerTile.x, centerTile.y)

          tiles.push({
            x: pixel.x,
            y: pixel.y,
            url: mapUrl
              .replace("{z}", zoom.toString())
              .replace("{x}", wrappedX.toString())
              .replace("{y}", y.toString()),
          })
        }
      }
    }

    return tiles
  }

  const tiles = generateTiles()

  return (
    <div
      ref={mapContainerRef}
      className="bg-background rounded-lg border shadow-sm overflow-hidden h-full relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Render map tiles */}
      <div className="absolute inset-0" ref={mapRef}>
        {tiles.map((tile, index) => (
          <img
            key={`${tile.url}-${index}`}
            src={tile.url || "/placeholder.svg"}
            alt=""
            className="absolute"
            style={{
              left: tile.x,
              top: tile.y,
              width: 256,
              height: 256,
              pointerEvents: "none",
            }}
            crossOrigin="anonymous"
          />
        ))}
      </div>

      {/* Render city markers - Show ALL cities with their real coordinates */}
      <div className="absolute inset-0 pointer-events-none">
        {filteredCities
          .filter((city) => city.coordinates && Array.isArray(city.coordinates) && city.coordinates.length === 2)
          .map((city) => {
            const pixel = latLngToPixel(city.coordinates[1], city.coordinates[0])

            return (
              <div
                key={city.id} // Use unique ID instead of city name
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
                style={{
                  left: pixel.x,
                  top: pixel.y,
                }}
                onClick={() => setSelectedCity(city)}
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                <div
                  className={`rounded-full border-2 border-white shadow-lg transition-all ${
                    selectedCity && selectedCity.id === city.id
                      ? "w-4 h-4 bg-red-500"
                      : "w-3 h-3 bg-red-400 hover:bg-red-500"
                  }`}
                />
              </div>
            )
          })}
      </div>

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

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded">
        Zoom: {zoom}/18
      </div>

      {/* Attribution */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded">
        {mapAttribution}
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
              left: latLngToPixel(hoveredCity.coordinates[1], hoveredCity.coordinates[0]).x + 10,
              top: latLngToPixel(hoveredCity.coordinates[1], hoveredCity.coordinates[0]).y - 40,
              width: "auto",
              minWidth: "120px",
            }}
          >
            <div className="font-bold flex items-center gap-2">
              <span>
                {hoveredCity.name}, {hoveredCity.country}
              </span>
              <span className="inline-block">
                <Badge variant="outline" className="text-xs">
                  {hoveredCity.folderName}
                </Badge>
              </span>
            </div>
          </div>
        )}
    </div>
  )
}
