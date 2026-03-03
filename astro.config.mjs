// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  site: 'https://aristotle.me',
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [
    react(),
    markdoc(),
    sitemap({
      filter: (page) => !page.includes('/keystatic') && !page.includes('/admin'),
    }),
    ...(isDev ? [keystatic()] : []),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['@resvg/resvg-js'],
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
    remarkPlugins: [],
  },
});
