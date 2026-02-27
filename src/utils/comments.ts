export interface Comment {
  id: number;
  post_slug: string;
  parent_id: number | null;
  author_name: string;
  author_email?: string;
  comment_text: string;
  created_at: string;
  approved: number;
  ip_hash?: string;
}

export interface CommentTree extends Omit<Comment, 'author_email' | 'ip_hash'> {
  replies: CommentTree[];
}

export interface CommentInput {
  post_slug: string;
  parent_id?: number | null;
  author_name: string;
  author_email?: string;
  comment_text: string;
}

export function validateCommentInput(input: unknown): { valid: true; data: CommentInput } | { valid: false; error: string } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { post_slug, parent_id, author_name, author_email, comment_text } = input as Record<string, unknown>;

  if (!post_slug || typeof post_slug !== 'string' || post_slug.length > 200) {
    return { valid: false, error: 'Invalid post slug' };
  }

  if (!author_name || typeof author_name !== 'string' || author_name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (author_name.length > 100) {
    return { valid: false, error: 'Name must be under 100 characters' };
  }

  if (author_email !== undefined && author_email !== null && author_email !== '') {
    if (typeof author_email !== 'string' || author_email.length > 254 || !author_email.includes('@')) {
      return { valid: false, error: 'Invalid email address' };
    }
  }

  if (!comment_text || typeof comment_text !== 'string' || comment_text.trim().length === 0) {
    return { valid: false, error: 'Comment is required' };
  }

  if (comment_text.length > 5000) {
    return { valid: false, error: 'Comment must be under 5000 characters' };
  }

  if (parent_id !== undefined && parent_id !== null && (typeof parent_id !== 'number' || parent_id < 1)) {
    return { valid: false, error: 'Invalid parent comment' };
  }

  return {
    valid: true,
    data: {
      post_slug: post_slug.trim(),
      parent_id: parent_id ? Number(parent_id) : null,
      author_name: author_name.trim(),
      author_email: author_email && typeof author_email === 'string' ? author_email.trim() : undefined,
      comment_text: comment_text.trim(),
    },
  };
}

export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const SPAM_PATTERNS = [
  /\b(buy now|click here|free money|act now|limited time|earn \$|make money)\b/i,
  /\b(viagra|cialis|casino|poker|lottery|crypto airdrop)\b/i,
  /\b(SEO services|backlink|link building|cheap followers)\b/i,
  /(https?:\/\/[^\s]+){3,}/i, // 3+ URLs in a comment
];

export function isSpamContent(text: string): boolean {
  return SPAM_PATTERNS.some((pattern) => pattern.test(text));
}

export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + '_aristotle_salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function buildCommentTree(comments: Comment[]): CommentTree[] {
  const map = new Map<number, CommentTree>();
  const roots: CommentTree[] = [];

  for (const c of comments) {
    map.set(c.id, {
      id: c.id,
      post_slug: c.post_slug,
      parent_id: c.parent_id,
      author_name: c.author_name,
      comment_text: c.comment_text,
      created_at: c.created_at,
      approved: c.approved,
      replies: [],
    });
  }

  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
