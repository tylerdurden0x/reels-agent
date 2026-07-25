/**
 * Thin wrapper around the Pexels Video API.
 * Keeps fetch logic, headers, and error normalization in one place.
 */

const PEXELS_BASE_URL = 'https://api.pexels.com/videos/search'
const PER_PAGE = 30

export class PexelsApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'PexelsApiError'
    this.status = status
  }
}

/**
 * Fetch a page of portrait videos for a given search query.
 * @param {string} query - search terms, e.g. "funny comedy humor"
 * @param {number} page - 1-indexed page number
 * @param {AbortSignal} [signal] - optional abort signal for cleanup
 * @returns {Promise<{videos: object[], nextPage: number|null, totalResults: number}>}
 */
export async function fetchVideos(query, page = 1, signal) {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY

  if (!apiKey) {
    throw new PexelsApiError(
      'Missing Pexels API key. Add VITE_PEXELS_API_KEY to your .env file.',
      401
    )
  }

  const url = `${PEXELS_BASE_URL}?query=${encodeURIComponent(
    query
  )}&per_page=${PER_PAGE}&orientation=portrait&page=${page}`

  let response
  try {
    response = await fetch(url, {
      headers: { Authorization: apiKey },
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new PexelsApiError('Network error — check your connection.', 0)
  }

  if (response.status === 429) {
    throw new PexelsApiError(
      "You've hit the Pexels rate limit. Try again in a minute.",
      429
    )
  }

  if (response.status === 401 || response.status === 403) {
    throw new PexelsApiError(
      'Invalid Pexels API key. Double-check VITE_PEXELS_API_KEY.',
      response.status
    )
  }

  if (!response.ok) {
    throw new PexelsApiError(
      `Pexels request failed (${response.status}).`,
      response.status
    )
  }

  const data = await response.json()

  const videos = (data.videos || []).map(normalizeVideo).filter(Boolean)
  const hasNextPage = Boolean(data.next_page) && videos.length > 0

  return {
    videos,
    nextPage: hasNextPage ? page + 1 : null,
    totalResults: data.total_results || 0,
  }
}

/**
 * Pick the best-quality vertical video file and normalize the
 * shape we actually use in the UI, so components don't need to
 * know anything about Pexels' raw response format.
 */
function normalizeVideo(raw) {
  if (!raw || !Array.isArray(raw.video_files) || raw.video_files.length === 0) {
    return null
  }

  // Prefer HD portrait files, fall back to whatever is available.
  const files = [...raw.video_files].sort((a, b) => {
    const score = (f) => {
      if (f.quality === 'hd' && f.width < f.height) return 3
      if (f.quality === 'hd') return 2
      if (f.width < f.height) return 1
      return 0
    }
    return score(b) - score(a)
  })

  const bestFile = files[0]

  return {
    id: raw.id,
    src: bestFile.link,
    width: bestFile.width,
    height: bestFile.height,
    duration: raw.duration,
    image: raw.image,
    photographer: raw.user?.name || 'Unknown',
    photographerUrl: raw.user?.url || '#',
    pexelsUrl: raw.url,
  }
}
