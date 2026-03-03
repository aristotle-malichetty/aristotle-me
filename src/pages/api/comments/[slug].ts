export const prerender = false;

import type { APIContext } from 'astro';
import { buildCommentTree } from '@utils/comments';
import type { Comment } from '@utils/comments';

export async function GET(context: APIContext) {
  try {
    const { runtime } = context.locals as any;
    const db = runtime?.env?.DB;

    if (!db) {
      return new Response(JSON.stringify({ comments: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const slug = context.params.slug;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { results } = await db.prepare(
      `SELECT c.id, c.post_slug, c.parent_id, c.author_name, c.comment_text, c.created_at, c.approved,
              COALESCE(l.like_count, 0) as like_count
       FROM comments c
       LEFT JOIN (SELECT comment_id, COUNT(*) as like_count FROM comment_likes GROUP BY comment_id) l
         ON l.comment_id = c.id
       WHERE c.post_slug = ? AND c.approved = 1
       ORDER BY c.created_at ASC`
    ).bind(slug).all<Omit<Comment, 'author_email' | 'ip_hash'>>();

    const comments = buildCommentTree(results as Comment[]);
    const total = results.length;

    return new Response(JSON.stringify({ comments, total }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (err) {
    console.error('Comment GET error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
