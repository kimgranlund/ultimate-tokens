# Handoff docs-stale-batch U2 pass 1 · builder to lane reviewer

| Field | Value |
|---|---|
| Branch | unit/dsb-U2 @ 53aa63e1 |
| Base | plan/docs-stale-batch @ 17edb2d2 |
| Files at 53aa63e1 | .claude/skills/building-editor-sections/references/best-practices.md (the `setSection(id)` bullet: `this.fit()` for non-color now says it resets the viewport to zoom 1 and insets the scene's top-left corner via `_fitTopLeftInset`, not centered and not at the color pan) |
| Files in this handoff commit | .sdlc/handoffs/docs-stale-batch-U2.md |
| Ran | the `~~~sh ran` block below at 53aa63e1 in `.worktrees/dsb-U2`, output pasted unedited; `npm test` at 53aa63e1: `✓ all 54 test files passed`, exit 0, 89 s, `git status --porcelain` empty after the commit (one line, the edited Markdown, before it); P5 at 53aa63e1 lists only the one `.md` path; P3, P4 at this commit |
| Left out | `npm run build` and smoke (no `node_modules`, owed at pre-land); P6 (U4 only) |
| Deciders opened | `fit()` in `src/ui/app.js` (zoom 1, `_fitTopLeftInset` call) |

## Decisions

1. The probe for the `condition` row is U2-2's `awk` with the `grep -c -E 'a\|b'` replaced by an in-awk sum (`n+=(/zoom: 1/ ? 1 : /_fitTopLeftInset/ ? 1 : 0)`), because a pipe inside a ledger cell splits P3's `IFS='|'` read. It counts the same lines and prints `3`.
2. The `~~~sh ran` block carries U2-1, U2-2 and P2 only, per the plan's record shape (P1, P3, P4, P5 are in the `Ran` row).
3. P2's two lines are cut to their first two words (`| cut -d' ' -f1-2`): the branding scan's file count includes this handoff, so the verbatim line differs between the code sha and the handoff commit and P4 could never print SAME. Plan defect; the plan's Expected (`em-dash: clean` / `branding: clean`) is unchanged.

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
# U2-1
f=.claude/skills/building-editor-sections/references/best-practices.md; grep -c 'start centered' "$f"; grep -c '_fitTopLeftInset' "$f"; grep -c '_fitTopLeftInset' src/ui/app.js
# U2-2
awk '/^  fit\(\) \{/,/^  \}/ {n+=(/zoom: 1/ ? 1 : /_fitTopLeftInset/ ? 1 : 0)} END {print n}' src/ui/app.js
# P2
node test/repo/em-dash.mjs | tail -1 | cut -d' ' -f1-2; node test/repo/branding.mjs | tail -1 | cut -d' ' -f1-2
~~~

~~~out ran
53aa63e1
0
1
4
3
em-dash: clean
branding: clean
~~~

## Claims

| Claim | Needle | Anchor | Kind |
|---|---|---|---|
| `fit()` insets the scene's top-left corner through the named helper | `_fitTopLeftInset` | `src/ui/app.js` | present |
| non-color scenes do not start centered | `start centered` | `.claude/skills/building-editor-sections/references/best-practices.md` | absent |
| `fit()` sets zoom 1 and schedules the helper (three lines) | `3` | `awk '/^  fit\(\) \{/,/^  \}/ {n+=(/zoom: 1/ ? 1 : /_fitTopLeftInset/ ? 1 : 0)} END {print n}' src/ui/app.js` | condition |
