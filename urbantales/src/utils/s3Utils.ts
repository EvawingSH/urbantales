import { toast } from "@/components/ui/use-toast"

export interface S3Object {
  name: string;
  size: number;
  url: string;
}

export interface S3Folder {
  name: string;
  files: S3Object[];
  subfolders: S3Folder[];
}

export const findFolder = (folder: S3Folder, targetPath: string): S3Folder | null => {
  if (folder.name === targetPath) {
    return folder;
  }
  for (const subfolder of folder.subfolders) {
    const found = findFolder(subfolder, targetPath);
    if (found) {
      return found;
    }
  }
  return null;
};

export const fetchS3Contents = async (): Promise<S3Folder> => {
  console.log("Fetching S3 contents...");
  try {
    const response = await fetch('/api/s3-contents');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch S3 contents');
    }
    const data: S3Folder = await response.json();
    console.log("S3 contents data:", data);
    return data;
  } catch (error) {
    console.error('Error fetching S3 contents:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to fetch S3 contents. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};