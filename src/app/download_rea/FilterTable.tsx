'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Download, Search, ChevronDown, ChevronRight, ArrowUpDown } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface FileItem {
  "File Name": string;
  "Direct Download Link": string;
  "Size (MB)": number;
}

interface FolderItem {
  "Folder Name": string;
  Config: string;
  "Country": string;
  "City": string;
  "Vertical Configuration": string;
  "Wind Direction": string;
  "Area Density": string;
  Files: FileItem[];
}

interface Filters {
  Country: string[];
  City: string[];
  verticalConfiguration: string[];
  windDirection: string[];
  areaDensity: string[];
}

export default function DataTable() {
  const [data, setData] = useState<FolderItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<{ [folderName: string]: string[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    Country: [],
    City:[],
    verticalConfiguration: [],
    windDirection: [],
    areaDensity: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>({
    Country: false,
    City: false,
    verticalConfiguration: false,
    windDirection: false,
    areaDensity: false
  })
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/metadata_rea')
        const jsonData = await response.json()
        setData(jsonData)
      } catch (err) {
        setError('Failed to load metadata')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleFolderCheckboxChange = (folderName: string) => {
    setSelectedItems(prev => {
      if (prev.includes(folderName)) {
        return prev.filter(item => item !== folderName)
      } else {
        return [...prev, folderName]
      }
    })

    setSelectedFiles(prev => {
      const newSelectedFiles = { ...prev }
      const folder = data.find(item => item["Folder Name"] === folderName)
      if (folder) {
        if (prev[folderName]?.length === folder.Files.length) {
          delete newSelectedFiles[folderName]
        } else {
          newSelectedFiles[folderName] = folder.Files.map(file => file["File Name"])
        }
      }
      return newSelectedFiles
    })
  }

  const handleFileCheckboxChange = (folderName: string, fileName: string) => {
    setSelectedFiles(prev => {
      const newSelectedFiles = { ...prev }
      if (!newSelectedFiles[folderName]) {
        newSelectedFiles[folderName] = []
      }
      if (newSelectedFiles[folderName].includes(fileName)) {
        newSelectedFiles[folderName] = newSelectedFiles[folderName].filter(f => f !== fileName)
      } else {
        newSelectedFiles[folderName].push(fileName)
      }
      if (newSelectedFiles[folderName].length === 0) {
        delete newSelectedFiles[folderName]
      }
      return newSelectedFiles
    })

    setSelectedItems(prev => {
      const folder = data.find(item => item["Folder Name"] === folderName)
      if (folder) {
        if (selectedFiles[folderName]?.length === folder.Files.length - 1) {
          return [...prev, folderName]
        } else if (selectedFiles[folderName]?.length === 0) {
          return prev.filter(item => item !== folderName)
        }
      }
      return prev
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredData.map(item => item["Folder Name"]))
      const newSelectedFiles: { [folderName: string]: string[] } = {}
      filteredData.forEach(folder => {
        newSelectedFiles[folder["Folder Name"]] = folder.Files.map(file => file["File Name"])
      })
      setSelectedFiles(newSelectedFiles)
    } else {
      setSelectedItems([])
      setSelectedFiles({})
    }
  }

  const handleDownload = (url: string) => {
    window.open(url, '_blank')
  }

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentFilter = prev[filterType];
      let updatedFilter: string[];

      if (value === 'all') {
        updatedFilter = currentFilter.length === uniqueValues[filterType].length ? [] : uniqueValues[filterType];
      } else {
        if (filterType === 'verticalConfiguration') {
          const roundedValue = Number(value).toFixed(2);
          updatedFilter = currentFilter.includes(roundedValue)
            ? currentFilter.filter(item => item !== roundedValue)
            : [...currentFilter, roundedValue].sort((a, b) => parseFloat(a) - parseFloat(b));
        } else {
          updatedFilter = currentFilter.includes(value)
            ? currentFilter.filter(item => item !== value)
            : [...currentFilter, value];
        }
      }

      // Reset City filter when Country filter changes
      if (filterType === 'Country') {
        return { ...prev, [filterType]: updatedFilter, City: [] };
      }

      return { ...prev, [filterType]: updatedFilter };
    });
  };

  const filteredData = useMemo(() => {
    let sortedData = data.filter(item => 
      (filters.Country.length === 0 || filters.Country.includes(item["Country"])) &&
      (filters.City.length === 0 || filters.City.includes(item["City"])) &&
      (filters.verticalConfiguration.length === 0 || filters.verticalConfiguration.includes(Number(item["Vertical Configuration"]).toFixed(2))) &&
      (filters.windDirection.length === 0 || filters.windDirection.includes(item["Wind Direction"])) &&
      (filters.areaDensity.length === 0 || filters.areaDensity.includes(item["Area Density"])) &&
      item["Folder Name"].toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      sortedData.sort((a, b) => {
        if (a[sortConfig.key as keyof FolderItem] < b[sortConfig.key as keyof FolderItem]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof FolderItem] > b[sortConfig.key as keyof FolderItem]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortedData;
  }, [data, filters, searchTerm, sortConfig])

  const uniqueValues = useMemo(() => {
    const countriesSet = new Set(data.map(item => item["Country"]));
    const filteredData = filters.Country.length > 0
      ? data.filter(item => filters.Country.includes(item["Country"]))
      : data;

    return {
      Country: Array.from(countriesSet),
      City: Array.from(new Set(filteredData.map(item => item["City"]))),
      verticalConfiguration: Array.from(new Set(data.map(item => Number(item["Vertical Configuration"]).toFixed(2))))
        .sort((a, b) => parseFloat(a) - parseFloat(b)),
      windDirection: Array.from(new Set(data.map(item => item["Wind Direction"]))),
      areaDensity: Array.from(new Set(data.map(item => item["Area Density"])))
    };
  }, [data, filters.Country])

  const selectedItemsData = useMemo(() => {
    return data.filter(item => selectedItems.includes(item["Folder Name"]))
  }, [data, selectedItems])

  const totalSelectedSize = useMemo(() => {
    return Object.entries(selectedFiles).reduce((total, [folderName, fileNames]) => {
      const folder = data.find(item => item["Folder Name"] === folderName)
      if (folder) {
        return total + fileNames.reduce((folderTotal, fileName) => {
          const file = folder.Files.find(f => f["File Name"] === fileName)
          return folderTotal + (file ? file["Size (MB)"] : 0)
        }, 0)
      }
      return total
    }, 0).toFixed(2)
  }, [data, selectedFiles])

  const handleDownloadSelected = async () => {
    let downloadCount = 0;
    for (const [folderName, fileNames] of Object.entries(selectedFiles)) {
      const folder = data.find(item => item["Folder Name"] === folderName);
      if (folder) {
        for (const fileName of fileNames) {
          const file = folder.Files.find(f => f["File Name"] === fileName);
          if (file) {
            window.open(file["Direct Download Link"], '_blank');
            downloadCount++;
          }
        }
      }
    }
    toast({
      title: "Download Started",
      description: `Started downloading ${downloadCount} files.`,
    });
  };

  const toggleFilter = (filterType: keyof Filters) => {
    setOpenFilters(prev => ({ ...prev, [filterType]: !prev[filterType] }))
  }

  const toggleFolderExpansion = (folderName: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderName) ? prev.filter(name => name !== folderName) : [...prev, folderName]
    )
  }

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const isFileSelected = (folderName: string, fileName: string) => {
    return selectedFiles[folderName]?.includes(fileName) || false
  }

  const isFolderSelected = (folderName: string) => {
    const folder = data.find(item => item["Folder Name"] === folderName)
    return folder ? selectedFiles[folderName]?.length === folder.Files.length : false
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div className="container mx-auto pt-8">
      <h1 className="text-2xl font-bold mb-6 text-left">Realistic Urban Neighbourhoods Cases Download</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/5">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-4 pt-2">Filters</h2>
          <div className="space-y-4">
            {Object.entries(filters).map(([key, selectedValues]) => (
              <Collapsible key={key} open={openFilters[key]} onOpenChange={() => toggleFilter(key as keyof Filters)}>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${key}-filter`} className="text-base font-large">
                    {key === 'Country' ? 'Country' :
                    key === 'City' ? 'City' :
                     key === 'verticalConfiguration' ? 'Vertical Configuration' :
                     key === 'windDirection' ? 'Wind Direction' :
                     key === 'areaDensity' ? 'Area Density' : key}
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
                        <Label className='font-normal text-md' htmlFor={`${key}-${value}`}>
                          {key === 'verticalConfiguration' ? Number(value).toFixed(2) : value}
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
                  <TableHead className="font-bold w-20">
                    <Button variant="ghost" onClick={() => handleSort("Folder Name")}>
                      Folder Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-20">
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
                    <Button variant="ghost" onClick={() => handleSort("Vertical Configuration")} >
                      Vertical Config
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-25">
                    <Button variant="ghost" onClick={() => handleSort("Wind Direction")}>
                      Wind Direction
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-25">
                    <Button variant="ghost" onClick={() => handleSort("Area Density")}>
                      Area Density
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
                      <TableCell className="font-bold">
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
                      <TableCell className="text-xs">{folder["Country"]}</TableCell>
                      <TableCell className="text-xs">{folder["City"]}</TableCell>
                      <TableCell className="text-xs">
                        <div>{Number(folder["Vertical Configuration"]).toFixed(2)}</div>
                      </TableCell>
                      <TableCell>{folder["Wind Direction"]}</TableCell>
                      <TableCell>{folder["Area Density"]}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => folder.Files.forEach(file => handleDownload(file["Direct Download Link"]))}
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
                              {folder.Files.map((file) => (
                                <TableRow key={file["File Name"]}>
                                  <TableCell>
                                    <Checkbox
                                      checked={isFileSelected(folder["Folder Name"], file["File Name"])}
                                      onCheckedChange={() => handleFileCheckboxChange(folder["Folder Name"], file["File Name"])}
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
            <div className="mt-4 flex justify-between items-center p-4">
              <p className="text-md text-gray-600">
                Selected: {Object.values(selectedFiles).flat().length} files (Total size: {totalSelectedSize} MB)
              </p>
              <Button
                onClick={handleDownloadSelected}
                disabled={Object.keys(selectedFiles).length === 0}
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

