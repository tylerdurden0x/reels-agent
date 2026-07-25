/**
 * Category definitions that drive the entire feed algorithm.
 * Tapping a pill in <CategoryBar /> swaps `query`, which re-fetches
 * a brand new set of videos from Pexels and re-renders the feed.
 *
 * To add a new category: just push another object here. Nothing
 * else in the app needs to change — CategoryBar, useVideos, and
 * VideoCard all read from this array.
 *
 * Fields:
 *  - id:    stable unique key, used for localStorage + React keys
 *  - label: what's shown on the pill (emoji + name)
 *  - query: search string sent to the Pexels Video API
 *  - color: hex accent used for the active-pill glow / badge tint
 */
export const CATEGORIES = [
  {
    id: 'laugh',
    label: '😂 Laugh',
    query: 'funny comedy humor',
    color: '#FFD23F',
  },
  {
    id: 'sports',
    label: '🏀 Sports',
    query: 'sports action fitness',
    color: '#FF4655',
  },
  {
    id: 'outdoor',
    label: '🏕️ Outdoor',
    query: 'hiking nature adventure camping',
    color: '#3DDC97',
  },
  {
    id: 'brainrot',
    label: '🧠 Brain Rot',
    query: 'meme weird random odd',
    color: '#B983FF',
  },
  {
    id: 'doomscroll',
    label: '🌃 Doom Scroll',
    query: 'city night cinematic dark',
    color: '#4C6EF5',
  },
  {
    id: 'baddies',
    label: '💅 Baddies',
    query: 'fashion aesthetic style',
    color: '#FF6FB5',
  },
]

export const DEFAULT_CATEGORY_ID = CATEGORIES[0].id

export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0]
}
