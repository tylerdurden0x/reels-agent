import { useRef, useState, useEffect, useCallback } from 'react'

const DOUBLE_TAP_WINDOW_MS = 300

/**
 * A single full-viewport video slide. Plays only when >50% visible
 * (via IntersectionObserver), supports tap-to-like, double-tap-to-like
 * with a heart burst at the tap point, and native share / clipboard fallback.
 */
export default function VideoCard({ video, category, index }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const lastTapRef = useRef(0)

  const [isVisible, setIsVisible] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [hearts, setHearts] = useState([]) // floating heart burst animations
  const [shareStatus, setShareStatus] = useState('idle') // idle | copied

  // Play/pause based on visibility.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5)
      },
      { threshold: [0, 0.5, 1] }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    if (isVisible) {
      vid.play().catch(() => {
        // Autoplay can be blocked before user interaction — that's fine,
        // it'll play once the user has interacted with the page at all.
      })
    } else {
      vid.pause()
    }
  }, [isVisible])

  const spawnHeart = useCallback((x, y) => {
    const id = Date.now() + Math.random()
    setHearts((prev) => [...prev, { id, x, y }])
    window.setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id))
    }, 800)
  }, [])

  const handleTap = useCallback(
    (e) => {
      const now = Date.now()
      const rect = containerRef.current.getBoundingClientRect()
      const point = e.changedTouches?.[0] || e
      const x = point.clientX - rect.left
      const y = point.clientY - rect.top

      if (now - lastTapRef.current < DOUBLE_TAP_WINDOW_MS) {
        setIsLiked(true)
        spawnHeart(x, y)
        lastTapRef.current = 0
      } else {
        lastTapRef.current = now
      }
    },
    [spawnHeart]
  )

  const toggleLike = () => setIsLiked((prev) => !prev)

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
    if (videoRef.current) videoRef.current.muted = !isMuted
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Reels Agent',
      text: `Check out this ${category?.label || ''} video`,
      url: video.pexelsUrl,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(video.pexelsUrl)
        setShareStatus('copied')
        window.setTimeout(() => setShareStatus('idle'), 1500)
      }
    } catch {
      // User cancelled the share sheet — no-op.
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative h-dvh w-full snap-start snap-always overflow-hidden bg-black"
      onClick={handleTap}
      onTouchEnd={handleTap}
      data-index={index}
    >
      <video
        ref={videoRef}
        src={video.src}
        poster={video.image}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradient scrims for legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Category badge, top-left */}
      {category && (
        <div
          className="absolute left-4 top-6 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
          style={{ boxShadow: `0 0 0 1px ${category.color}33` }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          {category.label}
        </div>
      )}

      {/* Mute toggle, top-right */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          toggleMute()
        }}
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        className="absolute right-4 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md"
      >
        {isMuted ? <MuteIcon /> : <SoundIcon />}
      </button>

      {/* Photographer credit, bottom-left */}
      <div className="absolute bottom-6 left-4 right-20 text-white">
        <a
          href={video.photographerUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-medium drop-shadow-md"
        >
          @{video.photographer}
        </a>
        <p className="mt-0.5 text-xs text-white/70">via Pexels</p>
      </div>

      {/* Action rail, bottom-right */}
      <div className="absolute bottom-6 right-4 flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleLike()
          }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          aria-pressed={isLiked}
          className="flex flex-col items-center gap-1 text-white transition-transform active:scale-90"
        >
          <HeartIcon filled={isLiked} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleShare()
          }}
          aria-label="Share video"
          className="flex flex-col items-center gap-1 text-white transition-transform active:scale-90"
        >
          <ShareIcon />
          {shareStatus === 'copied' && (
            <span className="absolute -left-16 top-0 whitespace-nowrap rounded bg-white px-2 py-1 text-[10px] font-semibold text-black">
              Link copied
            </span>
          )}
        </button>
      </div>

      {/* Double-tap heart bursts */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="pointer-events-none absolute animate-heart-pop text-white"
          style={{ left: h.x - 32, top: h.y - 32 }}
        >
          <HeartIcon filled size={64} />
        </div>
      ))}
    </div>
  )
}

function HeartIcon({ filled, size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#FF3B5C' : 'none'}
      stroke={filled ? '#FF3B5C' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

function MuteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
}

function SoundIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}
