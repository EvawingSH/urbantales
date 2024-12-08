import { toast } from "@/components/ui/use-toast"

export interface Metadata {
  Name: string;
  Config: string;
  "Wind direction": string;
  Alignment: string;
  "Folder Name": string;
  "Direct Download Link": string;
  "Size (MB)": string;
  Density: string;
  Height: string;
}

export const fetchMetadata = async (): Promise<Metadata[]> => {
  try {
    const response = await fetch('/api/metadata');
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    const data: Metadata[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    toast({
      title: "Error",
      description: "Failed to fetch metadata. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};