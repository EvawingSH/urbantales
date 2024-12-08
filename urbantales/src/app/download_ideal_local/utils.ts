import { useState, useMemo, useCallback } from 'react'
import { toast } from "@/components/ui/use-toast"

export interface DataItem {
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

export interface Filters {
  alignment: string
  height: string
  windDirection: string
  density: string
}

export interface UniqueValues {
  alignment: string[]
  height: string[]
  windDirection: string[]
  density: string[]
}

export function useDataFiltering(data: DataItem[]) {
  const [filters, setFilters] = useState<Filters>({
    alignment: 'all',
    height: 'all',
    windDirection: 'all',
    density: 'all'
  })
  const [searchTerm, setSearchTerm] = useState('')

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (filters.alignment === 'all' || item.Alignment === filters.alignment) &&
      (filters.height === 'all' || item.Height === filters.height) &&
      (filters.windDirection === 'all' || item["Wind direction"] === filters.windDirection) &&
      (filters.density === 'all' || item.Density === filters.density) &&
      item.Name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, filters, searchTerm])

  const uniqueValues: UniqueValues = useMemo(() => ({
    alignment: Array.from(new Set(data.map(item => item.Alignment))),
    height: Array.from(new Set(data.map(item => item.Height))),
    windDirection: Array.from(new Set(data.map(item => item["Wind direction"]))),
    density: Array.from(new Set(data.map(item => item.Density)))
  }), [data])

  return {
    filters,
    searchTerm,
    setSearchTerm,
    handleFilterChange,
    filteredData,
    uniqueValues
  }
}

export function useDataSelection(filteredData: DataItem[]) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const handleCheckboxChange = useCallback((name: string) => {
    setSelectedItems(prev => 
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    )
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredData.map(item => item.Name))
    } else {
      setSelectedItems([])
    }
  }, [filteredData])

  return {
    selectedItems,
    handleCheckboxChange,
    handleSelectAll
  }
}

export function useDownload(data: DataItem[], selectedItems: string[]) {
  const handleDownload = useCallback((url: string) => {
    window.open(url, '_blank')
  }, [])

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

  const handleDownloadSelected = useCallback(async () => {
    let successCount = 0;
    let failCount = 0;

    const selectedItemsData = data.filter(item => selectedItems.includes(item.Name))

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
  }, [data, selectedItems])

  const totalSelectedSize = useMemo(() => {
    const selectedItemsData = data.filter(item => selectedItems.includes(item.Name))
    return selectedItemsData.reduce((total, item) => total + parseFloat(item["Size (MB)"]), 0).toFixed(2)
  }, [data, selectedItems])

  return {
    handleDownload,
    handleDownloadSelected,
    totalSelectedSize
  }
}