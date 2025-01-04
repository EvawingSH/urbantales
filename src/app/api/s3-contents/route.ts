import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || '',
  },
});

interface S3Object {
  name: string;
  size: number;
  url: string;
}

interface S3Folder {
  name: string;
  files: S3Object[];
  subfolders: S3Folder[];
}

async function listFolderContents(bucketName: string, prefix: string): Promise<S3Folder> {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
    Delimiter: '/',
  });

  const response = await s3Client.send(command);
  
  const files: S3Object[] = (await Promise.all((response.Contents || [])
    .filter(content => content.Key !== prefix) // Exclude the folder itself
    .map(async (content) => {
      if (content.Key && content.Size) {
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: content.Key,
        });
        const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 });
        return {
          name: content.Key.slice(prefix.length),
          size: content.Size,
          url: url,
        };
      }
      return null;
    }))).filter((file): file is S3Object => file !== null);

  const subfolders: S3Folder[] = (await Promise.all((response.CommonPrefixes || [])
    .map(async (commonPrefix) => {
      if (commonPrefix.Prefix) {
        return await listFolderContents(bucketName, commonPrefix.Prefix);
      }
      return null;
    }))).filter((folder): folder is S3Folder => folder !== null);

  return {
    name: prefix,
    files: files.filter((file): file is S3Object => file !== null),
    subfolders: subfolders.filter((folder): folder is S3Folder => folder !== null),
  };
}

export async function GET(request: Request) {
  console.log("S3 contents API route called");

  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get('prefix') || '';

  console.log("Prefix:", prefix);

  const bucketName = process.env.MY_S3_BUCKET_NAME;
  if (!bucketName) {
    console.error('S3_BUCKET_NAME is not set in the environment variables');
    return NextResponse.json({ error: 'S3 bucket name is not configured' }, { status: 500 });
  }

  try {
    console.log("Listing objects in bucket:", bucketName);
    const folderContents = await listFolderContents(bucketName, prefix);
    console.log("Folder contents:", JSON.stringify(folderContents, null, 2));

    return NextResponse.json(folderContents);
  } catch (error) {
    console.error('Error fetching S3 contents:', error);
    return NextResponse.json({ error: 'Failed to fetch S3 contents' }, { status: 500 });
  }
}