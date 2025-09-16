# Static Comics Viewer

A mobile-first static website that consumes the comics API hosted at `https://antchu.pythonanywhere.com/` to display Garfield, Pearls Before Swine, and Calvin and Hobbes comics with swipe navigation, random selection, favorites (starred), state persistence, and an immersive full-screen viewing experience.

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
static_site/
  index.html
  styles.css
  app.js
  README.md
```

## Running Locally
Because this is a static site, you can simply open `index.html` in a modern browser. For best results (due to some browsers restricting localStorage or fetch with file://), serve it with a tiny static server:

### PowerShell (Windows)
```
cd path\to\static_site
python -m http.server 8080
```
Then open: http://localhost:8080/

(Or use any static hosting such as GitHub Pages, Netlify, Vercel, Cloudflare Pages.)

## Configuration
If you deploy your own API base, update `API_BASE` at the top of `app.js`.

## Accessibility
- Controls have `aria-label`s for clarity.
- Title region uses `aria-live` for updates.

## Notes
- The API must provide endpoints like `/api/comics/<code>?date=YYYY-MM-DD` and `/api/comics/<code>/random`.
- Swipe gesture threshold: 40px horizontal movement.
- Favorites stored under `localStorage` keys prefixed with `comics:`.

## Possible Enhancements
- Add offline caching via a Service Worker.
- Add pinch-to-zoom on the comic image.
- Add share functionality.

MIT License.
