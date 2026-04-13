import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'

const STORE_NAME = 'dh-images'

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) {
    return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']
  if (!allowed.includes(ext)) {
    return Response.json({ error: 'File type not allowed' }, { status: 400 })
  }

  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const store = getStore({ name: STORE_NAME, consistency: 'strong' })
  const buffer = await file.arrayBuffer()

  await store.set(key, buffer, {
    metadata: { contentType: file.type || `image/${ext}` },
  })

  return Response.json({ url: `/api/images/${key}` })
}

export const config: Config = {
  path: '/api/images/upload',
  method: ['POST'],
}
