export const prerender = true;

import type { APIRoute } from 'astro';
import { generateOgImage } from '@/lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('Projects', 'Real tools for real problems — APIs, Chrome extensions, and products I\'ve shipped.');
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
