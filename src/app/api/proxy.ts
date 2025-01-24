import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = req.query.url as string

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' })
  }

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    const contentDisposition = response.headers.get('content-disposition')

    res.setHeader('Content-Type', contentType || 'application/octet-stream')
    if (contentDisposition) {
      res.setHeader('Content-Disposition', contentDisposition)
    }

    const data = await response.arrayBuffer()
    res.send(Buffer.from(data))
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch the resource' })
  }
}
