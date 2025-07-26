"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Info, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { City } from "../../../types/city"

interface CityInfoProps {
    selectedCity: City | null
    cityCounts: Record<string, number>
    selectedCityCases: City[]
    isDownloading: Record<string, boolean>
    handleDownload: (folderName: string) => Promise<void>
  }
  
 export default function CityInfo({
  selectedCity,
  cityCounts,
  selectedCityCases,
  isDownloading,
  handleDownload,
}: CityInfoProps) {
  if (!selectedCity) {
    return (
      <Card className="flex flex-col items-center justify-center h-full">
        <CardContent className="pt-6 text-center">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Case Selected</h3>
          <div className="text-muted-foreground mt-2">
            Click on a case marker on the map to view detailed information
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 py-3">
        <CardTitle>{selectedCity.name}</CardTitle>
        <div className="text-sm text-muted-foreground flex items-center">
          <span>{selectedCity.country}</span>
          <span className="ml-2">
            <Badge variant="outline">{selectedCity.folderName}</Badge>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto flex-grow pt-0">
        {/* Single case view - always show only the selected case */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-muted-foreground">{selectedCity.folderName}</div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 bg-transparent"
            onClick={() => handleDownload(selectedCity.folderName)}
            disabled={isDownloading[selectedCity.folderName]}
          >
            {isDownloading[selectedCity.folderName] ? (
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                <span>Downloading...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span>Download Data</span>
              </span>
            )}
          </Button>
        </div>

        <div className="relative h-48 w-full overflow-hidden rounded-md bg-muted">
          {selectedCity.image && (
            <Image
              src={selectedCity.image || "/placeholder.svg"}
              alt={`${selectedCity.name} visualization`}
              fill
              className="object-contain"
              unoptimized={selectedCity.image.includes("urbantales.020495.xyz")}
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Case ID</Label>
            <div className="font-medium">{selectedCity.folderName}</div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Coordinates</Label>
            <div className="font-medium">
              {selectedCity.coordinates[1].toFixed(4)}, {selectedCity.coordinates[0].toFixed(4)}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Building Height Std Dev</Label>
            <div className="font-medium">{selectedCity.stdDevBuildingHeightRange}</div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Wind Direction</Label>
            <div className="font-medium">{selectedCity.windDirection}°</div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Plan Area Density</Label>
            <div className="font-medium">{selectedCity.planAreaDensity}</div>
          </div>
        </div>

        {/* Show info about other cases in the same city */}
        {cityCounts[selectedCity.name] > 1 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Additional Cases in {selectedCity.name}</div>
            <div className="text-sm">
              {cityCounts[selectedCity.name] - 1} other case{cityCounts[selectedCity.name] > 2 ? "s" : ""} available
            </div>
            <div className="text-xs text-muted-foreground mt-1">Click other markers on the map to view them</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}