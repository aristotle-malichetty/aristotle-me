# aristotle.me — Build Spec for Claude Code

## Overview

Build a personal website + blog for Aris, a 23-year-old technical entrepreneur and Claude Code power user. The site runs on **Astro + Keystatic CMS + Tailwind CSS**, deployed to **Cloudflare Pages**. The design should feel modern, clean, and premium — not a generic template. Think editorial/magazine meets developer portfolio.

---

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Framework | **Astro 5** | Static-first, file-based, fast |
| CMS | **Keystatic** | Admin UI at `/keystatic`, edits markdown files in repo |
| Styling | **Tailwind CSS 4** | Utility-first, no CSS files to manage |
| Fonts | Google Fonts — pick a distinctive display font (e.g. Instrument Serif, Bricolage Grotesque, or Sora) + clean body font (e.g. Geist, Satoshi, or DM Sans). Do NOT use Inter/Roboto/Arial. |
| Icons | Lucide or Phosphor icons |
| Deployment | **Cloudflare Pages** | Auto-deploy on git push, unlimited bandwidth, free for commercial use |
| Analytics | Plausible or Cloudflare Web Analytics (lightweight, no cookies) |

### What Astro Uses (for context)
- `.astro` files — HTML-like syntax with a frontmatter script block (like JSX meets HTML)
- Supports Tailwind natively
- Content Collections — type-safe markdown/MDX content
- Zero JS shipped by default (islands architecture — JS only where needed)
- Can use React/Vue/Svelte components if needed via integrations

---

## Site Structure

```
aristotle.me/
├── / (Homepage)
├── /blog (Blog listing)
├── /blog/[slug] (Individual posts)
├── /projects (Projects/SaaS showcase)
├── /about (About me)
├── /contact (Contact/connect)
├── /keystatic (CMS admin — Keystatic)
└── /rss.xml (RSS feed)
```

---

## Keystatic CMS Configuration

### Blog Posts Collection
```yaml
fields:
  title: text (required)
  description: text (summary for SEO/cards)
  date: date (required)
  tags: array of strings (e.g. "claude-code", "saas", "automation")
  coverImage: image (optional)
  draft: boolean (default true)
  featured: boolean (default false)
```

### Projects Collection
```yaml
fields:
  title: text
  description: text
  url: url (live link)
  github: url (optional)
  coverImage: image
  tags: array of strings
  status: select ["live", "building", "idea"]
  order: number (for sorting)
```

### Site Settings (singleton)
```yaml
fields:
  name: text
  tagline: text
  bio: text (short bio for homepage)
  socialLinks:
    twitter: url
    linkedin: url
    github: url
    email: email
```

This means Aris can update ANY content from `/keystatic` admin UI OR Claude Code can edit the same markdown files directly. Both paths work.

---

## Page Designs

### Homepage (`/`)

The homepage should feel premium and editorial. Not a wall of text, not a generic hero. Clean, intentional, memorable.

**Sections in order:**

1. **Hero Section**
   - Big bold name: "Aris" or "Aristotle"
   - One-liner tagline: something like "I build SaaS products with Claude Code"
   - Subtle animated element — could be a gradient mesh background, a typing effect, or a minimal geometric animation. Nothing cheesy.
   - CTA buttons: "Read the Blog" + "See Projects"

2. **What I Do — Short Intro**
   - 2-3 sentence intro about who Aris is
   - Keep it tight and confident
   - Maybe icon cards or a minimal grid: "SaaS Builder" / "Claude Code Power User" / "Technical Consultant"

3. **Featured Blog Posts**
   - Show 3 latest or featured posts
   - Card layout with title, date, tags, short description
   - Clean hover effects
   - "View all posts →" link

4. **Projects Showcase**
   - Grid of 3-4 projects with cover image, title, status badge, short description
   - Click through to live URL or detail page
   - "See all projects →" link

5. **CTA / Connect**
   - Simple section: "Want to work together?" or "Let's build something"
   - Links to email, LinkedIn, Twitter/X
   - Optional: newsletter signup (can add later)

6. **Footer**
   - Minimal: name, social links, "Built with Astro + Claude Code" credit
   - Copyright year auto-generated

### Blog Listing (`/blog`)

- Clean list or card grid of all posts
- Filter/sort by tags
- Show title, date, description, tags, reading time
- Pagination or infinite scroll (pagination preferred for SEO)
- Search (optional, can add later)

### Blog Post (`/blog/[slug]`)

- Clean reading experience — generous line height, max-width prose container
- Post title (large), date, tags, reading time at top
- Cover image (if set)
- Markdown rendered with good typography:
  - Code blocks with syntax highlighting (use Shiki, built into Astro)
  - Proper heading anchors
  - Image handling
  - Callout/tip boxes (via MDX components or remark plugin)
- Share buttons or copy link at bottom
- "Next/Previous post" navigation
- Table of contents sidebar (optional but nice for longer posts)

### Projects (`/projects`)

- Grid layout with project cards
- Status badges: 🟢 Live / 🟡 Building / 💡 Idea
- Click through to live URL
- Tags for tech used

### About (`/about`)

- Photo (optional)
- Longer bio — background, what Aris does, tech stack he uses
- Timeline or milestones (optional)
- Current focus areas
- Link to blog and projects

### Contact (`/contact`)

- Simple page with contact methods
- Email, LinkedIn, Twitter/X links
- Optional: contact form (can use Formspree or Web3Forms — no backend needed)

---

## Design Direction

### Aesthetic
- **Editorial minimalism** — think Stripe blog meets personal brand
- Clean but not boring. Personality through typography and subtle motion.
- Dark mode + Light mode toggle (default to dark or system preference)

### Color Palette (suggestion — adjust to taste)
- Background: near-black (`#0a0a0a`) for dark / off-white (`#fafaf9`) for light
- Text: soft white / near-black
- Accent: ONE strong accent color — electric blue, warm amber, or emerald green
- Use accent sparingly — links, hover states, tags, highlights

### Typography
- Display/Headings: a bold distinctive font (Bricolage Grotesque, Instrument Serif, Clash Display, or Cabinet Grotesk)
- Body: clean readable font (Geist, Satoshi, DM Sans, or General Sans)
- Code: JetBrains Mono or Fira Code

### Motion & Interactions
- Subtle page transitions (View Transitions API — built into Astro)
- Staggered fade-in on page load for sections
- Smooth hover effects on cards and links
- No heavy JS animations — keep it CSS-driven

---

## SEO Setup

- Auto-generated sitemap (`@astrojs/sitemap`)
- RSS feed (`@astrojs/rss`)
- Open Graph meta tags on every page (title, description, image)
- Twitter card meta tags
- Structured data (JSON-LD) for blog posts (Article schema)
- Canonical URLs
- Robots.txt
- Clean semantic HTML (proper heading hierarchy, alt tags)
- Fast Core Web Vitals (Astro gives you this by default)

---

## Project Init Commands

```bash
# Create Astro project
npm create astro@latest aristotle-me

# Add integrations
npx astro add tailwind
npx astro add cloudflare
npx astro add sitemap
npx astro add mdx

# Add Keystatic
npm install @keystatic/core @keystatic/astro

# Add extras
npm install astro-icon
npm install @fontsource-variable/[chosen-display-font]
npm install @fontsource-variable/[chosen-body-font]
```

---

## Folder Structure

```
aristotle-me/
├── astro.config.mjs
├── keystatic.config.ts          ← Keystatic CMS config
├── tailwind.config.mjs
├── public/
│   ├── favicon.svg
│   ├── og-default.png           ← Default Open Graph image
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Header.astro         ← Nav bar
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── BlogCard.astro
│   │   ├── ProjectCard.astro
│   │   ├── ThemeToggle.astro    ← Dark/light mode
│   │   ├── TagList.astro
│   │   └── SEO.astro            ← Reusable meta tag component
│   ├── content/
│   │   ├── blog/                ← Blog posts (markdown)
│   │   │   └── my-first-post.md
│   │   └── projects/            ← Project entries (markdown)
│   │       └── callclaim.md
│   ├── layouts/
│   │   ├── BaseLayout.astro     ← HTML shell, head, fonts, analytics
│   │   ├── BlogLayout.astro     ← Blog post template
│   │   └── PageLayout.astro     ← Generic page template
│   ├── pages/
│   │   ├── index.astro          ← Homepage
│   │   ├── blog/
│   │   │   ├── index.astro      ← Blog listing
│   │   │   └── [...slug].astro  ← Dynamic blog post
│   │   ├── projects/
│   │   │   └── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   └── rss.xml.ts           ← RSS feed
│   └── styles/
│       └── global.css           ← Tailwind directives + custom styles
```

---

## Deployment

1. Push repo to GitHub
2. Go to Cloudflare Dashboard → Pages → Create a project → Connect GitHub repo
3. Build settings: Framework preset = Astro, build command = `npm run build`, output directory = `dist`
4. Point `aristotle.me` domain to Cloudflare Pages (if domain is already on Cloudflare, it's one click)
5. Every `git push` = automatic deploy
6. Preview deployments auto-generated for every branch/PR

---

## Content Workflow (Day-to-Day)

### Writing a blog post via Claude Code:
```
"Create a new blog post titled 'How I Built a Chrome Extension in 30 Minutes with Claude Code'"
```
Claude Code creates `src/content/blog/chrome-extension-30-min.md` with frontmatter + content → git push → live.

### Writing via Keystatic CMS:
Go to `aristotle.me/keystatic` → Click "Blog Posts" → "New Post" → Write in the visual editor → Save → Auto-commits to repo → Cloudflare deploys.

### Updating homepage or design:
```
"Update the hero tagline to 'Building the future with AI and code'"
```
Claude Code edits `src/components/Hero.astro` → git push → live.

---

## Sample Blog Posts to Start With

1. "Why I Moved Away from WordPress (And What I Use Now)"
2. "My Daily Claude Code Workflow"
3. "Building CallClaim.io: From Idea to Launch"
4. "The SaaS Tools I Use to Run My Business"
5. "How I Use Claude Code to Ship Faster"

---

## Priority Order (Build Sequence)

1. **Project scaffolding** — Astro + Tailwind + Keystatic + folder structure
2. **Base layout** — HTML shell, fonts, global styles, header, footer, theme toggle
3. **Homepage** — Hero + intro + featured posts + projects + CTA
4. **Blog system** — Content collection, listing page, individual post template
5. **Projects page** — Grid with project cards
6. **About + Contact pages**
7. **SEO setup** — Sitemap, RSS, OG tags, structured data
8. **Keystatic config** — Collections for blog + projects + site settings
9. **Deploy to Cloudflare Pages** — Connect domain
10. **Write first 3 blog posts**

---

## Notes for Claude Code

- Astro uses `.astro` file format — it's like HTML with a `---` frontmatter block for JS/TS logic at the top
- Tailwind classes go directly on HTML elements, no separate CSS files needed
- Use Astro Content Collections for type-safe content querying
- Keystatic stores content as markdown/JSON files in the repo — no database
- Keep JavaScript minimal — Astro ships zero JS by default, only add islands where needed (theme toggle, mobile menu)
- Use View Transitions for smooth page navigation (built into Astro 4+)
- Code syntax highlighting comes free with Shiki (built into Astro)
