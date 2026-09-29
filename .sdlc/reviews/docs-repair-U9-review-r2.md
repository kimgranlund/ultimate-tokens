PASS: docs-repair U9 round 2 at `90d9a11c`: the planner count and both `fit()` comments are fixed and true, the `app.js` change is comment-only, and no new false claim is added

# Review · docs-repair U9 · round 2 · reviewer-l3 (stand-in for fable, capped)

| Field | Value |
|---|---|
| Branch | unit/dr-U9 @ 90d9a11c (fix `10823ade` over review `c0fb8f69`) |
| Prior review | `.sdlc/reviews/docs-repair-U9-review.md` (FAIL, findings 1 and 2) |
| Ran | every command below at 90d9a11c in `.worktrees/dr-U9` by this seat; full `npm test` not rerun |

## Prior findings

| # | State | Evidence | Control |
|---|---|---|---|
| 1 Medium, "five planners" | 🟢 fixed | `figma/README.md:27-28` now reads "three planners (`bind-plan`, `mode-apply-plan`, `style-plan`), a live diff, the migration maps and one splice helper". It matches `style-plan.mjs:1-3` ("The third planner sibling: bind-plan.mjs ..., mode-apply-plan.mjs ..."), `live-diff.mjs:1` ("PURE comparison") and `migrations.mjs:1` ("migration maps"). Six modules still: `ls figma/binder/*.mjs` = 6. `:44` now says "each over the module it names": `test/figma/{mode-apply,style-plan,live-diff,migrations}.mjs` import `mode-apply-plan`, `style-plan`, `live-diff`, `migrations` respectively | at `c0fb8f69` the same line read "five planners and one splice helper" and "each over the planner it names" |
| 2 Low, "start centered" | 🟢 fixed | `app.js:1434` "start top-left inset (fit)" and `:1439` "fit() insets top-left" both match `fit()` `app.js:543-545` ("Reset to 100% with the content's TOP-LEFT corner inset (not dead-centered)"). `:1439` keeps "pan/zoom too (wirePanZoom), no saved viewport", which still holds (`typography.js:351`, `:370`; `geometry.js:423`, `:442`; only `_colorViewport` exists) | at `c0fb8f69` `:1434` read "start centered (fit)" and `:1439` "start centered" |

## Comment-only

`git diff c0fb8f69 90d9a11c -- src/ui/app.js`: two `-`/`+` pairs. `:1434` is a whole-line comment. `:1439` with the `+`/`-` prefix and the `//` tail stripped reads the same on both sides, so `sort | uniq -u | wc -l` prints `0`. The only `figma/plugin/ui.html` hunks (`git diff --text`) are the same two comment lines.

## New claims

No new false claim. The only new claims are the module classification and the two `fit()` phrasings above, and each one checks out against its source.

## Gates run by this seat

| Gate | Result |
|---|---|
| em dash | diff U+2014 count `0`; `em-dash: clean (879 files scanned)` |
| branding | `branding: clean (871 files scanned)` |
| citations | `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 6 fact pins (HEAD 90d9a11c)` |
| tree | `git status --short` empty before this commit |

## Info

| # | Where | Note |
|---|---|---|
| 1 | `.claude/skills/building-editor-sections/references/best-practices.md:29` | Makes the same claim "their scenes start centered", which predates this plan. Only that skill's `SKILL.md` is inside the scope wall, not `references/`. Follow-up chore, not a U9 blocker |
