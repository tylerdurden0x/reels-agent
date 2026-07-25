import { useRef, useEffect, useCallback } from 'react'
import VideoCard from './VideoCard'
import LoadingSpinner from './LoadingSpinner'
import { useVideos } from '../hooks/useVideos'
import { useCategory } from '../context/CategoryContext'

export default function VideoFeed() {
  const { category } = useCategory()
  const { videos, loading, loadingMore, error, refetch, loadMore, hasMore } = useVideos(
    category.query
  )

  const scrollRef = useRef(null)
  const sentinelRef = useRef(null)

  // Reset scroll to top whenever the category (and thus query) changes.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' })
  }, [category.id])

  // Infinite scroll: watch a sentinel just past the last card.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { root: scrollRef.current, rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, videos.length])

  // Keyboard navigation: arrow keys scroll one card at a time.
  const handleKeyDown = useCallback((e) => {
    const container = scrollRef.current
    if (!container) return
    const cardHeight = container.clientHeight

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault()
      container.scrollBy({ top: cardHeight, behavior: 'smooth' })
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault()
      container.scrollBy({ top: -cardHeight, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (loading) {
    return <LoadingSpinner categoryLabel={category.label} />
  }

  if (error) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-black px-8 text-center">
        <p className="text-5xl">⚠️</p>
        <p className="max-w-xs text-sm text-white/80">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-transform active:scale-95"
        >
          Try again
        </button>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-black px-8 text-center">
        <p className="text-5xl">📭</p>
        <p className="text-sm text-white/70">No videos found for {category.label}.</p>
      </div>
    )
  }

  return (
    <div
      key={category.id}
      ref={scrollRef}
      className="hide-scrollbar h-dvh w-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain animate-fade-in"
      tabIndex={-1}
    >
      {videos.map((video, i) => (
        <VideoCard key={video.id} video={video} category={category} index={i} />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={sentinelRef} className="h-1 w-full" />

      {loadingMore && (
        <div className="flex h-24 w-full items-center justify-center bg-black">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {!hasMore && !loadingMore && (
        <div className="flex h-dvh w-full items-center justify-center bg-black px-8 text-center">
          <p className="text-sm text-white/50">
            You&rsquo;ve reached the end of {category.label}. Switch categories to keep going.
          </p>
        </div>
      )}
    </div>
  )
}
