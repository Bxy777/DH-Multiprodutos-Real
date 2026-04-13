import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'

const STORE_NAME = 'dh-images'

export default async (req: Request, context: { params: { key: string } }) => {
  const { key } = context.params

  const store = getStore(STORE_NAME)
  const result = await store.getWithMetadata(key, { type: 'arrayBuffer' })

  if (!result) {
    return new Response('Not found', { status: 404 })
  }

  const contentType = result.metadata?.contentType ?? 'image/png'

  return new Response(result.data as ArrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export const config: Config = {
  path: '/api/images/:key',
  method: ['GET'],
}
