export const prerender = false;

import type { APIContext } from 'astro';
import { validateCommentInput, sanitizeText, isSpamContent, hashIP } from '@utils/comments';

export async function POST(context: APIContext) {
  try {
    const { runtime } = context.locals as any;
    const env = runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await context.request.json();

    // Honeypot check — if the hidden "website" field is filled, silently discard
    if (body.website) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Turnstile verification
    const turnstileToken = body['cf-turnstile-response'];
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'Verification required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: context.request.headers.get('CF-Connecting-IP') || '',
      }),
    });

    const turnstileData = (await turnstileRes.json()) as { success: boolean };
    if (!turnstileData.success) {
      return new Response(JSON.stringify({ error: 'Verification failed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Input validation
    const validation = validateCommentInput(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data } = validation;

    // Sanitize
    data.author_name = sanitizeText(data.author_name);
    data.comment_text = sanitizeText(data.comment_text);

    // IP hash for rate limiting
    const clientIP = context.request.headers.get('CF-Connecting-IP') || context.request.headers.get('X-Forwarded-For') || '0.0.0.0';
    if (!env.IP_HASH_SALT) {
      console.error('IP_HASH_SALT environment variable is not set');
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const ipHash = await hashIP(clientIP, env.IP_HASH_SALT);

    // Spam content filter — silently save as unapproved
    const isSpam = isSpamContent(data.comment_text);

    // Rate limiting — max 5 comments per 10 min
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
    const rateCheck = await db.prepare(
      'SELECT COUNT(*) as count FROM rate_limits WHERE ip_hash = ? AND action = ? AND timestamp > ?'
    ).bind(ipHash, 'comment', tenMinAgo).first<{ count: number }>();

    if (rateCheck && rateCheck.count >= 5) {
      return new Response(JSON.stringify({ error: 'Too many comments. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If parent_id is set, verify it exists and belongs to the same post
    if (data.parent_id) {
      const parent = await db.prepare(
        'SELECT id FROM comments WHERE id = ? AND post_slug = ? AND approved = 1'
      ).bind(data.parent_id, data.post_slug).first();

      if (!parent) {
        return new Response(JSON.stringify({ error: 'Parent comment not found' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Insert comment
    await db.prepare(
      'INSERT INTO comments (post_slug, parent_id, author_name, author_email, comment_text, approved, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      data.post_slug,
      data.parent_id || null,
      data.author_name,
      data.author_email || null,
      data.comment_text,
      0,
      ipHash
    ).run();

    // Record rate limit entry
    await db.prepare(
      'INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)'
    ).bind(ipHash, 'comment').run();

    // Cleanup old rate limit entries (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
    await db.prepare('DELETE FROM rate_limits WHERE timestamp < ?').bind(oneHourAgo).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Comment POST error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
