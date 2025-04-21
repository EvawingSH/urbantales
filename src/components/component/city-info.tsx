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
            <h3 className="text-lg font-medium">No City Selected</h3>
            <div className="text-muted-foreground mt-2">
              Click on a city marker on the map to view detailed information
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
            {cityCounts[selectedCity.name] > 1 && (
              <span className="ml-2">
                <Badge variant="outline">{cityCounts[selectedCity.name]} cases</Badge>
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto flex-grow pt-0">
          {cityCounts[selectedCity.name] > 1 ? (
            // Multiple cases view
            <div className="space-y-6">
              {selectedCityCases.map((cityCase, index) => (
                <div key={cityCase.id} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      Case {index + 1}
                      <span className="text-xs text-muted-foreground">({cityCase.folderName})</span>
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => handleDownload(cityCase.folderName)}
                      disabled={isDownloading[cityCase.folderName]}
                    >
                      {isDownloading[cityCase.folderName] ? (
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
                  <div className="relative h-36 w-full overflow-hidden rounded-md bg-muted">
                    {cityCase.image && (
                      <Image
                        src={cityCase.image || "/placeholder.svg"}
                        alt={`${cityCase.name} visualization`}
                        fill
                        className="object-contain"
                        unoptimized={cityCase.image.includes("urbantales.020495.xyz")}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Building Height Std Dev</Label>
                      <div className="font-medium">{cityCase.stdDevBuildingHeightRange}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Wind Direction</Label>
                      <div className="font-medium">{cityCase.windDirection}°</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Plan Area Density</Label>
                      <div className="font-medium">{cityCase.planAreaDensity}</div>
                    </div>
                  </div>
                  {index < selectedCityCases.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          ) : (
            // Single case view
            <>
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-muted-foreground">{selectedCity.folderName}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
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
            </>
          )}
        </CardContent>
      </Card>
    )
  }
  