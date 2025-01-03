import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.MY_S3_BUCKET_NAME;
const fileName = 'RealisticModelmeta.json';

async function getMetadata() {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  const response = await s3Client.send(command);
  const str = await response.Body?.transformToString();
  
  if (!str) {
    throw new Error('Failed to read file contents');
  }

  return JSON.parse(str);
}

async function updateMetadata(newMetadata: Record<string, unknown>) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: JSON.stringify(newMetadata),
    ContentType: 'application/json',
  });

  await s3Client.send(command);
}

export async function GET() {
  if (!bucketName) {
    return NextResponse.json({ error: 'S3 bucket name is not configured' }, { status: 500 });
  }

  try {
    const metadata = await getMetadata();
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!bucketName) {
    return NextResponse.json({ error: 'S3 bucket name is not configured' }, { status: 500 });
  }

  try {
    const newItem = await request.json();
    const metadata = await getMetadata();
    metadata.push(newItem);
    await updateMetadata(metadata);
    return NextResponse.json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('Error adding item:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!bucketName) {
    return NextResponse.json({ error: 'S3 bucket name is not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
  }

  try {
    const metadata = await getMetadata();
    const updatedMetadata = metadata.filter((item: Record<string, unknown>) => item.Name !== name);
    await updateMetadata(updatedMetadata);
    return NextResponse.json({ message: `Item '${name}' deleted successfully` });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}