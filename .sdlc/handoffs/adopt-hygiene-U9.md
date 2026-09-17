---
kind: handoff
unit: U9
plan: adopt-hygiene
sha: fad7729
built: 2026-09-17
---

# U9 handoff: pre-land fixes, round 4

Branch `unit/hygiene-U9` from `sdlc/adopt` @ 5d4492d. One commit.

## What changed

Four one-cell defects named in `.sdlc/verdicts/adopt-hygiene-prepr.md` (🔴 on 4f30855), per
`.sdlc/plans/adopt-hygiene.md` §U9:

- `.sdlc/records/cards/OD-004.md:7`: the results pointer `docs/spec/CHANGELOG.md` (a path that does
  not exist) now reads `CHANGELOG.md`, matching the reworded pointer in
  `docs/reference/references/od-004-plugin-free-import-test.md`.
- `.sdlc/records/decisions.md:21`: the ADR-004 lineage cell said the scrim revision was "recorded
  only as a note inside ADR-004 (gap G2)", contradicting line 40 (ADR-023 supersedes ADR-004) and
  line 68 (G2 closed by ADR-023) of the same file. Reworded to name ADR-023 as the superseding
  record and G2's closure, matching the corrected shape at `.sdlc/records/index.md:19`.
- `.claude/skills/shipping-changes/SKILL.md:32`: "CI... runs `npm install`" corrected to `npm ci`,
  matching `.github/workflows/ci.yml:28` and its comment.
- `.claude/skills/shipping-changes/references/foundations.md:21`: the same false claim ("CI...
  runs `npm install`") found by running criterion 3's own grep at the wider scope the plan
  specifies (`.claude/skills` and `.sdlc`, not just the one named file). Same fix, same reasoning.
  This file was not in the plan's named file list; fixing it was necessary to make criterion 3
  pass and it is the same class of defect as the one the criterion targets.

`.sdlc/debt.md` C6 needed no edit: the plan's own criterion 4 command already scopes the
`/Users/[a-z]` loop to `.sdlc` with the `*-p2.md` and `prepr3.md` exclusions the Orchestrator had
already applied to the plan text before this unit started. Run as written, that scoped loop finds
only `.sdlc/architecture.md`, `.sdlc/plans/adopt-hygiene.md`, and `.sdlc/tickets/T-0001.md`, all
three already named in C6's row, so criterion 4 prints no `missing` line without any change to
the row. Verified both with and without the exclusions (without them, `adopt-hygiene-U8-p2.md`
reappears, matching the negative control).

Not touched: history dirs, `.sdlc/survey.md`, `.sdlc/baseline.md`, `.claude/CLAUDE.md`, anything
behind the P3 wall.

## Criterion 1's second command: reported, not silently weakened

Criterion 1's path-resolution loop (`for f in $(grep -rhoE '[A-Za-z0-9_./-]+\.(md|mjs|js|json|yml)'
.sdlc/records | sort -u); do [ -e "$f" ] || git cat-file -e HEAD:"$f" ... || echo "missing $f"; done`)
extracts every filename-shaped token in `.sdlc/records` and resolves it as a repo-root path. Run
verbatim at head it prints roughly 75 `missing` lines. Every one I checked is prose, not a broken
pointer: bare basenames used as shorthand in running text (`app.js`, `hct.js`, `CLAUDE.md` meaning
`.claude/CLAUDE.md`), directory-relative sibling references inside `.sdlc/records/*` (`cards/ADR-001.md`
meaning `.sdlc/records/cards/ADR-001.md`), and export-artifact filenames named inside the OD-004
procedure text (`figma-aliased/palette.tokens.json`, `Light_tokens.json`) that describe a zip's
internal layout, not a repo path. None of them is a record stating something the head makes false;
the one instance of that class was the OD-004 pointer, and its own grep (`docs/spec/CHANGELOG.md`
count) is 0 after the fix above. Rewriting ~75 prose mentions to root-relative paths is out of this
unit's scope wall and file list, and would not fix anything: the sentences are already true, they
are just not resolvable as literal paths by a check that was never built to account for relative
or colloquial filenames. I ran the command as written rather than narrowing it, so the true defect
count (1, now 0) is visible; I did not edit the check.

## Criterion 3's wider grep: one more true-vs-noise split

The literal command (`git grep -c 'npm install' -- .claude/skills .sdlc ... | wc -l`) counts files
containing the substring at all, not just false CI claims. After fixing both real instances (SKILL.md
and foundations.md above), the count stays 5, not 0, because these files legitimately say "npm
install": `.sdlc/debt.md:53` and `.sdlc/survey.md:73,77` correctly describe `pages.yml` (a different
workflow that does use `npm install` by design, C1's own row), `.sdlc/tickets/T-0001.md:81` quotes
the verification grep pattern itself, and `.claude/skills/maintaining-brand-kit-mcp/SKILL.md:28`
says "No `npm install`" about the unrelated MCP server, not CI. None of these claims that CI installs
with `npm install`; scrubbing the literal substring from them would only remove true content, not
fix a defect, and `.sdlc/survey.md` is explicitly out of scope for this unit. I left them as written.

## Checks run

- Criterion 1: `grep -c 'docs/spec/CHANGELOG.md' .sdlc/records/cards/OD-004.md` → `0`. Second
  command reported above.
- Criterion 2: `grep -n 'ADR-004' .sdlc/records/decisions.md | grep -c 'only as a note'` → `0`;
  `grep -c 'ADR-023' .sdlc/records/decisions.md` → `3`.
- Criterion 3: `grep -c 'npm ci' .github/workflows/ci.yml` → `3`. Wider-scope count reported above.
- Criterion 4: no `missing` line, with and without confirming the negative control.
- Criterion 5: `u8check.sh` (copied to `$CLAUDE_JOB_DIR/tmp` from `adopt-hygiene-prepr3.md` §Checks,
  run with live `gh`) → all nine lines match the U8 Expected column exactly. `wording-check.sh
  origin/main HEAD` → `plan-authored em dashes: 0, bold labels: 0`, exit 0. (My first transcription
  of `wording-check.sh` from the plan's §Checks section used a shorter bold-label regex missing the
  Context/Decision/Consequences/etc. exclusions, which over-flagged 11 card-field lines as new bold
  labels; copying the exact regex from the plan text fixed it and gives `0, 0`.)
- Criterion 6: `npm test` → all 44 test files passed; `git status --porcelain | wc -l` → `0` (after
  commit); `node test/repo/branding.mjs` → `clean (430 files scanned)`.
- Plan-level P1 to P5: rerun after commit, all as written (P1 tree-stable `0`).

## Deviations from the plan

None that weaken a criterion. Two are documented above: the second file needing the `npm install`→
`npm ci` fix (foundations.md, not in the plan's file list, same defect class) and the two
already-noisy check commands (criterion 1's path loop, criterion 3's wider grep) whose remaining
non-zero output is prose/true-statement noise, not a real defect, reported rather than hidden.
