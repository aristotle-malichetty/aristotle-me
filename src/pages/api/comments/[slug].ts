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

    // Pagination: limit top-level comments, always include all their replies
    const url = new URL(context.request.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 50, 1), 100);
    const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);

    // Get total count of top-level approved comments
    const countResult = await db.prepare(
      'SELECT COUNT(*) as count FROM comments WHERE post_slug = ? AND approved = 1 AND parent_id IS NULL'
    ).bind(slug).first<{ count: number }>();
    const totalTopLevel = countResult?.count || 0;

    // Fetch paginated top-level comments + all their replies
    const { results } = await db.prepare(
      `SELECT c.id, c.post_slug, c.parent_id, c.author_name, c.comment_text, c.created_at, c.approved,
              COALESCE(l.like_count, 0) as like_count
       FROM comments c
       LEFT JOIN (SELECT comment_id, COUNT(*) as like_count FROM comment_likes GROUP BY comment_id) l
         ON l.comment_id = c.id
       WHERE c.post_slug = ? AND c.approved = 1
         AND (c.parent_id IS NULL OR c.parent_id IN (
           SELECT id FROM comments
           WHERE post_slug = ? AND approved = 1 AND parent_id IS NULL
           ORDER BY created_at ASC
           LIMIT ? OFFSET ?
         ))
       ORDER BY c.created_at ASC`
    ).bind(slug, slug, limit, offset).all<Omit<Comment, 'author_email' | 'ip_hash'>>();

    const comments = buildCommentTree(results as Comment[]);
    const total = results.length;
    const hasMore = offset + limit < totalTopLevel;

    return new Response(JSON.stringify({ comments, total, hasMore, totalTopLevel }), {
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
