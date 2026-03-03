# aristotle.me

Personal website and blog for Aristotle Malichetty.

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
cp .env.example .env
cp .env.example .dev.vars
```

Fill in your values in both files:

| Variable | Where to get it |
|----------|-----------------|
| `PUBLIC_TURNSTILE_SITE_KEY` | [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) |
| `TURNSTILE_SECRET_KEY` | Same Turnstile dashboard (server-side key) |
| `ADMIN_SECRET` | Any strong random string (used to log into the admin panel) |
| `IP_HASH_SALT` | Any random string (used to hash commenter IPs) |

Update `wrangler.jsonc` with your Cloudflare D1 database ID:

```sh
# Create the D1 database
npx wrangler d1 create aristotle-comments

# Copy the database_id from the output into wrangler.jsonc
```

Run the migrations:

```sh
npx wrangler d1 execute aristotle-comments --local --file=migrations/0001_create_comments.sql
npx wrangler d1 execute aristotle-comments --local --file=migrations/0002_add_comment_likes.sql
```

Start the dev server:

```sh
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
│   ├── admin/      # Admin dashboard (comment moderation)
│   ├── api/        # API routes (comments, likes, admin)
│   ├── blog/       # Blog listing + individual posts
│   └── projects/   # Projects listing
├── styles/         # Global CSS + Tailwind
└── utils/          # Helpers (comments)
```

## Content

Content is managed via Keystatic at `/keystatic` in dev mode. Blog posts and projects are stored as `.mdoc` (Markdoc) files in `src/content/`.

- **Blog posts** have: title, description, date, tags, draft flag, featured flag
- **Projects** have: title, description, URLs, tags, status (live/building/idea), sort order

## Comment System

Blog posts have a comment system with:

- Cloudflare Turnstile CAPTCHA verification
- Nested replies (one level deep)
- Comment likes
- Rate limiting (per IP, hashed with salt)
- Honeypot + spam content filtering
- Admin moderation panel at `/admin/comments`

## Deployment

Pushes to `main` auto-deploy to Cloudflare Pages. The site uses Cloudflare Workers for server-side routes (comments API) and D1 for the comments database.

### 1. Environment Variables

Set these in the Cloudflare dashboard under **Workers & Pages > your-project > Settings > Environment Variables** (Production):

| Variable | Description |
|---|---|
| `TURNSTILE_SECRET_KEY` | Turnstile server-side key |
| `ADMIN_SECRET` | Bearer token for comment moderation |
| `IP_HASH_SALT` | Random string for IP hashing |

### 2. D1 Database Binding

**This step is required.** The `wrangler.jsonc` config alone is not enough for Pages deployments. Without this, comments will return "Service unavailable" (503).

In the Cloudflare dashboard, go to **Workers & Pages > your-project > Settings > Bindings** and add:

| Type | Variable name | Resource |
|---|---|---|
| D1 Database | `DB` | `aristotle-comments` |

### 3. Run Migrations

Apply migrations to the remote D1 database:

```sh
npx wrangler d1 migrations apply aristotle-comments --remote
```

### 4. Redeploy

Trigger a new deployment (or retry the latest) for bindings to take effect.
