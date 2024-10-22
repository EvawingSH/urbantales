import React from "react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Filters } from "./types"

interface FilterSectionProps {
  filters: Filters
  handleFilterChange: (type: keyof Filters, value: string) => void
}

const filterOptions = {
  alignment: ["All", "Staggered", "Aligned"],
  height: ["All", "Variable", "Uniform"],
  density: ["All", "Sparse", "Medium", "Dense"],
  windDirection: ["All", "Sparse", "Medium", "Dense"],
}

export function FilterSection({ filters, handleFilterChange }: FilterSectionProps) {
  const renderCheckboxes = (type: keyof Filters, options: string[]) => {
    return options.map((option) => (
      <Label key={option} className="flex items-center gap-2 font-normal">
        <Checkbox
          checked={filters[type].includes(option)}
          onCheckedChange={() => handleFilterChange(type, option)}
          aria-label={`Filter by ${option}`}
        />
        {option}
      </Label>
    ))
  }

  return (
    <div className="bg-background rounded-md shadow-md p-4">
      <h2 className="text-lg font-bold mb-4">Filters</h2>
      <Accordion type="single" collapsible className="w-full">
        {(Object.keys(filterOptions) as Array<keyof typeof filterOptions>).map((filterType) => (
          <AccordionItem key={filterType} value={filterType}>
            <AccordionTrigger className="text-base font-medium">{filterType}</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2">
                {renderCheckboxes(filterType, filterOptions[filterType])}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}