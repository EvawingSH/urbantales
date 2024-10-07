'use client'

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { Search, ChevronDown, ChevronRight, Download, Folder } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { S3Folder, S3Object, fetchS3Contents, findFolder } from "@/utils/s3Utils"

interface Item {
  id: number
  name: string
  folder: string
  description: string
  alignment: string
  height: string
  density: string
  windDirection: string
  s3Contents: S3Folder | null
}

interface Filters {
  alignment: string[]
  height: string[]
  density: string[]
  windDirection: string[]
}

const alignmentOptions = ["All", "Staggered", "Aligned"]
const heightOptions = ["All", "Variable", "Uniform"]
const densityOptions = ["All", "Sparse", "Medium", "Dense"]
const windDirectionOptions = ["All", "North", "South", "East", "West"]

export function FilterTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Filters>({
    alignment: ["All"],
    height: ["All"],
    density: ["All"],
    windDirection: ["All"],
  })
  const [items, setItems] = useState<Item[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchInitialItems = useCallback(async () => {
    console.log("Fetching initial items...")
    try {
      const response = await fetch('/IdealizedModelList.json')
      if (!response.ok) {
        throw new Error('Failed to fetch initial items')
      }
      const data = await response.json()
      console.log("Initial items data:", data)
      if (!Array.isArray(data.items)) {
        throw new Error('Initial items data is not an array')
      }
      setItems(data.items.map((item: Item) => ({ ...item, s3Contents: null })))
    } catch (error) {
      console.error('Error fetching initial items:', error)
      toast({
        title: "Error",
        description: "Failed to fetch initial items. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const updateItemsWithS3Contents = useCallback(async () => {
    try {
      const s3Data = await fetchS3Contents()
      // console.log('s3', s3Data)
      setItems(prevItems => {
        // console.log("Previous items:", prevItems)
        const newItems = prevItems.map(item => {
          const itemFolder = findFolder(s3Data, item.folder)
          console.log(`S3 contents for ${item.name}:`, itemFolder)
          return {
            ...item,
            s3Contents: itemFolder
          }
        })
        // console.log("New items:", newItems)
        return newItems
      })
    } catch (error) {
      console.error('Error updating items with S3 contents:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInitialItems().then(updateItemsWithS3Contents)
  }, [fetchInitialItems, updateItemsWithS3Contents])

  useEffect(() => {
    console.log('Updated items:', items)
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const alignmentMatch = filters.alignment.includes("All") || filters.alignment.includes(item.alignment)
      const heightMatch = filters.height.includes("All") || filters.height.includes(item.height)
      const densityMatch = filters.density.includes("All") || filters.density.includes(item.density)
      const windDirectionMatch = filters.windDirection.includes("All") || filters.windDirection.includes(item.windDirection)
      return nameMatch && alignmentMatch && heightMatch && densityMatch && windDirectionMatch
    })
  }, [searchTerm, filters, items])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (type: keyof Filters, value: string) => {
    setFilters((prevFilters) => {
      let updatedFilter: string[]

      if (value === "All") {
        updatedFilter = prevFilters[type].includes("All") ? [] : ["All"]
      } else {
        updatedFilter = prevFilters[type].filter(item => item !== "All")
        if (updatedFilter.includes(value)) {
          updatedFilter = updatedFilter.filter(item => item !== value)
        } else {
          updatedFilter.push(value)
        }
        if (updatedFilter.length === 0) {
          updatedFilter = ["All"]
        }
      }

      return {
        ...prevFilters,
        [type]: updatedFilter,
      }
    })
  }

  const renderCheckboxes = (type: keyof Filters, options: string[]) => {
    return options.map((option) => (
      <Label key={option} className="flex items-center gap-2 font-normal">
        <Checkbox
          checked={filters[type].includes(option)}
          onCheckedChange={() => handleFilterChange(type, option)}
          aria-label={`Filter by ${option}`}
        />
        {option}
      </Label>
    ))
  }

  const handleItemSelect = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(item => item.id))
    }
  }

  const toggleItemExpansion = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleDownload = () => {
    const selectedFiles = filteredItems
      .filter(item => selectedItems.includes(item.id))
      .flatMap(item => item.s3Contents?.files || [])

    console.log('Files to download:', selectedFiles)
    toast({
      title: "Download Initiated",
      description: `Downloading ${selectedFiles.length} file(s)`,
    })

    selectedFiles.forEach(file => {
      window.open(file.url, '_blank')
    })
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }

  const renderS3Contents = (s3Contents: S3Folder | null) => {
    if (!s3Contents) {
      return <p className="text-sm text-muted-foreground">No files available for this item.</p>
    }

    return (
      <div className="pl-4">
        {s3Contents.files.map((file, index) => (
          <div key={index} className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Checkbox
                checked={selectedItems.includes(parseInt(file.name))}
                onCheckedChange={() => handleItemSelect(parseInt(file.name))}
                aria-label={`Select ${file.name}`}
              />
              <span className="ml-2">{file.name} ({formatFileSize(file.size)})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(file.url, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {s3Contents.subfolders.map((subfolder, index) => (
          <div key={index} className="mt-2">
            <Accordion type="single" collapsible>
              <AccordionItem value={subfolder.name}>
                <AccordionTrigger className="text-sm">
                  <Folder className="h-4 w-4 mr-2" />
                  {subfolder.name}
                </AccordionTrigger>
                <AccordionContent>
                  {renderS3Contents(subfolder)}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>No items found. Please check your data sources and try again.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Idealized data models download</h1>
        <div className="w-full md:w-64 relative">
          <Input
            type="text"
            placeholder="Search models by Name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            aria-label="Search models"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <div className="bg-background rounded-md shadow-md p-4">
          <h2 className="text-lg font-bold mb-4">Filters</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="alignment">
              <AccordionTrigger className="text-base font-medium">Alignment</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {renderCheckboxes("alignment", alignmentOptions)}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="height">
              <AccordionTrigger className="text-base font-medium">Height</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {renderCheckboxes("height", heightOptions)}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="density">
              <AccordionTrigger className="text-base font-medium">Density</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {renderCheckboxes("density", densityOptions)}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="wind-direction">
              <AccordionTrigger className="text-base font-medium">Wind Direction</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {renderCheckboxes("windDirection", windDirectionOptions)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="bg-background rounded-md shadow-md p-4 overflow-x-auto">
          <p className="text-lg font-semibold text-muted-foreground mb-4">
            Selecting {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} out of {items.length} total models.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Alignment</TableHead>
                <TableHead>Height</TableHead>
                <TableHead>Density</TableHead>
                <TableHead>Wind Direction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <React.Fragment key={item.id}>
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleItemSelect(item.id)}
                        aria-label={`Select ${item.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0"
                        onClick={() => toggleItemExpansion(item.id)}
                      >
                        {expandedItems.includes(item.id) ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        {item.name}
                      </Button>
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.alignment}</TableCell>
                    <TableCell>{item.height}</TableCell>
                    <TableCell>{item.density}</TableCell>
                    <TableCell>{item.windDirection}</TableCell>
                  </TableRow>
                  {expandedItems.includes(item.id) && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="pl-8 py-2">
                          {renderS3Contents(item.s3Contents)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end pt-6">
            <Button 
              onClick={handleDownload}
              disabled={selectedItems.length === 0}
            >
              Download ({selectedItems.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}