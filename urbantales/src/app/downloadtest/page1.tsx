'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  interface Folder {
    folderName: string;
    files: { key: string; size: number }[];
  }

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch folders and files from the backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/files');
        console.log(response.data); // Log the response data for debugging
        setFolders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching files:', error);
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  // Convert bytes to a more human-readable size (e.g., KB, MB)
  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  };

  // Handle file download
  const downloadFile = async (filename:String) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/files/download/${filename}`);
      // console.log(response)
      const { url } = response.data;
      window.location.href = url;  // Redirect to the presigned URL to start the download
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  


  if (loading) return <p>Loading folders and files...</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Files from S3</h1>
      {folders.length === 0 ? (
        <p>No folders found.</p>
      ) : (
        <div>
          {folders.map(folder => (
            <div key={folder.folderName} className="mb-6">
              <h2 className="text-2xl font-semibold">{folder.folderName.replace('/', '')}</h2>
              <ul className="list-disc ml-6">
                {folder.files.length === 0 ? (
                  <p>No files in this folder.</p>
                ) : (
                  folder.files.map(file => (
                    <li key={file.key} className="mb-2">
                      <p>
                        {file.key.replace(folder.folderName, '')} ({formatSize(file.size)})
                      </p>
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => downloadFile(file.key)}
                      >
                        Download
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
