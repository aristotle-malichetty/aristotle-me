export const prerender = true;

import type { APIRoute } from 'astro';
import { generateOgImage } from '@/lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('Analytics, code, and building what the problem needs.');
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
