'use client'

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { S3Folder, fetchS3Contents, findFolder } from "@/utils/s3Utils"
import { FilterSection } from "./FilterSection"
import { ItemTable } from "./ItemTable"
import { Item, Filters } from "./types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import JSZip from 'jszip'

export default function FilterTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Filters>({
    alignment: ["All"],
    height: ["All"],
    density: ["All"],
    windDirection: ["All"],
  })
  const [items, setItems] = useState<Item[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalSize, setTotalSize] = useState(0)
  const [allSelected, setAllSelected] = useState(false)
  const { toast } = useToast()

  const limitation = 50 * 1024 * 1024 * 2

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
      setItems(prevItems => {
        console.log("Previous items:", prevItems)
        const newItems = prevItems.map(item => {
          const itemFolder = findFolder(s3Data, item.folder)
          console.log(`S3 contents for ${item.name}:`, itemFolder)
          return {
            ...item,
            s3Contents: itemFolder
          }
        })
        console.log("New items:", newItems)
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

  const handleItemSelect = (id: number) => {
    const item = items.find(i => i.id === id)
    if (item && item.s3Contents) {
      const allFileNames = item.s3Contents.files.map(file => file.name)
      const allSelected = allFileNames.every(fileName => selectedFiles.has(fileName))

      setSelectedItems(prev => {
        if (allSelected) {
          return prev.filter(itemId => itemId !== id)
        } else {
          return [...prev, id]
        }
      })

      allFileNames.forEach(fileName => {
        handleFileSelect(fileName, id, !allSelected, true)
      })

      updateAllSelectedState()
    }
  }

  const handleFileSelect = (fileName: string, itemId: number, forceSelect?: boolean, fromItemSelect: boolean = false) => {
    const item = items.find(i => i.id === itemId)
    if (item && item.s3Contents) {
      const file = item.s3Contents.files.find(f => f.name === fileName)
      if (file) {
        setSelectedFiles(prev => {
          const newSet = new Set(prev)
          const isCurrentlySelected = newSet.has(fileName)
          const shouldBeSelected = forceSelect === undefined ? !isCurrentlySelected : forceSelect

          if (shouldBeSelected && !isCurrentlySelected) {
            newSet.add(fileName)
            setTotalSize(prevSize => prevSize + file.size)
          } else if (!shouldBeSelected && isCurrentlySelected) {
            newSet.delete(fileName)
            setTotalSize(prevSize => prevSize - file.size)
          }

          return newSet
        })

        if (!fromItemSelect) {
          setSelectedItems(prev => {
            const allFilesSelected = item.s3Contents!.files.every(f => 
              f.name === fileName ? (forceSelect === undefined ? !selectedFiles.has(f.name) : forceSelect) : selectedFiles.has(f.name)
            )

            if (allFilesSelected && !prev.includes(itemId)) {
              return [...prev, itemId]
            } else if (!allFilesSelected && prev.includes(itemId)) {
              return prev.filter(id => id !== itemId)
            }
            return prev
          })
        }
      }

      if (!fromItemSelect) {
        updateAllSelectedState()
      }
    }
  }

  const updateAllSelectedState = () => {
    const allFilesSelected = items.every(item => 
      item.s3Contents?.files.every(file => selectedFiles.has(file.name)) ?? false
    )
    setAllSelected(allFilesSelected)
  }

  const handleSelectAll = () => {
    const newAllSelected = !allSelected
    setAllSelected(newAllSelected)

    items.forEach(item => {
      if (item.s3Contents) {
        item.s3Contents.files.forEach(file => {
          handleFileSelect(file.name, item.id, newAllSelected)
        })
      }
    })
  }

  const handleDownload = async () => {
    const filesToDownload = Array.from(selectedFiles)
    console.log('Files to download:', filesToDownload)
    toast({
      title: "Download Initiated",
      description: `Preparing ${filesToDownload.length} file(s) (${formatFileSize(totalSize)}) for download`,
    })

    const zip = new JSZip()
    let failedFiles = 0

    for (const fileName of filesToDownload) {
      const file = items.flatMap(item => item.s3Contents?.files || []).find(f => f.name === fileName)
      if (file) {
        try {
          const response = await fetch(file.url)
          const blob = await response.blob()
          zip.file(fileName, blob)
        } catch (error) {
          console.error(`Error downloading file ${fileName}:`, error)
          failedFiles++
        }
      }
    }

    if (failedFiles > 0) {
      toast({
        title: "Download Warning",
        description: `Failed to include ${failedFiles} file(s) in the zip. They will be omitted.`,
        variant: "destructive",
      })
    }

    try {
      const content = await zip.generateAsync({ type: "blob" })
      const url = window.URL.createObjectURL(content)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = "selected_files.zip"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${filesToDownload.length - failedFiles} file(s) as a zip.`,
      })
    } catch (error) {
      console.error('Error creating zip file:', error)
      toast({
        title: "Download Error",
        description: "Failed to create zip file. Please try again.",
        variant: "destructive",
      })
    }
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
        <FilterSection filters={filters} handleFilterChange={handleFilterChange} />
        <ItemTable
          filteredItems={filteredItems}
          totalItems={items.length}
          selectedItems={selectedItems}
          selectedFiles={selectedFiles}
          expandedItems={expandedItems}
          handleItemSelect={handleItemSelect}
          handleFileSelect={handleFileSelect}
          toggleItemExpansion={(id: number) => setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
          )}
          handleSelectAll={handleSelectAll}
          allSelected={allSelected}
        />
      </div>
      <div className="mt-4 flex justify-end items-center pt-6 space-x-4">
        {totalSize > limitation && (
          <Alert variant="destructive" className="w-auto">
            <AlertDescription>
              Please download less than 50MB at a time
            </AlertDescription>
          </Alert>
        )}
        <Button 
          onClick={handleDownload}
          disabled={selectedFiles.size === 0 || totalSize > limitation}
        >
          Download({formatFileSize(totalSize)})
        </Button>
      </div>
    </div>
  )
}

function formatFileSize(size: number) {
  if (size < 1024 * 2) return `${size / 2} B`
  if (size < 1024 * 1024 * 2) return `${(size / 1024 / 2).toFixed(1)} KB`
  return `${(size / (1024 * 2 * 1024)).toFixed(1)} MB`
}