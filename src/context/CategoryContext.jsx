import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { CATEGORIES, DEFAULT_CATEGORY_ID, getCategoryById } from '../data/categories'

const STORAGE_KEY = 'reels-agent:last-category'

const CategoryContext = createContext(null)

function readStoredCategoryId() {
  if (typeof window === 'undefined') return DEFAULT_CATEGORY_ID
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && CATEGORIES.some((c) => c.id === stored)) {
      return stored
    }
  } catch {
    // localStorage unavailable (private browsing, etc.) — ignore.
  }
  return DEFAULT_CATEGORY_ID
}

export function CategoryProvider({ children }) {
  const [categoryId, setCategoryId] = useState(readStoredCategoryId)

  const setCategory = useCallback((id) => {
    setCategoryId(id)
    try {
      window.localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // Ignore write failures — persistence is a nice-to-have.
    }
  }, [])

  const value = useMemo(
    () => ({
      categories: CATEGORIES,
      categoryId,
      category: getCategoryById(categoryId),
      setCategory,
    }),
    [categoryId, setCategory]
  )

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

export function useCategory() {
  const ctx = useContext(CategoryContext)
  if (!ctx) {
    throw new Error('useCategory must be used within a CategoryProvider')
  }
  return ctx
}
