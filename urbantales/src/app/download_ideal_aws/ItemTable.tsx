import React from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { S3ContentsRenderer } from "./S3ContentsRenderer"
import { Item } from "./types" // Adjust the path as necessary

interface ItemTableProps {
  filteredItems: Item[]
  totalItems: number
  selectedItems: number[]
  selectedFiles: Set<string>
  expandedItems: number[]
  handleItemSelect: (id: number) => void
  handleFileSelect: (fileName: string, itemId: number, forceSelect?: boolean) => void;
  toggleItemExpansion: (id: number) => void
  handleSelectAll: () => void
  allSelected: boolean
}


export function ItemTable({
  filteredItems,
  totalItems,
  selectedItems,
  selectedFiles,
  expandedItems,
  handleItemSelect,
  handleFileSelect,
  toggleItemExpansion
}: ItemTableProps) {
  return (
    <div className="bg-background rounded-md shadow-md p-4 overflow-x-auto">
      <p className="text-lg font-semibold text-muted-foreground mb-4">
        Selecting {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} out of {totalItems} total models.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
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
                    <span>{item.name}</span>
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
                      <S3ContentsRenderer
                        s3Contents={item.s3Contents}
                        itemId={item.id}
                        selectedFiles={selectedFiles}
                        handleFileSelect={handleFileSelect}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}