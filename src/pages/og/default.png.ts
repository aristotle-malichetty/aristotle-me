export const prerender = true;

import type { APIRoute } from 'astro';
import { generateOgImage } from '@/lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('Aristotle Malichetty — Marketing Analyst & Product Builder');
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
