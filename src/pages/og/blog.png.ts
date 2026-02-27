export const prerender = true;

import type { APIRoute } from 'astro';
import { generateOgImage } from '@/lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('Blog', 'Thoughts on marketing analytics, building SaaS products, and AI-powered development.');
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
