# React Comics Viewer

A mobile-first React (Vite) application that consumes the comics API at `https://antchu.pythonanywhere.com/` to display Garfield, Pearls Before Swine, and Calvin and Hobbes comics with swipe navigation, random selection, favorites (starred), state persistence, and an immersive full-screen viewing experience.

## Features
- Full-screen comic image with unobtrusive controls (tap to toggle)
- Choose comic series from dropdown
- Date picker to jump to a specific date
- Random comic button
- Swipe left/right (or arrow keys) to move to next/previous date
- Star / unstar comics (persisted in localStorage)
- Favorites panel with thumbnails and quick navigation
- Remembers last viewed comic and date across sessions
- Graceful loading and error handling

## Project Structure
```
project/
  index.html
  styles.css
  vite.config.js
  src/
    main.jsx
    App.jsx
    api.js
    storage.js
    components/
      Controls.jsx
      ComicStage.jsx
      FavoritesPanel.jsx
  README.md
```

## Running Locally
Install dependencies and start the dev server (Vite):

```
npm install
npm run dev
```

Open the printed local URL (default: http://localhost:5173/).

### Production Build
```
npm run build
npm run preview
```

## Configuration
If you deploy your own API base, update `API_BASE` in `src/api.js`.

## Accessibility
- Controls have `aria-label`s for clarity.
- Title region uses `aria-live` for updates.

## Notes
- The API must provide endpoints like `/api/comics/<code>?date=YYYY-MM-DD` and `/api/comics/<code>/random`.
- Swipe gesture threshold: ~110px horizontal movement (drag preview + animate out/ in).
- Favorites stored under `localStorage` keys prefixed with `comics:`.

## Possible Enhancements
- Add offline caching via a Service Worker.
- Add pinch-to-zoom on the comic image.
- Add share functionality.

MIT License.
