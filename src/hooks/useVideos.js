import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchVideos, PexelsApiError } from '../utils/api'

// Module-level cache so switching back to a category you already
// visited this session is instant — no re-fetch, no loading flash.
const sessionCache = new Map()

/**
 * Fetches (and paginates) a video feed for a given search query.
 * @param {string} query
 * @returns {{
 *   videos: object[],
 *   loading: boolean,
 *   error: string|null,
 *   refetch: () => void,
 *   loadMore: () => void,
 *   hasMore: boolean,
 *   loadingMore: boolean,
 * }}
 */
export function useVideos(query) {
  const cached = sessionCache.get(query)
  const [videos, setVideos] = useState(cached?.videos || [])
  const [page, setPage] = useState(cached?.nextPage || 1)
  const [hasMore, setHasMore] = useState(cached ? cached.nextPage !== null : true)
  const [loading, setLoading] = useState(!cached)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const load = useCallback(
    async ({ append = false, retryPage = 1 } = {}) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      append ? setLoadingMore(true) : setLoading(true)
      setError(null)

      try {
        const result = await fetchVideos(query, retryPage, controller.signal)

        setVideos((prev) => {
          const next = append ? [...prev, ...result.videos] : result.videos
          sessionCache.set(query, { videos: next, nextPage: result.nextPage })
          return next
        })
        setPage(result.nextPage || retryPage)
        setHasMore(result.nextPage !== null)
      } catch (err) {
        if (err.name === 'AbortError') return
        const message =
          err instanceof PexelsApiError
            ? err.message
            : 'Something went wrong loading videos.'
        setError(message)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [query]
  )

  useEffect(() => {
    const existing = sessionCache.get(query)
    if (existing) {
      // Already have this query cached — just sync state, no fetch.
      setVideos(existing.videos)
      setPage(existing.nextPage || 1)
      setHasMore(existing.nextPage !== null)
      setLoading(false)
      setError(null)
      return
    }

    load({ append: false, retryPage: 1 })

    return () => abortRef.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const refetch = useCallback(() => {
    sessionCache.delete(query)
    load({ append: false, retryPage: 1 })
  }, [query, load])

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    load({ append: true, retryPage: page })
  }, [loading, loadingMore, hasMore, page, load])

  return { videos, loading, loadingMore, error, refetch, loadMore, hasMore }
}
