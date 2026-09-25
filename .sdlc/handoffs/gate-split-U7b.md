---
kind: handoff
plan: gate-split
unit: U7b
branch: unit/gs-U7b
pass: 1
---

# U7b handoff: CLAUDE.md npm test figure

Owner ruling R38 (`.sdlc/questions/gate-split-claude-md.md`, chosen "Yes, update both
(Recommended)"): the `npm test` figure in `.claude/CLAUDE.md` moves from "~60 s" to
"80 to 90 s", nothing else in the file changes.

## Grep for other "60 s" mentions

```
$ grep -n "60 s" .claude/CLAUDE.md
95:  (no `node_modules`, ~60 s, tree clean after), `npm run build` (needs `npm ci`), `npm run smoke`
```

Only one mention in the whole file, at line 95 (the SDLC bullet). The ruling's own text says
the figure appears in both Commands and SDLC bullets, but on this branch it appears once, only
in the SDLC bullet; the Commands bullet does not state a timing figure. Changed exactly the one
line found.

## Diff

```diff
diff --git a/.claude/CLAUDE.md b/.claude/CLAUDE.md
index e048fde1..c030dc84 100644
--- a/.claude/CLAUDE.md
+++ b/.claude/CLAUDE.md
@@ -92,7 +92,7 @@ planning, building, or landing. The one-paragraph version:
   (commits carry `Seat: orchestrator`); the Verifier's 🟢 verdict is what "done" means. A builder's
   own green `npm test` is its floor (see Always), not the verdict.
 - Gates and what green means live in `.sdlc/adapter.md` §1 and `.sdlc/baseline.md`: `npm test`
-  (no `node_modules`, ~60 s, tree clean after), `npm run build` (needs `npm ci`), `npm run smoke`
+  (no `node_modules`, 80 to 90 s, tree clean after), `npm run build` (needs `npm ci`), `npm run smoke`
   (needs Chrome). Run them in the unit worktree, never in a tree another seat is editing.
 - Tickets, PRs, and releases go through `adapter.py` (`.sdlc/config.json`, preset `github`); one
   ticket, one `plan/<slug>` branch, one PR per plan. Landing needs a 🟢 pre-land record
```
