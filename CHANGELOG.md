# Changelog

## 2026-03-17

### Security Hardening (VibeSec Audit Fixes)

**M1 — Origin header validation on state-changing endpoints**
- Added `Origin` header check to `POST /api/comments` and `POST /api/comments/[id]/like`
- Rejects requests where `Origin` doesn't match the site's own origin (returns 403)
- Prevents cross-site request forgery from external domains

**M2 — Pagination on comment retrieval**
- `GET /api/comments/[slug]` now accepts `?limit=` (1-100, default 50) and `?offset=` query params
- Paginates top-level comments while always including all replies for fetched parents
- Response now includes `hasMore` and `totalTopLevel` fields
- Prevents unbounded queries on posts with many comments

**M3 — Admin session inactivity timeout**
- Admin dashboard auto-logs out after 30 minutes of inactivity
- Tracks last activity via `sessionStorage` (click, keydown, scroll reset the timer)
- Checks for expired sessions on page load before attempting auto-login
- Cleans up timer and stored activity timestamp on logout

**L4 — Comment nesting depth limit**
- Replies are now capped at 3 levels deep (top-level -> reply -> reply)
- Server walks the parent chain to verify depth before inserting
- Returns 400 "Maximum reply depth reached" if exceeded

**L1 — Stricter email validation**
- Replaced bare `@` check with regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Rejects malformed inputs like `"a@b"` or `"@test"` while keeping it practical (not full RFC 5322)

**L6 — Return 404 for non-existent comment IDs in admin API**
- `PATCH /api/admin/comments` and `DELETE /api/admin/comments` now check `result.meta.changes`
- Returns 404 "Comment not found" instead of silent `{ success: true }` when the ID doesn't exist

**Admin audit trail**
- New `admin_audit_log` D1 table (migration `0003_create_audit_log.sql`)
- Every approve, hide, and delete action is logged with full comment snapshot, IP hash, and timestamp
- Snapshots capture the complete comment state before mutation (critical for deletes — data is preserved)
- Admin dashboard has a new "Audit Log" tab showing all actions with color-coded pills, comment previews, and expandable JSON snapshots
- Accessible via `GET /api/admin/comments?audit=1` (same auth as existing admin endpoints)
