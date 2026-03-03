# CLAUDE.md

## Project

aristotle.me — personal website and blog for Aristotle Malichetty. Astro 5 + Keystatic CMS + Tailwind CSS 4, deployed on Cloudflare Pages.

## Voice Profile

@.claude/skills/blog-writing/references/voice-profile.md

## Commands

- `npm run dev` — start dev server (localhost:4321)
- `npm run build` — production build
- `npm run preview` — preview production build

## Architecture

- **Astro 5** in server mode with Cloudflare adapter
- **Keystatic** for content management (local storage, `.mdoc` files)
- **Tailwind CSS 4** via Vite plugin (not PostCSS)
- **Cloudflare D1** database for blog comments
- **Markdoc** for content rendering (not MDX)
- Content collections defined in `src/content.config.ts` with Zod schemas
- Keystatic config in `keystatic.config.ts`

## Key Files

- `src/components/Hero.astro` — homepage hero section
- `src/pages/index.astro` — homepage (testimonials, featured posts/projects, CTA)
- `src/pages/about.astro` — bio, skills, clients, current work, tech stack
- `src/pages/contact.astro` — contact channels
- `src/components/ProjectCard.astro` — project card with status dot (green=live, amber=building)
- `src/components/BlogCard.astro` — blog post card
- `src/content.config.ts` — Astro content collection schemas
- `keystatic.config.ts` — Keystatic CMS schema
- `src/styles/global.css` — design tokens as CSS variables, dark/light theme

## Content

- Blog posts: `src/content/blog/*.mdoc`
- Projects: `src/content/projects/*.mdoc`
- Draft posts have `draft: true` — filtered out of listings in code, but kept in repo for CMS access

## Design Conventions

- CSS variables for theming (`--color-accent`, `--color-text-primary-light`, etc.) defined in `global.css`
- Dark mode supported via `dark:` Tailwind variants
- Font: Bricolage Grotesque (display/headings), DM Sans (body), JetBrains Mono (code)
- Accent color is blue (`--color-accent`)
- Cards use `rounded-xl` borders with elevated background
- Section labels: small uppercase tracking-wide accent-colored text above headings
- Icons from `@lucide/astro`

## Voice & Copy Style

- Confident, direct, conversational — not corporate
- Short sentences, dashes for emphasis
- Reference point: the About page headline "I see how things should work — then I build them."
- No fluff, no jargon, no resume-speak
- Outcome-focused descriptions (what it does for people, not just what tech it uses)


## Git

- `.drafts/` directory is gitignored — used for local-only content storage (scratchpad, not CMS-managed)
