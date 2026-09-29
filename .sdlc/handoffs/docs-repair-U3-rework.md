# Handoff U3 rework · builder reply to review finding 1

| Field | Value |
|---|---|
| Branch | unit/dr-U3 @ a18c3531 |
| Files | src/ui/persist.js |
| Ran | grep-only checks, no npm test/build (quiet window) |
| Left out | none |

## Finding 1 (fixed)

persist.js's original mid-file header still named the retired product. Folded its content
(paraphrased, not moved verbatim, so the diff stays add-only and comment-only against the
surrounding code) into the new line-1 header, and deleted the stale mid-file block outright.
One canonical header now, no duplication.

Verified: `head -1` starts `// persist.js`, `HCT Palette Generator` count 0, added-line em-dash
count 0 at a18c3531 (stripped 5 and raw 7 at 50a7f464 before the pass 1 fix, 2 raw at the fix commit; see docs-repair-U3.md), P4 comment-only diff on app.js/persist.js/geometry.mjs reads 0, numstat 1 1 / 16 31 / 2 2 at a18c3531 (persist.js is 22 31 after the pass 1 fix),
branding clean (724 files scanned).

## Finding 2 (pushing back, not reverting)

app-shell.md:13 losing the backticks around `HctApp` is intentional, required by U3-3.
`audit-citations.mjs` picks the FIRST anchor it finds on the citing line; with both `HctApp` and
`mixinInto` backtick-hugged, it reported "matched HctApp" instead of mixinInto, failing U3-3's
literal criterion (needs "matched `mixinInto`"). Unbackticking HctApp on that one line removes it
as a candidate anchor so the audit correctly attributes the cite. Recommend keeping as-is.

## Resume pass (2026-09-28)

Kept the four reactivity review docs (persist.js cite line numbers shifted by the header rework) and the two regenerated mirrors (ui.html, describe-mcp-assets.js); nothing stray to restore.
`npm test` green (all 50 test files passed) under heavy host load. Baseline ui.html figure re-pointed 4125.5 to 4124.3 KB with a correction paragraph; `baseline-agrees-check.sh` reads `stale total: 0`.
Commits: 0f001caa (review docs and mirrors), then the baseline commit on unit/dr-U3 (see git log).
