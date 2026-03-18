export const prerender = false;

import type { APIContext } from 'astro';
import { hashIP } from '@utils/comments';

function unauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function tooManyRequests() {
  return new Response(JSON.stringify({ error: 'Too many requests' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json' },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  // crypto.subtle.timingSafeEqual is Cloudflare Workers-only; fall back to
  // constant-time byte comparison in environments that lack it (e.g. local dev).
  if (typeof crypto.subtle.timingSafeEqual === 'function') {
    if (bufA.byteLength !== bufB.byteLength) {
      crypto.subtle.timingSafeEqual(bufA, bufA); // burn constant time
      return false;
    }
    return crypto.subtle.timingSafeEqual(bufA, bufB);
  }

  // Fallback: constant-time comparison via XOR accumulator
  if (bufA.byteLength !== bufB.byteLength) return false;
  let mismatch = 0;
  for (let i = 0; i < bufA.byteLength; i++) {
    mismatch |= bufA[i] ^ bufB[i];
  }
  return mismatch === 0;
}

function authorize(context: APIContext, env: any): boolean {
  const auth = context.request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  return timingSafeEqual(auth.slice(7), env.ADMIN_SECRET);
}

async function checkAdminRateLimit(context: APIContext, env: any): Promise<boolean> {
  const db = env.DB;
  const clientIP = context.request.headers.get('CF-Connecting-IP') || context.request.headers.get('X-Forwarded-For') || '0.0.0.0';
  const ipHash = await hashIP(clientIP, env.IP_HASH_SALT || '');

  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  const rateCheck = await db.prepare(
    'SELECT COUNT(*) as count FROM rate_limits WHERE ip_hash = ? AND action = ? AND timestamp > ?'
  ).bind(ipHash, 'admin_auth', fifteenMinAgo).first<{ count: number }>();

  return !rateCheck || rateCheck.count < 10;
}

async function recordFailedAuth(context: APIContext, env: any): Promise<void> {
  const db = env.DB;
  const clientIP = context.request.headers.get('CF-Connecting-IP') || context.request.headers.get('X-Forwarded-For') || '0.0.0.0';
  const ipHash = await hashIP(clientIP, env.IP_HASH_SALT || '');
  await db.prepare('INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)').bind(ipHash, 'admin_auth').run();
}

async function getClientIpHash(context: APIContext, env: any): Promise<string> {
  const clientIP = context.request.headers.get('CF-Connecting-IP') || context.request.headers.get('X-Forwarded-For') || '0.0.0.0';
  return hashIP(clientIP, env.IP_HASH_SALT || '');
}

async function logAuditEntry(db: any, action: string, commentId: number, snapshot: any, ipHash: string): Promise<void> {
  await db.prepare(
    'INSERT INTO admin_audit_log (action, comment_id, comment_snapshot, ip_hash) VALUES (?, ?, ?, ?)'
  ).bind(action, commentId, JSON.stringify(snapshot), ipHash).run();
}

export async function GET(context: APIContext) {
  try {
    const { runtime } = context.locals as any;
    const env = runtime.env;

    if (!await checkAdminRateLimit(context, env)) return tooManyRequests();
    if (!authorize(context, env)) {
      await recordFailedAuth(context, env);
      return unauthorized();
    }

    const db = env.DB;
    const url = new URL(context.request.url);

    // Return audit log entries when ?audit=1
    if (url.searchParams.get('audit') === '1') {
      const { results: auditEntries } = await db.prepare(
        'SELECT id, action, comment_id, comment_snapshot, ip_hash, created_at FROM admin_audit_log ORDER BY created_at DESC LIMIT 100'
      ).all();
      return new Response(JSON.stringify({ audit: auditEntries }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { results } = await db.prepare(
      'SELECT id, post_slug, parent_id, author_name, author_email, comment_text, created_at, approved, ip_hash FROM comments ORDER BY created_at DESC'
    ).all();

    return new Response(JSON.stringify({ comments: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Admin GET error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PATCH(context: APIContext) {
  try {
    const { runtime } = context.locals as any;
    const env = runtime.env;

    if (!await checkAdminRateLimit(context, env)) return tooManyRequests();
    if (!authorize(context, env)) {
      await recordFailedAuth(context, env);
      return unauthorized();
    }

    const db = env.DB;
    const body = await context.request.json() as { id: number; approved: number };

    if (!body.id || typeof body.approved !== 'number') {
      return new Response(JSON.stringify({ error: 'id and approved are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Snapshot before mutation
    const snapshot = await db.prepare(
      'SELECT id, post_slug, parent_id, author_name, author_email, comment_text, created_at, approved FROM comments WHERE id = ?'
    ).bind(body.id).first();

    if (!snapshot) {
      return new Response(JSON.stringify({ error: 'Comment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.prepare('UPDATE comments SET approved = ? WHERE id = ?').bind(body.approved, body.id).run();

    // Audit log
    const action = body.approved === 1 ? 'approve' : 'hide';
    const ipHash = await getClientIpHash(context, env);
    await logAuditEntry(db, action, body.id, snapshot, ipHash);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Admin PATCH error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(context: APIContext) {
  try {
    const { runtime } = context.locals as any;
    const env = runtime.env;

    if (!await checkAdminRateLimit(context, env)) return tooManyRequests();
    if (!authorize(context, env)) {
      await recordFailedAuth(context, env);
      return unauthorized();
    }

    const db = env.DB;
    const body = await context.request.json() as { id: number };

    if (!body.id) {
      return new Response(JSON.stringify({ error: 'id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Snapshot before deletion
    const snapshot = await db.prepare(
      'SELECT id, post_slug, parent_id, author_name, author_email, comment_text, created_at, approved FROM comments WHERE id = ?'
    ).bind(body.id).first();

    if (!snapshot) {
      return new Response(JSON.stringify({ error: 'Comment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.prepare('DELETE FROM comments WHERE id = ?').bind(body.id).run();

    // Audit log
    const ipHash = await getClientIpHash(context, env);
    await logAuditEntry(db, 'delete', body.id, snapshot, ipHash);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Admin DELETE error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
