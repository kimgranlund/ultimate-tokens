# Handoff U8 pass 1 · builder to verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U8 @ b3584192 |
| Base | plan/docs-repair @ 152bf923 |
| Merge | `origin/main` at 3631b7a2 merged at 5dcf23b9 (seventeen conflicting files); `origin/main` moved to 79aadcda during that merge (a board row and the plan copy sync), merged at a18c23cd with no conflict |
| Files at b3584192 | eleven `git mv` of `.sdlc/verdicts/docs-repair-U*-review*.md` to `.sdlc/reviews/`; `test/repo/citations.mjs:81` (pin (d) reads `Object.keys(...roleTable).length`); `docs/reference/references/ui-plan.md:51` (Geometry Notes cell names the ladder prototype ramp exception); `.sdlc/baseline.md` (one correction paragraph, the build row's cell unchanged) |
| Files in this handoff commit | .sdlc/handoffs/docs-repair-U8.md |
| Ran | the `~~~sh ran` block below at b3584192 in `.worktrees/dr-U8` by `F=<tmp> HF=<tmp> bash ran.sh`, output pasted unedited; `npm ci` before it, so `npm run build` and smoke had `node_modules`; `pgrep -f '^node test/run.mjs' \| wc -l` read `0` before each heavy run; `git status --short` empty after |
| Left out | P1, P2, P5, P6, P7, P8 (plan-wide, the verifier's); P3 and P4 legs are in Figures |

## Decisions

1. U8-2's third leg counts every `docs-repair-U<n>-review*` file in `.sdlc/verdicts/`, and at a18c23cd that was eleven, not the five step 2 names. The other six (`U1-review`, `-p2`, `-r2`, `U3-review`, `-r2`, `U5-review`) carry a `verdict:` line somewhere, so the gate passed them, but they are review records. All eleven moved so the row reads `0`. Older records that cite `.sdlc/verdicts/docs-repair-U*-review*.md` paths are merged history and were not edited.
2. U8-5 expects `stale total: 0`, but the check prints `stale total: 1` at b3584192. The one STALE line is `time test: baseline 167 to 268 s, adapter 80 to 89 s`, the R53 exception main recorded (`.sdlc/questions/gg-U2b-p2-time-stale.md`, "keep quiet figure, carry STALE"). A clone at origin/main 79aadcda prints the same `stale total: 1`; the plan head 152bf923 prints `0`. The merge brought the line in, and clearing it needs new timed runs or an adapter edit, both outside this unit. No `ui.html` line is STALE: the merged bundle reads 4118.0 KB, the build row's figure. This is a plan defect in the Expected cell.
3. `.sdlc/plans/docs-repair.md` conflicted because main carried an older synced copy. I kept this branch's revision 16 whole. The second merge showed main's re-synced copy is identical to it.
4. The pre-commit hook refused the first merge commit: the auto-merged `.sdlc/board.md` still carried this branch's stale docs-repair rows. Per the brief, the board is main's side with nothing changed.
5. Lines both sides edited got one merged line each. `building-editor-sections/SKILL.md:82-83`: this plan's `deleteTypeMode`/`deleteGeomMode` line and main's dash-free Mode-local line. `quality-rubric.md` B4: main's `### B4: Exports` heading and this plan's `ten color formats` line. `glossary.md`: main's Parity row plus this plan's nine UI rows. `.sdlc/baseline.md`: main's build row plus both sets of corrections. Where a line this plan rewrote kept a dash main had removed (`app-shell-patterns.md:18`, `persist.js:50`, `docs/reference/SKILL.md:10`), the dash became a comma, the same way main changed it. For lines in the three reactivity reviews and `docs/reference/SKILL.md` that this plan left alone, main's version was used.
6. Pin (d) is written `Object.keys(JSON.parse(...).roleTable).length`. `roleTable` is an array, so that is its length. The form also matches U8-3's `roleTable\)\.length` grep.

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
# setup
git fetch -q origin; B=$(git merge-base origin/main HEAD)
# U8-1
git merge-base --is-ancestor 3631b7a2 HEAD && echo merged; git grep -n -E '^(<<<<<<<|>>>>>>>|=======$)' -- . ':(exclude)*.snap' | wc -l
# U8-2
node test/repo/verdict-frontmatter.mjs | tail -1; node test/repo/em-dash.mjs | tail -1; ls .sdlc/verdicts/ | grep -c -E '^docs-repair-U[0-9]+-review'
# U8-3
grep -n -E 'roleTable\)\.length|semanticRoles\.length' test/repo/citations.mjs | wc -l; bash -c 'set -o pipefail; node test/repo/citations.mjs | tail -1'
# U8-4
sed -n '51p' docs/reference/references/ui-plan.md | grep -c -i 'ladder'
# U8-5
npm test 2>&1 | tail -1; npm run build > "$F/b.log" 2>&1; echo "exit $?"; git status --short | wc -l; sh .sdlc/checks/baseline-agrees-check.sh | tail -1; npm run smoke 2>&1 | grep -c 'SMOKE PASS'
# P3
tail -1 <(node test/repo/branding.mjs)
~~~

~~~out ran
b3584192
merged
       0
✓ verdict-frontmatter: verdicts 195 graded 195 bad 0, planted 2
em-dash: clean (875 files scanned)
0
       1
✓ citations: parser self-test + STALE 0 across 10 discovered docs + 6 fact pins (HEAD b3584192)
1
✓ all 54 test files passed
exit 0
       0
stale total: 1
1
branding: clean (867 files scanned)
~~~

## Negative controls

Run in a `git clone -q --shared` of the worktree under the job tmp dir, never on the branch.

| Row | Control | Printed |
|---|---|---|
| U8-1 | the tree at a731a3cf | nothing, then `0` |
| U8-2 | `git mv .sdlc/reviews/docs-repair-U2-review.md .sdlc/verdicts/` at b3584192 | `MISSING docs-repair-U2-review.md: no verdict: line`, `✗ 1 verdict-frontmatter gate failure(s)`; the count leg `1` |
| U8-3 | a 54th `roleTable` entry appended to `role-table.json`, `rolesPerPalette` left at 53, the new `citations.mjs` | `✗ docs/reference/data/role-table.json: fact pin "roles per palette": docs/reference/references/ui-plan.md says \`a 53-role\` but the code holds 54`, `✗ 1 citation gate failure(s)`, `exit 1` |
| U8-4 | `ui-plan.md` line 51 at a731a3cf | `0` |
| U8-5 | P1's and P2's controls, the verifier's | not run |

## Figures

At b3584192: `npm test` `✓ all 54 test files passed`, `npm run build` exit 0 with `wrote figma/plugin/ui.html 4118.0 KB`, smoke `SMOKE PASS` once, tree clean after all three. `B` is 79aadcda. P3: `branding: clean (867 files scanned)`, `0`, `2`. The two raw lines are the U3 records U7 already named, `.sdlc/reviews/docs-repair-U3-progress.md` and `.sdlc/reviews/docs-repair-U3-review.md`, now moved from `verdicts/`. Each quotes the old `persist.js` header: `` (`persist.js — UI state persistence for the HCT Palette Generator.`), was never touched and ``. P4 legs 1 and 2: nothing past the wall, `0`.
