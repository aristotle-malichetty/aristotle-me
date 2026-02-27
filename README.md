# aristotle.me

Personal website and blog for Aris Malichetty — marketing analyst, product builder, and developer who builds with AI.

**Live:** [aristotle.me](https://aristotle.me)

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Astro 5 (server mode) |
| CMS | Keystatic (local, file-based) |
| Styling | Tailwind CSS 4 |
| Fonts | Bricolage Grotesque (display), DM Sans (body), JetBrains Mono (code) |
| Icons | Lucide |
| Hosting | Cloudflare Pages + Workers |
| Database | Cloudflare D1 (blog comments) |

## Getting Started

```sh
npm install
npm run dev
```

Dev server runs at `localhost:4321`. Keystatic admin UI is at `localhost:4321/keystatic`.

## Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## Project Structure

```
src/
├── components/     # Astro components (Header, Footer, Hero, cards, etc.)
├── content/        # Markdoc content managed by Keystatic
│   ├── blog/       # Blog posts (.mdoc)
│   └── projects/   # Project entries (.mdoc)
├── layouts/        # BaseLayout wrapper
├── pages/          # File-based routing
│   ├── api/        # API routes (comments)
│   ├── blog/       # Blog listing + individual posts
│   └── projects/   # Projects listing
├── styles/         # Global CSS + Tailwind
└── utils/          # Helpers (comments)
```

## Content

Content is managed via Keystatic at `/keystatic` in dev mode. Blog posts and projects are stored as `.mdoc` (Markdoc) files in `src/content/`.

- **Blog posts** have: title, description, date, tags, draft flag, featured flag
- **Projects** have: title, description, URLs, tags, status (live/building/idea), sort order

## Deployment

Pushes to `main` auto-deploy to Cloudflare Pages. The site uses Cloudflare Workers for server-side routes (comments API) and D1 for the comments database.