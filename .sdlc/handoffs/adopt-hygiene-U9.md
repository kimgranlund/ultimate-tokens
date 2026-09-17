---
kind: handoff
unit: U9
plan: adopt-hygiene
base: 5d4492d
built: 2026-09-17
---

# U9 handoff: pre-land fixes, round 4

Branch `unit/hygiene-U9` from `sdlc/adopt` @ 5d4492d. Two commits.

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

## Criterion 3's wider grep: correction (pass 2)

Pass 1 of this handoff undercounted here: it named four files as the full explanation for a file
count of five and left the fifth unaccounted, which is exactly how it missed a second false claim
in the same file it had already partly fixed. The review (`adopt-hygiene-U9-review.md` B1) caught
it: `.claude/skills/shipping-changes/references/foundations.md:71` read "CI was unaffected because
it always `npm install`s", the same false claim as `SKILL.md:32` and `foundations.md:21`, two lines
below the fix pass 1 already made in that file. Fixed now to "because it always reinstalls from the
lockfile" (the true mechanism the sentence wanted, without naming a package-manager command CI does
not run).

The literal command (`git grep -c 'npm install' -- .claude/skills .sdlc ... | wc -l`) counts files
containing the substring at all, not just false CI claims, so it still reads `5`, not `0`, after
this fix: the substring "npm install" is still present, truthfully, in five files. Four are true
content unrelated to this defect: `.sdlc/debt.md:53` and `.sdlc/survey.md:73,77` correctly describe
`pages.yml` (a different workflow that does use `npm install` by design, C1's own row),
`.sdlc/tickets/T-0001.md:81` quotes the verification grep pattern itself, and
`.claude/skills/maintaining-brand-kit-mcp/SKILL.md:28` says "No `npm install`" about the unrelated
MCP server, not CI. The fifth is `foundations.md` itself: it still legitimately says "npm install"
at line 66 ("`npm install`/`npm ci` is the source of truth"), a true, unrelated statement.

To make the false-claim check independent of manual review, I built and ran a tighter pattern that
isolates the "CI installs with npm install" belief instead of the bare substring:

`git grep -nE 'CI[^.]{0,60}npm install|npm install\`s|always[^.]{0,20}npm install|npm install[^.]{0,60}CI' -- .claude/skills .sdlc ':!.sdlc/verdicts' ':!.sdlc/handoffs' ':!.sdlc/plans'`

Before this fix it printed exactly one line (`foundations.md:71`); after, it prints none. It does
not fire on any of the five true-content lines above, including the two other "CI"-adjacent
mentions in `debt.md:53` and `survey.md:77` (both name `pages.yml`, never bare "CI", within the
window). I did not touch the four true-content files or `.sdlc/survey.md` (out of scope for this
unit); scrubbing a true statement to force the plain substring count to `0` would hide nothing and
fix nothing.

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
  commit); `node test/repo/branding.mjs` → `clean (431 files scanned)`.
- Plan-level P1 to P5: rerun after commit, all as written (P1 tree-stable `0`).

## Deviations from the plan

None that weaken a criterion. Two are documented above: the second file needing the `npm install`→
`npm ci` fix (foundations.md, not in the plan's file list, same defect class) and the two
already-noisy check commands (criterion 1's path loop, criterion 3's wider grep) whose remaining
non-zero output is prose/true-statement noise, not a real defect, reported rather than hidden.

## Pass 2 (2026-09-17), after review verdict

`adopt-hygiene-U9-review.md` graded the unit 🟡, blocking on B1: `foundations.md:71` still carried
the false "CI always `npm install`s" claim, two lines below the fix pass 1 made in the same file at
line 21. Pass 1's own criterion 3 accounting named four files for a count of five and never
resolved the fifth, which is how the second instance in the same file was missed. Fixed as detailed
above in "Criterion 3's wider grep: correction (pass 2)". Also acted on M2 (a handoff cannot name
its own commit's id): the frontmatter now names the base commit instead of a self-referential sha.

Criteria 1, 3, 5, 6 rerun after the fix, with controls:

- Criterion 1: `grep -c 'docs/spec/CHANGELOG.md' .sdlc/records/cards/OD-004.md` → `0`, unchanged.
  Control: `sed -i '' 's/CHANGELOG.md/docs\/spec\/CHANGELOG.md/' .sdlc/records/cards/OD-004.md` then
  rerun prints `1`; reverted.
- Criterion 3: `grep -c 'npm ci' .github/workflows/ci.yml` → `3`, unchanged. The new false-claim
  regex (above) prints no line at head; control: restoring the pre-fix `foundations.md:71` text in
  a scratch copy makes it print exactly that one line again.
- Criterion 5: `u8check.sh` nine lines unchanged and matching Expected; `wording-check.sh origin/main
  HEAD` → `plan-authored em dashes: 0, bold labels: 0`, exit 0 (the rewritten line 71 removes the
  pre-existing em dash on that line rather than carrying it into a new added line, so it does not
  trip the guard).
- Criterion 6: `npm test` → all 44 test files passed; `git status --porcelain | wc -l` → `0` (after
  commit); `node test/repo/branding.mjs` → clean.

No other file changed in this pass.
