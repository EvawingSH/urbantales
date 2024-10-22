'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Download, Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface DataItem {
  NameE: string
  Config: string
  "Wind direction": string
  Alignment: string
  "Folder Name": string
  "Direct Download Link": string
  "Size (MB)": string
  Density: string
  Height: string
}

export default function DataTable() {
  const [data, setData] = useState<DataItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filters, setFilters] = useState({
    alignment: 'all',
    height: 'all',
    windDirection: 'all',
    density: 'all'
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch('IdealizedModelmeta.json')
      .then(response => response.json())
      .then(jsonData => setData(jsonData))
      .catch(error => console.error('Error fetching data:', error))
  }, [])

  const handleCheckboxChange = (nameE: string) => {
    setSelectedItems(prev => 
      prev.includes(nameE) ? prev.filter(item => item !== nameE) : [...prev, nameE]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredData.map(item => item.NameE))
    } else {
      setSelectedItems([])
    }
  }

  const handleDownload = (url: string) => {
    window.open(url, '_blank')
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (filters.alignment === 'all' || item.Alignment === filters.alignment) &&
      (filters.height === 'all' || item.Height === filters.height) &&
      (filters.windDirection === 'all' || item["Wind direction"] === filters.windDirection) &&
      (filters.density === 'all' || item.Density === filters.density) &&
      item.NameE.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, filters, searchTerm])

  const uniqueValues = useMemo(() => ({
    alignment: Array.from(new Set(data.map(item => item.Alignment))),
    height: Array.from(new Set(data.map(item => item.Height))),
    windDirection: Array.from(new Set(data.map(item => item["Wind direction"]))),
    density: Array.from(new Set(data.map(item => item.Density)))
  }), [data])

  const selectedItemsData = useMemo(() => {
    return data.filter(item => selectedItems.includes(item.NameE))
  }, [data, selectedItems])

  const totalSelectedSize = useMemo(() => {
    return selectedItemsData.reduce((total, item) => total + parseFloat(item["Size (MB)"]), 0).toFixed(2)
  }, [selectedItemsData])

  const handleDownloadSelected = () => {
    selectedItemsData.forEach(item => {
      const link = document.createElement('a');
      link.href = item["Direct Download Link"];
      link.target = '_blank';
      link.download = item.NameE;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-left">Idealized Data Models Download</h1>
      <div className="flex gap-8">
        <div className="w-1/4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="alignment-filter">Alignment</Label>
              <Select onValueChange={(value) => handleFilterChange('alignment', value)} defaultValue="all">
                <SelectTrigger id="alignment-filter">
                  <SelectValue placeholder="Select Alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueValues.alignment.map(value => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="height-filter">Height</Label>
              <Select onValueChange={(value) => handleFilterChange('height', value)} defaultValue="all">
                <SelectTrigger id="height-filter">
                  <SelectValue placeholder="Select Height" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueValues.height.map(value => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="wind-direction-filter">Wind Direction</Label>
              <Select onValueChange={(value) => handleFilterChange('windDirection', value)} defaultValue="all">
                <SelectTrigger id="wind-direction-filter">
                  <SelectValue placeholder="Select Wind Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueValues.windDirection.map(value => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="density-filter">Density</Label>
              <Select onValueChange={(value) => handleFilterChange('density', value)} defaultValue="all">
                <SelectTrigger id="density-filter">
                  <SelectValue placeholder="Select Density" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueValues.density.map(value => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  <TableHead className="font-bold">NameE</TableHead>
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
                  <TableRow key={item.NameE}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.NameE)}
                        onCheckedChange={() => handleCheckboxChange(item.NameE)}
                      />
                    </TableCell>
                    <TableCell className="font-bold">{item.NameE}</TableCell>
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
              <p className="text-sm text-gray-600">
                Selected: {selectedItems.length} files (Total size: {totalSelectedSize} MB)
              </p>
              <Button
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