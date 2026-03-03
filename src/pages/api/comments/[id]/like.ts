export const prerender = false;

import type { APIContext } from 'astro';
import { hashIP } from '@utils/comments';

export async function POST(context: APIContext) {
  try {
    const { runtime } = context.locals as any;
    const env = runtime.env;
    const db = env.DB;

    const commentId = Number(context.params.id);
    if (!commentId || commentId < 1) {
      return new Response(JSON.stringify({ error: 'Invalid comment ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify comment exists and is approved
    const comment = await db.prepare(
      'SELECT id FROM comments WHERE id = ? AND approved = 1'
    ).bind(commentId).first();

    if (!comment) {
      return new Response(JSON.stringify({ error: 'Comment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash client IP
    const clientIP = context.request.headers.get('CF-Connecting-IP') || context.request.headers.get('X-Forwarded-For') || '0.0.0.0';
    if (!env.IP_HASH_SALT) {
      console.error('IP_HASH_SALT environment variable is not set');
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const ipHash = await hashIP(clientIP, env.IP_HASH_SALT);

    // Rate limiting: 30 like actions per 10 min
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
    const rateCheck = await db.prepare(
      'SELECT COUNT(*) as count FROM rate_limits WHERE ip_hash = ? AND action = ? AND timestamp > ?'
    ).bind(ipHash, 'like', tenMinAgo).first<{ count: number }>();

    if (rateCheck && rateCheck.count >= 30) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Atomic toggle: try INSERT first, if row already exists (IGNORE), DELETE instead
    const insertResult = await db.prepare(
      'INSERT OR IGNORE INTO comment_likes (comment_id, ip_hash) VALUES (?, ?)'
    ).bind(commentId, ipHash).run();

    let liked: boolean;

    if (insertResult.meta.changes > 0) {
      liked = true;
    } else {
      // Row already existed, so unlike
      await db.prepare(
        'DELETE FROM comment_likes WHERE comment_id = ? AND ip_hash = ?'
      ).bind(commentId, ipHash).run();
      liked = false;
    }

    // Record rate limit entry
    await db.prepare(
      'INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)'
    ).bind(ipHash, 'like').run();

    // Get updated count
    const countResult = await db.prepare(
      'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?'
    ).bind(commentId).first<{ count: number }>();

    return new Response(JSON.stringify({ liked, count: countResult?.count || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Like POST error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
