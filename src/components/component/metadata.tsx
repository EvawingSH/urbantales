"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface FileData {
  fileName: string
  description: string
  downloadUrl: string
}

const metadataFiles: FileData[] = [
  {
    fileName: "Flow Data",
    description: "Flow characteristics for each case, including canopy-averaged, aerodynamic, and sampled statistics.",
    downloadUrl:
      "https://urbantales.020495.xyz/index.php/s/G8f5nXYMbW9f48A/download",
  },
  {
    fileName: "Metadata",
    description:
      "Metadata such as urban geometrical parameters, the position of the neighborhoods, and other configurations as describled in Nazarian et al., (2025).",
    downloadUrl:
      "https://urbantales.020495.xyz/index.php/s/9SrPX94gfxkc6rZ/download",
  },
    {
    fileName: "Readme",
    description:
      "Readme file with details on how to read the data and metadata files.",
    downloadUrl:
      "https://urbantales.020495.xyz/index.php/s/xwFGLBGB9gHaBN9/download",
  }
]

const FileTable: React.FC<{ files: FileData[] }> = ({ files }) => {
  const handleDownload = (downloadUrl: string) => {
    window.open(downloadUrl, "_blank")
  }

  return (
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead className="w-[200px]">File Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right w-[120px]">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.fileName}>
            <TableCell className="font-medium">{file.fileName}</TableCell>
            <TableCell>{file.description}</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" onClick={() => handleDownload(file.downloadUrl)}>
                <Download className="mr-2 h-4 w-4"/>
            </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function MetadataFilesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="bg-white rounded-md shadow-lg p-6">
        <h1 className="text-lg font-bold mb-6">Metadata Files</h1>
        <FileTable files={metadataFiles} />
      </div>
    </div>
  )
}

