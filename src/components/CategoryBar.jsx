import { useRef, useEffect } from 'react'
import { useCategory } from '../context/CategoryContext'

export default function CategoryBar() {
  const { categories, categoryId, setCategory } = useCategory()
  const barRef = useRef(null)
  const activeRef = useRef(null)

  // Scroll the active pill into view on mount (and whenever it changes).
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [categoryId])

  return (
    <nav
      ref={barRef}
      className="hide-scrollbar fixed inset-x-0 top-0 z-20 flex gap-2 overflow-x-scroll border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      aria-label="Feed categories"
    >
      {categories.map((cat) => {
        const isActive = cat.id === categoryId
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : null}
            type="button"
            onClick={() => setCategory(cat.id)}
            aria-pressed={isActive}
            className={[
              'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out',
              isActive
                ? 'scale-105 bg-white text-black shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20',
            ].join(' ')}
          >
            {cat.label}
          </button>
        )
      })}
    </nav>
  )
}
