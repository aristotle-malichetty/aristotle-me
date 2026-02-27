export const prerender = true;

import type { APIRoute } from 'astro';
import { generateOgImage } from '@/lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('Contact', 'Have a project in mind or a problem that needs solving? Let\'s talk.');
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
