# Contributing to aristotle.me

Thanks for your interest in contributing. This is a personal website and blog, so contributions are focused on bug fixes, performance improvements, and developer experience.

## Getting Started

1. Fork the repo and clone it locally
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your own values (or leave defaults for non-comment features)
4. Start the dev server: `npm run dev`
5. Open `localhost:4321`

## What You Can Contribute

- Bug fixes (layout issues, broken links, accessibility problems)
- Performance improvements
- Accessibility enhancements
- Documentation improvements

## Development

- **Framework:** Astro 5 with server-side rendering
- **Styling:** Tailwind CSS 4 (via Vite plugin, not PostCSS)
- **Content:** Markdoc files managed by Keystatic CMS
- **Database:** Cloudflare D1 for blog comments

### Project Structure

```
src/
  components/   # Astro components
  content/      # Blog posts and projects (.mdoc)
  layouts/      # Base layout
  pages/        # File-based routing + API routes
  styles/       # Global CSS with design tokens
  utils/        # Helpers
```

### Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build locally |

## Submitting Changes

1. Create a branch from `main`
2. Make your changes
3. Run `npm run build` to verify nothing breaks
4. Open a pull request with a clear description of what you changed and why

## Content

Blog posts and project entries are personal content. Please don't modify these unless fixing a typo or broken link.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
