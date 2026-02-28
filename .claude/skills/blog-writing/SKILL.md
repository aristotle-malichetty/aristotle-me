---
name: blog-writing
description: Writes blog posts for aristotle.me following Aris's personal voice and style. Use when creating new blog posts, editing drafts, rewriting content, or brainstorming post ideas.
---

# Blog Writing Skill

Read @references/voice-profile.md before doing anything. That file contains the complete writing style guide, personality profile, banned words, and engagement psychology rules. Follow every rule in that file.

## Blog Notes (Always Do This)

Every blog post gets a companion notes file at `.drafts/blog-notes/{slug}.md`. This is non-negotiable.

**Create or update the notes file immediately** when Aris starts talking about a post. Store:

- **Raw input**: Everything Aris says about the topic, in his exact words. Don't clean it up. His phrasing IS the voice.
- **Context**: What he's doing/building, what happened, what he tried, what worked/failed.
- **Feedback**: Any corrections during drafting ("too formal", "I wouldn't say it like that", "rewrite this part").
- **Voice corrections**: Specific style fixes that should also go into voice-profile.md.

**How to use it**:
- Before drafting, re-read the notes file to ground the post in Aris's actual words and framing.
- Pull specific phrases and sentence structures from his raw input. He already said it well. Use that.
- After a post is done, review all feedback/corrections in the notes. If a pattern appears (same correction 2+ times across posts), update voice-profile.md.

The notes file is for Claude's use. Aris doesn't read it. But it makes every post better because it captures how he actually talks about the topic, not how an AI would.

---

## When asked to write a new blog post:

1. **Start the notes file.** Create `.drafts/blog-notes/{slug}.md` and log everything Aris has said so far about this topic.

2. **Ask what's missing.** Based on what Aris already gave you, only ask what you still need:
   - Topic/angle (if not already clear)
   - Target reader (if not obvious from context)
   - Any more stories or experiences to include
   - Target length (default: 1,500-2,000 words)

3. **Research if needed.** If the topic requires current data, stats, or competitive analysis, gather that first. Add findings to the notes file.

4. **Outline first.** Present a quick outline with:
   - Proposed title (2-3 options)
   - Hook approach (what's the opening gap/surprise?)
   - 4-6 section headers
   - Key story or experience to weave in
   - Wait for approval before drafting.

5. **Write the draft.** Re-read the notes file first. Pull Aris's exact phrasing where possible. Follow every rule in voice-profile.md. Especially:
   - Open with curiosity or surprise, never a definition or broad context
   - No em dashes anywhere
   - No words from the banned list
   - Short paragraphs (1-3 sentences)
   - Mix stories with data
   - Address the reader as "you"
   - End punchy, no "in conclusion"

6. **Self-check before presenting.** Run through the checklist at the bottom of voice-profile.md. Fix any violations before showing the draft.

7. **Generate frontmatter.** Include whatever the blog's CMS requires (title, date, tags, description, slug, etc.). Write the meta description as a compelling hook, not a summary.

8. **Log feedback.** After Aris reviews the draft, log all feedback and corrections to the notes file. If a correction reveals a pattern (same fix across 2+ posts), update voice-profile.md.

## When asked to edit an existing post:

1. Read the post first
2. Check it against every rule in voice-profile.md
3. Flag specific violations (em dashes, banned words, long paragraphs, weak opening, etc.)
4. Suggest concrete rewrites, don't just say "make it better"
5. Preserve the original point and structure unless asked to restructure

## When asked to brainstorm post ideas:

1. Ask about the target audience and content goals
2. Generate 5-10 title ideas with one-line angle descriptions
3. For each, note why it would work (curiosity gap, practical value, contrarian take, etc.)
4. Rank them by estimated engagement potential

## Important rules:

- Never publish without Aris reviewing and approving
- When in doubt about tone, re-read 2-3 recent posts in the content directory to calibrate
- If Aris gives feedback like "too formal" or "sounds AI," update voice-profile.md with the specific fix so it doesn't happen again
