CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  comment_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved INTEGER NOT NULL DEFAULT 1,
  ip_hash TEXT
);

CREATE INDEX idx_comments_slug ON comments(post_slug);
CREATE INDEX idx_comments_parent ON comments(parent_id);

CREATE TABLE rate_limits (
  ip_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_rate_lookup ON rate_limits(ip_hash, action, timestamp);
