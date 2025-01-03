import { NextResponse } from 'next/server'

const ACCOUNT_NAME = process.env.ACCOUNT_NAME
const PASSWORD = process.env.PASSWORD
const HTTP_ADDRESS = process.env.HTTP_ADDRESS

export async function GET() {
  if (!ACCOUNT_NAME || !PASSWORD || !HTTP_ADDRESS) {
    return NextResponse.json({ error: 'Server configuration is incomplete' }, { status: 500 })
  }

  try {
    const response = await fetch(HTTP_ADDRESS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountName: ACCOUNT_NAME, password: PASSWORD }),
    })

    if (!response.ok) {
      throw new Error('Failed to retrieve file name')
    }

    const data = await response.json()
    return NextResponse.json({ fileName: data.fileName })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to retrieve file name' }, { status: 500 })
  }
}