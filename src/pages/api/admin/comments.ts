export const prerender = false;

import type { APIContext } from 'astro';

function unauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function authorize(context: APIContext, env: any): boolean {
  const auth = context.request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  return auth.slice(7) === env.ADMIN_SECRET;
}

export async function GET(context: APIContext) {
  try {
    const { runtime } = context.locals as any;
    const env = runtime.env;

    if (!authorize(context, env)) return unauthorized();

    const db = env.DB;
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

    if (!authorize(context, env)) return unauthorized();

    const db = env.DB;
    const body = await context.request.json() as { id: number; approved: number };

    if (!body.id || typeof body.approved !== 'number') {
      return new Response(JSON.stringify({ error: 'id and approved are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.prepare('UPDATE comments SET approved = ? WHERE id = ?').bind(body.approved, body.id).run();

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

    if (!authorize(context, env)) return unauthorized();

    const db = env.DB;
    const body = await context.request.json() as { id: number };

    if (!body.id) {
      return new Response(JSON.stringify({ error: 'id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.prepare('DELETE FROM comments WHERE id = ?').bind(body.id).run();

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
