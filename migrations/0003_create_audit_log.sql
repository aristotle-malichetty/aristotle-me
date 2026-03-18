-- Admin audit trail for comment moderation actions
CREATE TABLE admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  comment_id INTEGER NOT NULL,
  comment_snapshot TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_audit_created ON admin_audit_log(created_at);
