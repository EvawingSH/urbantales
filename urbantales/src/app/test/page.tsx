'use client'

import * as React from "react"
import { Download, Loader2 } from 'lucide-react'
import JSZip from 'jszip'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface FileData {
  name: string
  url: string
}

const files: FileData[] = [
  {
    name: "CH-BAS-V1_d00_ped.nc",
    url: "http://140.238.197.250:6002/index.php/s/ga5pHcNCc64dRpj/download",
  },
  {
    name: "CH-BAS-V1_d00_ts.nc",
    url: "http://140.238.197.250:6002/index.php/s/XDgrTSikZ6KY9As/download",
  },
]

export default function FileDownloader() {
  const [selectedFiles, setSelectedFiles] = React.useState<string[]>([])
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [downloadingFile, setDownloadingFile] = React.useState<string | null>(null)

  const handleCheckboxChange = (fileName: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileName)
        ? prev.filter((name) => name !== fileName)
        : [...prev, fileName]
    )
  }

  const handleDownload = (url: string) => {
    window.open(url, '_blank')
  }

  const handleSingleDownload = async (file: FileData) => {
    setDownloadingFile(file.name)
    try {
      handleDownload(file.url)
      toast({
        title: "Download Initiated",
        description: `Download for ${file.name} has been initiated in a new tab.`,
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: "Download Failed",
        description: `Failed to initiate download for ${file.name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setDownloadingFile(null)
    }
  }

  const handleMultipleDownloads = async () => {
    if (selectedFiles.length === 0) return

    setIsDownloading(true)
    try {
      if (selectedFiles.length === 1) {
        const file = files.find((f) => f.name === selectedFiles[0])!
        handleDownload(file.url)
        toast({
          title: "Download Initiated",
          description: `Download for ${file.name} has been initiated in a new tab.`,
        })
      } else {
        const zip = new JSZip()
        const fetchPromises = selectedFiles.map(async (fileName) => {
          const file = files.find((f) => f.name === fileName)!
          const response = await fetch(file.url)
          const blob = await response.blob()
          zip.file(file.name, blob)
        })

        await Promise.all(fetchPromises)
        const content = await zip.generateAsync({ type: "blob" })
        const url = URL.createObjectURL(content)
        const link = document.createElement('a')
        link.href = url
        link.download = "selected_files.zip"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: "Download Initiated",
          description: "Selected files have been zipped and download has been initiated.",
        })
      }
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: "Download Failed",
        description: "Failed to initiate downloads for selected files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Select</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Direct Download Link</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.name}>
              <TableCell>
                <Checkbox
                  checked={selectedFiles.includes(file.name)}
                  onCheckedChange={() => handleCheckboxChange(file.name)}
                />
              </TableCell>
              <TableCell>{file.name}</TableCell>
              <TableCell className="font-mono text-sm">{file.url}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSingleDownload(file)}
                  disabled={downloadingFile === file.name}
                >
                  {downloadingFile === file.name ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Button
          onClick={handleMultipleDownloads}
          disabled={selectedFiles.length === 0 || isDownloading}
        >
          {isDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Download {selectedFiles.length > 1 ? "Selected Files (ZIP)" : "Selected File"}
        </Button>
      </div>
    </div>
  )
}

