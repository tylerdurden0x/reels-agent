# Reels Agent

A mobile-first, TikTok-style vertical video feed PWA. Tap a category pill and the entire feed re-renders with videos matching that vibe — powered by the Pexels Video API.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/reels-agent&env=VITE_PEXELS_API_KEY&envDescription=Get%20a%20free%20key%20at%20pexels.com/api)

> Replace `YOUR_USERNAME` above with your GitHub username once you've pushed this repo, or just deploy manually — see below.

## Features

- 6 category pills (Laugh, Sports, Outdoor, Brain Rot, Doom Scroll, Baddies) that instantly swap the feed's search query
- Snap-scroll, full-viewport video cards with autoplay-on-visible (IntersectionObserver)
- Double-tap to like with a heart burst at the tap point, plus a dedicated like button
- Native share sheet (falls back to copy-link on desktop)
- Keyboard navigation (↑ / ↓ or Page Up / Page Down)
- Infinite scroll pagination
- Per-query session caching — switching back to a category you've already viewed is instant
- Installable as a PWA, no browser chrome, no pull-to-refresh, no overscroll bounce

## Getting an API key

1. Go to [pexels.com/api](https://www.pexels.com/api/) and sign up (free).
2. Copy your API key from the dashboard.
3. Copy `.env.example` to `.env` and paste your key in:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_PEXELS_API_KEY=your_key_here
   ```

## Local development

```bash
npm install
npm run dev
```

Open the printed local URL. For a true mobile feel, open dev tools' device toolbar (or visit from your phone on the same network using the "Network" URL Vite prints).

## Build

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## Deploy to Vercel

**Option A — one-click:** click the "Deploy with Vercel" button above after pushing this repo to GitHub, then add `VITE_PEXELS_API_KEY` in the Vercel project's Environment Variables settings.

**Option B — CLI:**

```bash
npm install -g vercel
vercel
vercel env add VITE_PEXELS_API_KEY
vercel --prod
```

`vercel.json` is already configured with an SPA rewrite so client-side routing (if you add any later) won't 404 on refresh.

## Adding a new category

Everything reads from one file — `src/data/categories.js`. To add a category, push a new object onto the `CATEGORIES` array:

```js
{
  id: 'travel',                          // unique, used as React key + localStorage value
  label: '✈️ Wander',                     // shown on the pill
  query: 'travel adventure destination',  // sent to the Pexels API
  color: '#22D3EE',                       // accent used on the category badge
}
```

No other file needs to change — `CategoryBar`, `useVideos`, and `VideoCard` all derive from this array.

## Project structure

```
src/
├── App.jsx                    # Shell: CategoryProvider + CategoryBar + VideoFeed
├── main.jsx                   # React entry point
├── index.css                  # Tailwind + native-app-feel resets
├── context/
│   └── CategoryContext.jsx    # Active category state, persisted to localStorage
├── components/
│   ├── CategoryBar.jsx        # Glassmorphism pill row, auto-scrolls active pill into view
│   ├── VideoFeed.jsx          # Scroll-snap feed, infinite scroll, keyboard nav
│   ├── VideoCard.jsx          # Single video slide: play-on-visible, like, share, badges
│   └── LoadingSpinner.jsx     # Pulsing-circle loader
├── hooks/
│   └── useVideos.js           # Fetch + paginate + cache videos for a query
├── data/
│   └── categories.js          # Single source of truth for all categories
└── utils/
    └── api.js                 # Pexels API client + response normalization
```

## Notes on the two category lists in the original brief

The brief included both a marketing-style table (8 categories: Cute Animals, Nature Escape, Night Vibes, Food Porn, Gym Rat, Travel Dreams, Aesthetic, Satisfying) and an explicit code spec for `categories.js` (6 categories: Laugh, Sports, Outdoor, Brain Rot, Doom Scroll, Baddies). This build implements the 6-category code spec, since that's what the file structure and components are wired against. Swapping in any of the 8 table categories (or all of them) is a two-minute edit to `src/data/categories.js` — see "Adding a new category" above.

## Browser support

Tested against iOS Safari and Chrome Android behavior in mind: `playsInline` is set on all videos (required for autoplay on iOS), `100dvh` is used instead of `100vh` to handle the mobile URL bar correctly, and `overscroll-behavior: none` + `touch-action: pan-y` prevent pull-to-refresh and rubber-banding.

## License

MIT — do whatever you want with it.
