'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Scatter } from 'react-chartjs-2'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)

// Define the structure of our data
interface DataPoint {
  NameE: string
  Config: string
  TKE: number
  U: number
}

// Define color mapping for Config types
const colorMap: { [key: string]: string } = {
  'idealized-uniform': 'rgb(255, 0, 0)',
  'idealized-CL': 'rgb(0, 255, 0)',
  'idealized-HR': 'rgb(0, 0, 255)',
  'idealized-SM': 'rgb(255, 255, 0)',
}

const ScatterPlotComponent: React.FC = () => {
  const [rawData, setRawData] = useState<DataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configOptions, setConfigOptions] = useState<string[]>([])
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>([])

  useEffect(() => {
    fetch('/idealized_vis.json')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          setRawData(data.data)
          const options = Array.from(new Set(data.data.map((item: DataPoint) => item.Config)))
          setConfigOptions(options as string[])
          setSelectedConfigs(options as string[])
        } else {
          throw new Error('Data is not in the expected format')
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again later.')
        setIsLoading(false)
      })
  }, [])

  const handleConfigChange = (value: string) => {
    setSelectedConfigs(prev => {
      if (prev.includes(value)) {
        return prev.filter(config => config !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  const filteredData = useMemo(() => {
    return rawData.filter(item => selectedConfigs.includes(item.Config))
  }, [selectedConfigs, rawData])

  const chartData = {
    datasets: selectedConfigs.map(config => ({
      label: config,
      data: filteredData
        .filter(item => item.Config === config)
        .map(item => ({ x: item.TKE, y: item.U })),
      backgroundColor: colorMap[config] || 'rgb(0, 0, 0)', // Fallback color
    })),
  }

  const options: ChartOptions<'scatter'> = {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'TKE',
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'U',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataPoint = filteredData[context.dataIndex]
            return dataPoint ? `${dataPoint.NameE}: (TKE: ${dataPoint.TKE.toFixed(2)}, U: ${dataPoint.U.toFixed(2)})` : ''
          },
        },
      },
    },
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="w-full h-screen flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">TKE vs U Scatter Plot</h1>
      <div className="mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-between">
              {selectedConfigs.length > 0
                ? `${selectedConfigs.length} selected`
                : "Select configurations"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[280px]">
            <DropdownMenuLabel>Configurations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {configOptions.map((config) => (
              <DropdownMenuCheckboxItem
                key={config}
                checked={selectedConfigs.includes(config)}
                onCheckedChange={() => handleConfigChange(config)}
              >
                {config}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full h-[calc(100vh-200px)]">
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  )
}

export default ScatterPlotComponent