export const prerender = true;

import type { APIRoute } from 'astro';
import { generateOgImage } from '@/lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('About', 'I see how things should work, then I build them. Business analytics, marketing, APIs, and AI.');
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
