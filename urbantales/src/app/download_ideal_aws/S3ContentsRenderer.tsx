import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Download, Folder } from "lucide-react"
import { S3Folder, S3Object } from "@/utils/s3Utils"

interface S3ContentsRendererProps {
  s3Contents: S3Folder | null
  itemId: number
  selectedFiles: Set<string>
  handleFileSelect: (fileName: string, itemId: number) => void
}

export function S3ContentsRenderer({
  s3Contents,
  itemId,
  selectedFiles,
  handleFileSelect
}: S3ContentsRendererProps) {
  if (!s3Contents) {
    return <p className="text-sm text-muted-foreground">No files available for this item.</p>
  }

  const handleSingleFileDownload = async (file: S3Object) => {
    // Implement single file download logic here
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const renderContents = (folder: S3Folder) => (
    <div className="pl-4">
      {folder.files.map((file, index) => (
        <div key={index} className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Checkbox
              checked={selectedFiles.has(file.name)}
              onCheckedChange={() => handleFileSelect(file.name, itemId)}
              aria-label={`Select ${file.name}`}
            />
            <span className="ml-2">{file.name} ({formatFileSize(file.size)})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSingleFileDownload(file)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {folder.subfolders.map((subfolder, index) => (
        <div key={index} className="mt-2">
          <Accordion type="single" collapsible>
            <AccordionItem value={subfolder.name}>
              <AccordionTrigger className="text-sm">
                <Folder className="h-4 w-4 mr-2"   />
                {subfolder.name}
              </AccordionTrigger>
              <AccordionContent>
                {renderContents(subfolder)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  )

  return renderContents(s3Contents)
}