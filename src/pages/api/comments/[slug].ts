export const prerender = false;

import type { APIContext } from 'astro';
import { buildCommentTree } from '@utils/comments';
import type { Comment } from '@utils/comments';

export async function GET(context: APIContext) {
  try {
    const { runtime } = context.locals as any;
    const db = runtime.env.DB;
    const slug = context.params.slug;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { results } = await db.prepare(
      'SELECT id, post_slug, parent_id, author_name, comment_text, created_at, approved FROM comments WHERE post_slug = ? AND approved = 1 ORDER BY created_at ASC'
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
