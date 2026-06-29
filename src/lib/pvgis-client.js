const CACHE_TTL_MS = 1000 * 60 * 30
const MAX_CONCURRENT_REQUESTS = 4
const MAX_RETRIES = 5

const responseCache = new Map()
const inflightRequests = new Map()
const queue = []
let activeRequests = 0

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildCacheKey(url) {
  return url.toString()
}

function getCached(key) {
  const entry = responseCache.get(key)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    responseCache.delete(key)
    return null
  }
  return entry.value
}

function setCached(key, value) {
  responseCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
}

function runQueue() {
  while (activeRequests < MAX_CONCURRENT_REQUESTS && queue.length > 0) {
    const task = queue.shift()
    if (!task) return
    activeRequests += 1
    task()
  }
}

function enqueue(task) {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const value = await task()
        resolve(value)
      } catch (error) {
        reject(error)
      } finally {
        activeRequests -= 1
        runQueue()
      }
    })
    runQueue()
  })
}

async function fetchWithRetry(url, attempt = 0) {
  const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })

  if ((response.status === 429 || response.status === 529) && attempt < MAX_RETRIES) {
    const backoffMs = 200 * 2 ** attempt + Math.round(Math.random() * 120)
    await wait(backoffMs)
    return fetchWithRetry(url, attempt + 1)
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`PVGIS error ${response.status}: ${body || response.statusText}`)
  }

  return response.json()
}

export async function pvgisGet({ version = 'v5_3', tool, params = {} }) {
  if (!tool) throw new Error('PVGIS: tool es obligatorio')
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...params, outputformat: 'json' })) {
    if (value === undefined || value === null || value === '') continue
    query.set(key, String(value))
  }

  const baseUrl = import.meta.env.PROD
    ? 'https://re.jrc.ec.europa.eu/api'
    : `/api/pvgis`

  const url = new URL(`${baseUrl}/${version}/${tool}?${query.toString()}`, window.location.origin)
  const cacheKey = buildCacheKey(url)

  const cached = getCached(cacheKey)
  if (cached) return cached

  const inflight = inflightRequests.get(cacheKey)
  if (inflight) return inflight

  const request = enqueue(async () => {
    const data = await fetchWithRetry(url.toString())
    setCached(cacheKey, data)
    return data
  })

  inflightRequests.set(cacheKey, request)
  try {
    return await request
  } finally {
    inflightRequests.delete(cacheKey)
  }
}

