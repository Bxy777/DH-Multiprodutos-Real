import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'

const STORE_NAME = 'dh-catalog'
const CATALOG_KEY = 'products'

export default async (req: Request) => {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' })

  if (req.method === 'GET') {
    const data = await store.get(CATALOG_KEY, { type: 'json' })
    return Response.json(data ?? null)
  }

  if (req.method === 'PUT') {
    const body = await req.json()
    await store.setJSON(CATALOG_KEY, body)
    return Response.json({ ok: true })
  }

  return new Response('Method not allowed', { status: 405 })
}

export const config: Config = {
  path: '/api/catalog',
  method: ['GET', 'PUT'],
}
