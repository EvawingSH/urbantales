"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Download, Search, ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { LoadingSpinner } from "@/components/component/loadingSpinner"
import { Popup } from "@/components/component/Popup"
import { Info } from "lucide-react"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import MetadataFilesPage from "@/components/component/metadata"

interface FileItem {
  "File Name": string
  "Direct Download Link": string
  "Size (MB)": number
}

interface FolderItem {
  "Folder Name": string
  Config: string
  Country: string
  City: string
  "Standard Deviation of Building Height": string
  "Std of Building Height": string
  "Wind Direction": string
  "Plan Area Density": string
  Files: FileItem[]
  "Direct Download Link": string
}

interface Filters {
  Country: string[]
  City: string[]
  verticalConfiguration: string[]
  windDirection: string[]
  areaDensity: string[]
  fileType: string[]
}

async function zipAndDownloadFiles(files: { url: string; name: string }[]) {
  const zip = new JSZip()

  for (const file of files) {
    const response = await fetch(file.url)
    const blob = await response.blob()
    zip.file(file.name, blob, { binary: true })
  }

  const content = await zip.generateAsync({ type: "blob" })
  saveAs(content, "selected_files.zip")
}

export default function DataTable() {
  const [data, setData] = useState<FolderItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<{ [folderName: string]: string[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    Country: [],
    City: [],
    verticalConfiguration: [],
    windDirection: [],
    areaDensity: [],
    fileType: [],
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>({
    Country: false,
    City: false,
    verticalConfiguration: false,
    windDirection: false,
    areaDensity: false,
    fileType: false,
  })
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/metadata_rea")
        const jsonData = await response.json()
        setData(jsonData)
      } catch (err) {
        setError("Failed to load metadata")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Helper function to get filtered files for a folder
  const getFilteredFiles = (folder: FolderItem) => {
    if (filters.fileType.length === 0) {
      return folder.Files
    }

    return folder.Files.filter((file) => filters.fileType.some((fileType) => file["File Name"].includes(fileType)))
  }

  const handleFolderCheckboxChange = (folderName: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(folderName)) {
        return prev.filter((item) => item !== folderName)
      } else {
        return [...prev, folderName]
      }
    })

    setSelectedFiles((prev) => {
      const newSelectedFiles = { ...prev }
      const folder = data.find((item) => item["Folder Name"] === folderName)

      if (folder) {
        // Get only the files that match the current file type filter
        const filteredFiles = getFilteredFiles(folder)

        if (prev[folderName]?.length === filteredFiles.length) {
          // If all filtered files are already selected, deselect them
          delete newSelectedFiles[folderName]
        } else {
          // Otherwise, select all filtered files
          newSelectedFiles[folderName] = filteredFiles.map((file) => file["File Name"])
        }
      }
      return newSelectedFiles
    })
  }

  const handleFileCheckboxChange = (folderName: string, fileName: string) => {
    setSelectedFiles((prev) => {
      const newSelectedFiles = { ...prev }
      if (!newSelectedFiles[folderName]) {
        newSelectedFiles[folderName] = []
      }
      if (newSelectedFiles[folderName].includes(fileName)) {
        newSelectedFiles[folderName] = newSelectedFiles[folderName].filter((f) => f !== fileName)
      } else {
        newSelectedFiles[folderName].push(fileName)
      }
      if (newSelectedFiles[folderName].length === 0) {
        delete newSelectedFiles[folderName]
      }
      return newSelectedFiles
    })

    setSelectedItems((prev) => {
      const folder = data.find((item) => item["Folder Name"] === folderName)
      if (folder) {
        const filteredFiles = getFilteredFiles(folder)
        if (selectedFiles[folderName]?.length === filteredFiles.length - 1) {
          return [...prev, folderName]
        } else if (selectedFiles[folderName]?.length === 0) {
          return prev.filter((item) => item !== folderName)
        }
      }
      return prev
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredData.map((item) => item["Folder Name"]))
      const newSelectedFiles: { [folderName: string]: string[] } = {}

      filteredData.forEach((folder) => {
        // Only select files that match the current file type filter
        const filteredFiles = getFilteredFiles(folder)
        newSelectedFiles[folder["Folder Name"]] = filteredFiles.map((file) => file["File Name"])
      })

      setSelectedFiles(newSelectedFiles)
    } else {
      setSelectedItems([])
      setSelectedFiles({})
    }
  }

  const handleDownload = (url: string) => {
    window.open(url, "_blank")
  }

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters((prev) => {
      const currentFilter = prev[filterType]
      let updatedFilter: string[]

      if (value === "all") {
        updatedFilter =
          currentFilter.length === uniqueValues[filterType].length ? [] : uniqueValues[filterType].map(String)
      } else {
        updatedFilter = currentFilter.includes(value)
          ? currentFilter.filter((item) => item !== value)
          : [...currentFilter, value]
      }

      // Reset City filter when Country filter changes
      if (filterType === "Country") {
        return { ...prev, [filterType]: updatedFilter, City: [] }
      }

      // When file type filter changes, update selected files to match the new filter
      if (filterType === "fileType") {
        // We'll update the selected files in a useEffect
      }

      return { ...prev, [filterType]: updatedFilter }
    })
  }

  // Update selected files when file type filter changes
  useEffect(() => {
    // Update selected files to match the current file type filter
    setSelectedFiles((prev) => {
      const newSelectedFiles: { [folderName: string]: string[] } = {}

      // For each previously selected folder
      Object.keys(prev).forEach((folderName) => {
        const folder = data.find((item) => item["Folder Name"] === folderName)
        if (folder) {
          // Get files that match the current filter
          const filteredFiles = getFilteredFiles(folder)
          const filteredFileNames = filteredFiles.map((file) => file["File Name"])

          // Only keep files that were previously selected AND match the current filter
          const selectedFilteredFiles = prev[folderName].filter((fileName) => filteredFileNames.includes(fileName))

          if (selectedFilteredFiles.length > 0) {
            newSelectedFiles[folderName] = selectedFilteredFiles
          }
        }
      })

      return newSelectedFiles
    })

    // Update selected items based on the new selected files
    setSelectedItems((prev) => {
      return prev.filter((folderName) => {
        const folder = data.find((item) => item["Folder Name"] === folderName)
        if (folder) {
          const filteredFiles = getFilteredFiles(folder)
          // Keep the folder selected if all its filtered files are selected
          return selectedFiles[folderName]?.length === filteredFiles.length
        }
        return false
      })
    })
  }, [filters.fileType, data])

  const filteredData = useMemo(() => {
    const sortedData = data.filter((item) => {
      // Basic folder filters
      const folderMatches =
        (filters.Country.length === 0 || filters.Country.includes(item["Country"])) &&
        (filters.City.length === 0 || filters.City.includes(item["City"])) &&
        (filters.verticalConfiguration.length === 0 ||
          filters.verticalConfiguration.includes(item["Standard Deviation of Building Height"])) &&
        (filters.windDirection.length === 0 || filters.windDirection.includes(item["Wind Direction"])) &&
        (filters.areaDensity.length === 0 || filters.areaDensity.includes(item["Plan Area Density"])) &&
        item["Folder Name"].toLowerCase().includes(searchTerm.toLowerCase())

      // If no file type filter is applied or folder doesn't match other filters, return the folder match result
      if (filters.fileType.length === 0 || !folderMatches) {
        return folderMatches
      }

      // Check if any file in the folder matches the selected file types
      return item.Files.some((file) => {
        const fileName = file["File Name"]
        return filters.fileType.some((fileType) => fileName.includes(fileType))
      })
    })

    if (sortConfig !== null) {
      sortedData.sort((a, b) => {
        if (a[sortConfig.key as keyof FolderItem] < b[sortConfig.key as keyof FolderItem]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key as keyof FolderItem] > b[sortConfig.key as keyof FolderItem]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return sortedData
  }, [data, filters, searchTerm, sortConfig])

  const uniqueValues = useMemo(() => {
    const countriesSet = new Set(data.map((item) => item["Country"]))
    const filteredData =
      filters.Country.length > 0 ? data.filter((item) => filters.Country.includes(item["Country"])) : data

    const sortStrings = (array: string[]) => array.sort((a, b) => a.localeCompare(b)) // For alphabetical sorting

    const sortNumbers = (array: string[]) =>
      array
        .map((item) => (item === "" || item === null ? null : Number(item))) // Convert to number, handle empty/null
        .sort((a, b) => {
          if (a === null) return 1 // Push null to the end
          if (b === null) return -1 // Push null to the end
          return a - b // Numerical sorting
        })

    // Extract file types from all files
    const fileTypes = [".nc", "_p3d", "_topo", ".png", ".csv"]

    return {
      Country: Array.from(countriesSet),
      City: Array.from(new Set(filteredData.map((item) => item["City"]))),
      verticalConfiguration: sortStrings(
        Array.from(new Set(data.map((item) => item["Standard Deviation of Building Height"]))),
      ),
      windDirection: sortNumbers(Array.from(new Set(data.map((item) => item["Wind Direction"])))),
      areaDensity: Array.from(new Set(data.map((item) => item["Plan Area Density"]))),
      fileType: fileTypes,
    }
  }, [data, filters.Country])

  const selectedItemsData = useMemo(() => {
    return data.filter((item) => selectedItems.includes(item["Folder Name"]))
  }, [data, selectedItems])

  const totalSelectedSize = useMemo(() => {
    return Object.entries(selectedFiles)
      .reduce((total, [folderName, fileNames]) => {
        const folder = data.find((item) => item["Folder Name"] === folderName)
        if (folder) {
          return (
            total +
            fileNames.reduce((folderTotal, fileName) => {
              const file = folder.Files.find((f) => f["File Name"] === fileName)
              return folderTotal + (file ? file["Size (MB)"] : 0)
            }, 0)
          )
        }
        return total
      }, 0)
      .toFixed(2)
  }, [data, selectedFiles])

  const handleDownloadSelected = async () => {
    const filesToDownload: { url: string; name: string }[] = []

    for (const [folderName, fileNames] of Object.entries(selectedFiles)) {
      const folder = data.find((item) => item["Folder Name"] === folderName)
      if (folder) {
        for (const fileName of fileNames) {
          const file = folder.Files.find((f) => f["File Name"] === fileName)
          if (file) {
            filesToDownload.push({
              url: file["Direct Download Link"],
              name: `${folderName}/${file["File Name"]}`,
            })
          }
        }
      }
    }

    if (filesToDownload.length > 0) {
      setIsDownloading(true)
      toast({
        title: "Preparing Download",
        description: `Zipping ${filesToDownload.length} files. This may take a moment.`,
      })

      try {
        await zipAndDownloadFiles(filesToDownload)
        toast({
          title: "Download Complete",
          description: `Successfully zipped and downloaded ${filesToDownload.length} files.`,
        })
      } catch (error) {
        console.error("Error zipping files:", error)
        toast({
          title: "Download Failed",
          description: "An error occurred while zipping the files. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDownloading(false)
      }
    } else {
      toast({
        title: "No Files Selected",
        description: "Please select files to download.",
        variant: "destructive",
      })
    }
  }

  const toggleFilter = (filterType: keyof Filters) => {
    setOpenFilters((prev) => ({ ...prev, [filterType]: !prev[filterType] }))
  }

  const toggleFolderExpansion = (folderName: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderName) ? prev.filter((name) => name !== folderName) : [...prev, folderName],
    )
  }

  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const isFileSelected = (folderName: string, fileName: string) => {
    return selectedFiles[folderName]?.includes(fileName) || false
  }

  const isFolderSelected = (folderName: string) => {
    const folder = data.find((item) => item["Folder Name"] === folderName)
    if (folder) {
      const filteredFiles = getFilteredFiles(folder)
      return selectedFiles[folderName]?.length === filteredFiles.length
    }
    return false
  }

  if (loading)
    return (
      <div className="pt-6 pb-8">
        <LoadingSpinner size="md" />
      </div>
    )
  if (error) return <div>Error: {error}</div>
  return (
    <div className="relative pb-16">
      <div className="container mx-auto pt-8">
        <h1 className="text-2xl font-bold mb-6 text-left">Realistic Urban Neighbourhoods Cases Download</h1>
        <MetadataFilesPage />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/5">
            <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-4 pt-2">Filters</h2>
            <div className="space-y-4">
              {Object.entries(filters).map(([key, selectedValues]) => (
                <Collapsible key={key} open={openFilters[key]} onOpenChange={() => toggleFilter(key as keyof Filters)}>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${key}-filter`} className="text-base font-large">
                      {key === "Country" ? (
                        "Country"
                      ) : key === "City" ? (
                        "City"
                      ) : key === "verticalConfiguration" ? (
                        <>
                          Standard Deviation of <br /> Building Height (m)
                        </>
                      ) : key === "windDirection" ? (
                        "Wind Direction (deg)"
                      ) : key === "areaDensity" ? (
                        "Plan Area Density"
                      ) : key === "fileType" ? (
                        "File Types"
                      ) : (
                        key
                      )}
                    </Label>
                    <Popup
                      trigger={
                        <Button variant="ghost" size="sm" className="p-0 text-gray-400 hover:text-gray-600 ">
                          <Info className="h-4 w-4" />
                        </Button>
                      }
                      content={
                        <div className="max-w-xs">
                          {key === "horizontalConfiguration" ? (
                            <div className="text-gray-500 size-sm">
                              <p>
                                <strong>Aligned:</strong> Scenarios featuring a single, uninterrupted street aligned
                                parallel to the prevailing wind direction, simulating an extreme case of urban layouts.
                              </p>
                              <p>
                                <strong>Staggered:</strong> Scenarios that avoid the presence of major wind-aligned
                                corridors, which can artificially reduce building drag and are often employed to
                                calibrate urban canopy models (UCM).
                              </p>
                            </div>
                          ) : key === "verticalConfiguration" ? (
                            <p className="text-gray-500 size-sm">
                              Standard Deviation of Building Height is refering to the building height distrubution for
                              the neighbourhoods.
                            </p>
                          ) : key === "windDirection" ? (
                            <p className="text-gray-500 size-sm">
                              Wind Direction is the approaching angle to the urban
                            </p>
                          ) : key === "areaDensity" ? (
                            <p className="text-gray-500 size-sm">
                              Plan Area Density is the ratio of total building footprint to the whole neighborhood area.
                            </p>
                          ) : key === "fileType" ? (
                            <p className="text-gray-500 size-sm">
                              Shows folders containing at least one file of the selected type, as well as all files of selected types within the folder.
                            </p>
                          ) : (
                            "Location filter"
                          )}
                        </div>
                      }
                    />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {openFilters[key] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${key}-all`}
                          checked={selectedValues.length === uniqueValues[key as keyof typeof uniqueValues].length}
                          onCheckedChange={() => handleFilterChange(key as keyof Filters, "all")}
                        />
                        <Label htmlFor={`${key}-all`} className="text-md">
                          All
                        </Label>
                      </div>
                      {uniqueValues[key as keyof typeof uniqueValues].map((value) => (
                        <div key={value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${key}-${value}`}
                            checked={selectedValues.includes(value)}
                            onCheckedChange={() => handleFilterChange(key as keyof Filters, value as string)}
                          />
                          <Label className="font-normal text-md" htmlFor={`${key}-${value}`}>
                            {value}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
          <div className="lg:w-4/5">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Showing {filteredData.length} out of {data.length} folders
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by Folder Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-2 w-64"
                  />
                </div>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedItems.length === filteredData.length}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                      />
                    </TableHead>
                    <TableHead className="font-bold w-15">
                      <Button variant="ghost" onClick={() => handleSort("Folder Name")}>
                        Folder Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-15">
                      <Button variant="ghost" onClick={() => handleSort("Country")}>
                        Country
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-20">
                      <Button variant="ghost" onClick={() => handleSort("City")}>
                        City
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-20">
                      <Button variant="ghost" onClick={() => handleSort("Std of Building Height")}>
                        Std of <br />
                        Building Height (m)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-25">
                      <Button variant="ghost" onClick={() => handleSort("Wind Direction")}>
                        Wind Direction <br /> (deg)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-25">
                      <Button variant="ghost" onClick={() => handleSort("Area Density")}>
                        Plan <br /> Area Density
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((folder) => (
                    <React.Fragment key={folder["Folder Name"]}>
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            checked={isFolderSelected(folder["Folder Name"])}
                            onCheckedChange={() => handleFolderCheckboxChange(folder["Folder Name"])}
                          />
                        </TableCell>
                        <TableCell className="font-bold w-20">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFolderExpansion(folder["Folder Name"])}
                          >
                            {expandedFolders.includes(folder["Folder Name"]) ? (
                              <ChevronDown className="h-4 w-4 mr-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-2" />
                            )}
                            {folder["Folder Name"]}
                          </Button>
                        </TableCell>
                        <TableCell className="text-xs w-15">{folder["Country"]}</TableCell>
                        <TableCell className="text-xs w-20">{folder["City"]}</TableCell>
                        <TableCell className="text-xs w-20">
                          <div>{Number(folder["Std of Building Height"]).toFixed(2)}</div>
                        </TableCell>
                        <TableCell>{folder["Wind Direction"]}</TableCell>
                        <TableCell>{folder["Plan Area Density"]}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Only download files that match the current filter
                              const filteredFiles = getFilteredFiles(folder)
                              filteredFiles.forEach((file) => handleDownload(file["Direct Download Link"]))
                            }}
                            className="text-xs px-2 py-1"
                          >
                            <Download className="h-3 w-3 mr-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedFolders.includes(folder["Folder Name"]) && (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Select</TableHead>
                                  <TableHead>File Name</TableHead>
                                  <TableHead>Size (MB)</TableHead>
                                  <TableHead>Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getFilteredFiles(folder).map((file) => (
                                  <TableRow key={file["File Name"]}>
                                    <TableCell>
                                      <Checkbox
                                        checked={isFileSelected(folder["Folder Name"], file["File Name"])}
                                        onCheckedChange={() =>
                                          handleFileCheckboxChange(folder["Folder Name"], file["File Name"])
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>{file["File Name"]}</TableCell>
                                    <TableCell>{file["Size (MB)"]}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDownload(file["Direct Download Link"])}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center">
          <p className="text-md text-gray-600">
            Selected: {Object.values(selectedFiles).flat().length} files (Total size: {totalSelectedSize} MB)
          </p>
          <div className="flex items-center">
            {Number.parseFloat(totalSelectedSize) > 1024 && (
              <p className="text-red-500 mr-4 text-sm">
                Please download files smaller than 1GB (1024MB) at a time to avoid failure.
              </p>
            )}
            <Button
              onClick={handleDownloadSelected}
              disabled={
                Object.keys(selectedFiles).length === 0 || isDownloading || Number.parseFloat(totalSelectedSize) > 1024
              }
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Zipping & Downloading..." : "Download Selected Files"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
