/**
 * Centered pulsing-circle loader shown while a category's first
 * page of videos is in flight.
 */
export default function LoadingSpinner({ categoryLabel = '' }) {
  // Strip the leading emoji for cleaner copy: "😂 Laugh" -> "Laugh"
  const cleanLabel = categoryLabel.replace(/^\p{Emoji}\s*/u, '').trim()

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-black">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute h-16 w-16 animate-ping rounded-full bg-white/20" />
        <span className="absolute h-10 w-10 animate-pulse rounded-full bg-white/40" />
        <span className="h-4 w-4 rounded-full bg-white" />
      </div>
      <p className="text-sm font-medium tracking-wide text-white/70">
        Loading {cleanLabel || 'your'} vibes...
      </p>
    </div>
  )
}
