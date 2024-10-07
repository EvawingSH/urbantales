'use client'

import { useState, useEffect } from 'react'
import { Folder, File, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface S3Contents {
  folders: string[];
  files: string[];
  prefix: string;
  isTruncated: boolean;
  nextContinuationToken?: string;
}

export default function Page() {
  const [contents, setContents] = useState<S3Contents | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPrefix, setCurrentPrefix] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchS3Contents = async (prefix: string, continuationToken?: string) => {
    setIsLoading(true);
    try {
      let url = `/api/s3-contents?prefix=${encodeURIComponent(prefix)}`;
      if (continuationToken) {
        url += `&continuationToken=${encodeURIComponent(continuationToken)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch S3 contents');
      }
      const data = await response.json();
      console.log('Received data:', data);
      setContents(data);
      setCurrentPrefix(data.prefix);
    } catch (err) {
      setError('Error fetching S3 contents');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchS3Contents('');
  }, []);

  const handleFolderClick = (folder: string) => {
    fetchS3Contents(folder);
  };

  const handleBackClick = () => {
    const newPrefix = currentPrefix.split('/').slice(0, -2).join('/') + '/';
    fetchS3Contents(newPrefix);
  };

  const handleLoadMore = () => {
    if (contents?.nextContinuationToken) {
      fetchS3Contents(currentPrefix, contents.nextContinuationToken);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading && !contents) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">S3 Bucket Contents</h2>
      {currentPrefix && (
        <Button onClick={handleBackClick} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      )}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Current Path: {currentPrefix || '/'}</h3>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Folders</h3>
          {contents?.folders.length ? (
            <ul className="space-y-2">
              {contents.folders.map((folder, index) => (
                <li key={index} className="flex items-center">
                  <Button variant="ghost" onClick={() => handleFolderClick(folder)}>
                    <Folder className="mr-2 text-blue-500" />
                    {folder.split('/').slice(-2)[0]}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No folders found</p>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Files</h3>
          {contents?.files.length ? (
            <ul className="space-y-2">
              {contents.files.map((file, index) => (
                <li key={index} className="flex items-center">
                  <File className="mr-2 text-green-500" />
                  {file.split('/').pop()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No files found</p>
          )}
        </div>
        {contents?.isTruncated && (
          <Button onClick={handleLoadMore} className="mt-4">
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}