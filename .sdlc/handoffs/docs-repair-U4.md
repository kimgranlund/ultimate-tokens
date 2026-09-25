# Handoff U4 · builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/dr-U4 @ a6ed8e0a |
| Files | figma/README.md (new) |
| Left out | none |

## Ran

| Criterion | Command | Output | Control | Control output |
|---|---|---|---|---|
| U4-1 file exists, names both plugins, both manifests, the generator, the skill | `test -f figma/README.md && echo ok; for n in 'plugin/manifest.json' 'figma-semantic-binder' 'gen:figma-ui' 'ui.html' 'maintaining-figma-plugins' 'test/figma'; do grep -c "$n" figma/README.md; done` | `ok` then `1 2 2 3 1 1` (each 1 or more) | same test against a scratch clone checked out at `B=282fca8d` | `test -f` fails, no `figma/README.md` present (`absent`) |
| U4-2 every module it names exists, every `binder/*.mjs` is named | `for f in $(grep -o 'binder/[a-z-]*\.mjs' figma/README.md \| sort -u); do test -f "figma/$f" \|\| echo "missing $f"; done; for f in figma/binder/*.mjs; do grep -q "binder/$(basename "$f")" figma/README.md \|\| echo "unnamed $f"; done` | nothing printed | a copy of the README with a fabricated `binder/splice.mjs` line appended; a second copy with the `binder/live-diff.mjs` line deleted | `missing binder/splice.mjs` on the first; `unnamed figma/binder/live-diff.mjs` on the second |
| U4-3 the unit changes one file | `git diff --name-only $(git merge-base plan/docs-repair HEAD)..HEAD` | exactly `figma/README.md` (run at commit a6ed8e0a, before this handoff's own commit) | staged an extra edit to `README.md` alongside `figma/README.md` before committing, then `git diff --cached --name-only` | printed both `README.md` and `figma/README.md`, proving an extra path would show in the list and red the row; the edit was reverted (`git checkout -- README.md`) before the real commit |
| U4-4 branding and dash rules | `node test/repo/branding.mjs \| tail -1`; `git diff "$B" -- . ... \| grep '^+'` piped through the em-dash check | `branding: clean (722 files scanned)`; `0` | in a scratch clone at `B`, copied `docs/reference/references/decision-records.md` (carries the retired brand name) over `.sdlc/verdicts/docs-repair-x.md` | `FAIL: 3 branding violation(s) across 720 files`, naming `.sdlc/verdicts/docs-repair-x.md` |
| Plan step (3): branding gate on the real tree | `node test/repo/branding.mjs` | `branding: clean (722 files scanned)` | same as U4-4's control | as above |
| P1 (applicable) `npm test` green, count agrees, tree byte-stable | `npm test 2>&1 \| tail -1`; TESTS count; `git status --short \| wc -l` | `✓ all 50 test files passed`, `50`, `1` (the one line is the new untracked/staged `figma/README.md` itself, expected before commit; no regenerated asset drifted) | adapter's own control (sed a role-table key) not re-run here; this unit touches no engine file, so P1's own control is unaffected by U4 | not applicable to this unit's own file; P1 is a plan-level gate re-verified whole-plan at pre-land |
| P3 (applicable) no added prose line carries an em dash | `git diff "$B" -- . ':(exclude)figma/plugin/ui.html' ':(exclude)src/ui/*-assets.js' ':(exclude)src/ui/categories' \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/\x60[^\x60]*\x60//g; print if /\x{2014}/' \| wc -l` | `0` | P3's own clone control (`cp docs/reference/references/decision-records.md .sdlc/verdicts/docs-repair-x.md`) reds the branding leg, exercised above under U4-4/plan step (3); the em-dash count itself was also checked directly against a first draft of this file that DID carry em dashes, which printed `8` before the rewrite | first draft: `8`; rewritten file (committed): `0` |
| P4 (applicable) scope wall | `git diff --name-only "$B" \| grep -v -E ... \| wc -l` (full allowlist regex from the plan) | `0` | plan's own fixture (`printf 'src/engine/tonal.js\nsrc/ui/model.mjs\ndocs/lld/app-shell.md\n.sdlc/plans/docs-repair.md\n'` through the same filter) not re-run here since it is a fixed fixture independent of this unit's diff; this unit's own diff was the only path filtered and it passed | not re-run (fixed fixture, plan-level) |

Note on scope: this handoff (`.sdlc/handoffs/docs-repair-U4.md`) is committed separately from the
source commit `a6ed8e0a`, per the P4 wall's own allowance for `.sdlc/(plans|handoffs|verdicts|reviews|questions)/docs-repair`.
U4-3 was run and quoted above at `a6ed8e0a`, the state where the unit's branch diff carries only
`figma/README.md`, before this handoff commit adds a second (allowed) path.
