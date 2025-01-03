'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Download, Search, ChevronDown, ChevronRight } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { fetchMetadataIdeal } from '@/utils/s3meta'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible" 

interface DataItem {
  Name: string
  Config: string
  "Wind direction": string
  Alignment: string
  "Folder Name": string
  "Direct Download Link": string
  "Size (MB)": string
  Density: string
  Height: string
}

interface Filters {
  alignment: string[]
  height: string[]
  windDirection: string[]
  density: string[]
}

export default function DataTable() {
  const [data, setData] = useState<DataItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    alignment: [],
    height: [],
    windDirection: [],
    density: []
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>({
    alignment: false,
    height: false,
    windDirection: false,
    density: false
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const metadata = await fetchMetadataIdeal()
        setData(metadata)
      } catch (err) {
        setError('Failed to load metadata')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCheckboxChange = (name: string) => {
    setSelectedItems(prev => 
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredData.map(item => item.Name))
    } else {
      setSelectedItems([])
    }
  }

  const handleDownload = (url: string) => {
    window.open(url, '_blank')
  }

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentFilter = prev[filterType]
      let updatedFilter: string[]

      if (value === 'all') {
        updatedFilter = currentFilter.length === uniqueValues[filterType].length ? [] : uniqueValues[filterType]
      } else {
        updatedFilter = currentFilter.includes(value)
          ? currentFilter.filter(item => item !== value)
          : [...currentFilter, value]
      }

      return { ...prev, [filterType]: updatedFilter }
    })
  }

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (filters.alignment.length === 0 || filters.alignment.includes(item.Alignment)) &&
      (filters.height.length === 0 || filters.height.includes(item.Height)) &&
      (filters.windDirection.length === 0 || filters.windDirection.includes(item["Wind direction"])) &&
      (filters.density.length === 0 || filters.density.includes(item.Density)) &&
      item.Name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, filters, searchTerm])

  const uniqueValues = useMemo(() => ({
    alignment: Array.from(new Set(data.map(item => item.Alignment))),
    height: Array.from(new Set(data.map(item => item.Height))),
    windDirection: Array.from(new Set(data.map(item => item["Wind direction"]))),
    density: Array.from(new Set(data.map(item => item.Density)))
  }), [data])

  const selectedItemsData = useMemo(() => {
    return data.filter(item => selectedItems.includes(item.Name))
  }, [data, selectedItems])

  const totalSelectedSize = useMemo(() => {
    return selectedItemsData.reduce((total, item) => total + parseFloat(item["Size (MB)"]), 0).toFixed(2)
  }, [selectedItemsData])

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const attemptDownload = async (item: DataItem, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const link = document.createElement('a');
        link.href = item["Direct Download Link"];
        link.target = '_blank';
        link.download = item.Name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await delay(1000); // Wait for 1 second before considering it a success
        return true; // Success
      } catch (error) {
        console.error(`Download attempt ${i + 1} failed for ${item.Name}:`, error);
        if (i < retries - 1) await delay(2000); // Wait for 2 seconds before retrying
      }
    }
    return false; // All attempts failed
  };

  const handleDownloadSelected = async () => {
    let successCount = 0;
    let failCount = 0;

    for (const item of selectedItemsData) {
      const success = await attemptDownload(item);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (failCount === 0) {
      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${successCount} file(s).`,
      });
    } else {
      toast({
        title: "Download Partially Complete",
        description: `Successfully downloaded ${successCount} file(s). Failed to download ${failCount} file(s).`,
        variant: "destructive",
      });
    }
  }

  const toggleFilter = (filterType: keyof Filters) => {
    setOpenFilters(prev => ({ ...prev, [filterType]: !prev[filterType] }))
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-left">Idealized Data Models Download</h1>
      <div className="flex gap-8">
        <div className="w-1/4">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-4 pt-2">Filters</h2>
          <div className="space-y-4">
            {Object.entries(filters).map(([key, selectedValues]) => (
              <Collapsible key={key} open={openFilters[key]} onOpenChange={() => toggleFilter(key as keyof Filters)}>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${key}-filter`} className="text-base font-large">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Label>
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
                        onCheckedChange={() => handleFilterChange(key as keyof Filters, 'all')}
                      />
                      <Label htmlFor={`${key}-all`} className='text-md'>All</Label>
                    </div>
                    {uniqueValues[key as keyof typeof uniqueValues].map(value => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${key}-${value}`}
                          checked={selectedValues.includes(value)}
                          onCheckedChange={() => handleFilterChange(key as keyof Filters, value)}
                        />
                        <Label className='font-normal text-md' htmlFor={`${key}-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
        <div className="w-3/4">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Showing {filteredData.length} out of {data.length} models
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by Name"
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
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead>Alignment</TableHead>
                  <TableHead>Density</TableHead>
                  <TableHead>Height</TableHead>
                  <TableHead>Wind direction</TableHead>
                  <TableHead>Size (MB)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.Name}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.Name)}
                        onCheckedChange={() => handleCheckboxChange(item.Name)}
                      />
                    </TableCell>
                    <TableCell className="font-bold">{item.Name}</TableCell>
                    <TableCell>{item.Alignment}</TableCell>
                    <TableCell>{item.Density}</TableCell>
                    <TableCell>{item.Height}</TableCell>
                    <TableCell>{item["Wind direction"]}</TableCell>
                    <TableCell>{item["Size (MB)"]}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(item["Direct Download Link"])}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-md text-gray-600 ml-4">
                Selected: {selectedItems.length} files (Total size: {totalSelectedSize} MB)
              </p>
              <Button className='mb-4 mr-4'
                onClick={handleDownloadSelected}
                disabled={selectedItems.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Selected
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}