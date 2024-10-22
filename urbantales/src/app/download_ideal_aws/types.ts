import { S3Folder } from "@/utils/s3Utils"

export interface Item {
  id: number
  name: string
  folder: string
  description: string
  alignment: string
  height: string
  density: string
  windDirection: string
  s3Contents: S3Folder | null
}

export interface Filters {
  alignment: string[]
  height: string[]
  density: string[]
  windDirection: string[]
}