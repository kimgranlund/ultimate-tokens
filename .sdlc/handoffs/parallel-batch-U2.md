# parallel-batch U2 handoff (builder, #783 outside citations)

| Field | Value |
|---|---|
| Unit | U2, branch `unit/pb-U2`, base `61bcd123` |
| Head | `1d2f65c1` (code); this handoff is the next commit |
| Result | 🟢 C2.1 to C2.5 met; 🟡 two things the plan text got wrong, below |
| Lane | `figma/binder/mode-apply-plan.mjs`, `test/repo/em-dash.mjs`, `.sdlc/adapter.md` §1, plus the regenerated `figma/plugin/ui.html` (npm test rewrites it). `ds-export.js` and the fixtures dir are untouched |

## Result

| Id | Result |
|---|---|
| C2.1 | `GEOMETRY_FIELD_RENAME_MAP` and its header comment deleted from `mode-apply-plan.mjs` (10 lines). The canonical copy and comment stay in `migrations.mjs`; the references in `code.js` and `test/figma/plugin.mjs` to "its own header comment" resolve there. `npm test` green |
| C2.2 | Fixture `E1 single-quoted heading` added to the self-test table in `test/repo/em-dash.mjs`. Self-test PASS |
| C2.3 | Already clean at the base: `--fix` in a clone at `61bcd123` left `ds-export.js` untouched and the gate printed `clean`. No hand edit was needed |
| C2.4 | One bullet appended to adapter §1 "Rules the gates imply" carrying the four pitfalls, one needle per line; slice count 4, baseline `ok    head:` count 1 (unchanged) |
| C2.5 | `git diff --name-only 61bcd123..HEAD` lists the lane files and `ui.html` only |

## Negative controls (each in a clone of `61bcd123` at `/Users/kimba/.claude/jobs/8c58a81c/tmp/pb-U2/clone`, `git rev-parse --short=8 HEAD` printed `61bcd123`; the change under test copied in from the working tree, not cloned)

- C2.1: the export line appended to the edited `mode-apply-plan.mjs`: the first grep prints one line (`:514`).
- C2.1 recorded claim: `padding: "paddin-narrow"` planted in the fourth copy at the base, then `node test/figma/binder.mjs`: exit 0, `PASS`. The issue's claim holds, the copy was unguarded.
- C2.2: the `"'"` entry removed from the quote list of `enclosingStringContent` (`em-dash.mjs:346`, the one E1 reads): `self-test: FAIL 1 case(s)`, `E1 single-quoted heading: matched R8, expected R2s`.
- C2.3: the dash re-planted after `**Foreground ...**` on `ds-export.js:769`: the gate printed `src/engine/ds-export.js:769` and exited 1.

## Plan text that did not hold

- C2.1's second grep is file-level, so it names `test/figma/plugin.mjs` and `test/figma/binder.mjs`. Both import the map from `migrations.mjs`, not `mode-apply-plan.mjs` (binder.mjs also does `import * as MAP` of the planner but never reads `MAP.GEOMETRY_FIELD_RENAME_MAP`). The ran block below uses the plan revision 5 form instead (`git grep -n "GEOMETRY_FIELD_RENAME_MAP.*mode-apply-plan"` and `git grep -nE "\b(MAP|A)\.GEOMETRY_FIELD_RENAME_MAP"`, covering the `A` alias in `live-diff.mjs`, `migrations.mjs`, `mode-apply.mjs`), both exit 1.
- `em-dash.mjs` carries two copies of the quote-list loop (`:229` and `:346`). Only `:346` (`enclosingStringContent`) feeds E1; reverting `:229` alone would not red the new fixture.
- Adapter pitfall 1: the plan said a `code.js` diff prints nothing; measured, it prints `Binary files ... differ` with no hunks, and `--text` restores them (checked with `git diff --text HEAD~400`). The paragraph says what was measured.

## Gates

`npm test`: `✓ all 54 test files passed`, exit 0, at the code head `1d2f65c1`'s tree, run when the process probe printed 4 (the Orchestrator's relaxed bound of 5). `node test/repo/em-dash.mjs` and `node test/repo/branding.mjs` clean. `npm run build` not run (no `src/`, `scripts/` change; `figma/binder/` touched, but `npm test` runs `gen:figma-assets` and `bundle`, and the diff is the deletion only).

## Claims

| Claim | Needle | Anchor | Kind |
|---|---|---|---|
| a `code.js` diff prints `Binary files ... differ` and no hunks under `.gitattributes` `-diff` (`git check-attr` reads `diff: unset`) | `diff: unset` | `.sdlc/adapter.md` | present |
| `--text` restores the hunks | `Binary files` | `.sdlc/adapter.md` | present |
| fixture greps anchor on the label field, prefix-tolerant form `name: ".*<words>` | `name: "` | `.sdlc/adapter.md` | present |
| on a plan branch the merge-base against origin/main is the plan's fork point and also lists earlier merged units' files; use the unit base | `unit base` | `.sdlc/adapter.md` | present |
| a comment-stripped diff reads a legitimate comment rewrap as nonzero (a false red); drop whitespace-only lines on both sides | `comment rewrap` | `.sdlc/adapter.md` | present |
| the deleted copy is gone | `export const GEOMETRY_FIELD_RENAME_MAP` | `figma/binder/mode-apply-plan.mjs` | absent |
| the E1 single-quote pin exists | `E1 single-quoted heading` | `test/repo/em-dash.mjs` | present |

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
# C2.1
grep -rn "GEOMETRY_FIELD_RENAME_MAP" figma/binder/mode-apply-plan.mjs
git grep -n "GEOMETRY_FIELD_RENAME_MAP.*mode-apply-plan" -- figma src scripts test; echo "exit $?"
git grep -nE "\b(MAP|A)\.GEOMETRY_FIELD_RENAME_MAP" -- figma src scripts test; echo "exit $?"
# C2.2
node test/repo/em-dash.mjs 2>&1 | head -1
grep -c "single-quoted heading\|singleQuote" test/repo/em-dash.mjs
# C2.3
node test/repo/em-dash.mjs | tail -1
git diff --stat 61bcd123..HEAD -- src/engine/ds-export.js | wc -l | tr -d ' '
# C2.4
awk '/^## 1/,/^## 2/' .sdlc/adapter.md | grep -c "diff: unset\|name: \"\|unit base\|comment rewrap"
sh .sdlc/checks/baseline-agrees-check.sh | grep -c "ok    head:"
# C2.5
git diff --name-only 61bcd123..HEAD
# claims
grep -c 'diff: unset' .sdlc/adapter.md
grep -c 'Binary files' .sdlc/adapter.md
grep -c 'name: "' .sdlc/adapter.md
grep -c 'unit base' .sdlc/adapter.md
grep -c 'comment rewrap' .sdlc/adapter.md
# pass 2: pitfalls 1, 3, 4 measured
S=/Users/kimba/.claude/jobs/8c58a81c/tmp/pb-U2-b2
# pitfall 1
sed -n 11p .gitattributes
git check-attr diff -- figma/binder/figma-semantic-binder/code.js
# pitfall 3: scratch repo, main plus a plan branch carrying one merged unit and a second unit cut after
rm -rf $S/r3
G="git -C $S/r3"
git init -q $S/r3 && $G config user.email a@b.c && $G config user.name n && $G commit -q --allow-empty -m root
$G checkout -q -b plan && echo 1 > $S/r3/u1.txt && $G add . && $G commit -q -m u1
$G checkout -q -b unit2 && echo 2 > $S/r3/u2.txt && $G add . && $G commit -q -m u2
$G branch -m main root 2>/dev/null; $G branch -f main $($G rev-list --max-parents=0 plan)
echo "fork-point list: $($G diff --name-only $($G merge-base main unit2)..unit2 | wc -l | tr -d ' ')"
echo "unit-base list: $($G diff --name-only $($G merge-base plan unit2)..unit2 | wc -l | tr -d ' ')"
# pitfall 4: rewrap-only edit under the comment strip
printf 'const a = 1; // one long comment that\n// wraps here\nconst b = 2;\n' > $S/a.js
printf 'const a = 1; // one long comment that wraps here\nconst b = 2;\n' > $S/b.js
printf 'const a = 1; // one long comment that\n// wraps here\nconst b = 3;\n' > $S/c.js
norm() { sed 's|//.*$||' "$1" > "$1.s"; grep -v '^[[:space:]]*$' "$1.s" > "$1.n"; }
for f in a b c; do norm $S/$f.js; done
echo "rewrap, strip: $(diff $S/a.js.s $S/b.js.s | grep -c '^[<>]')"
echo "rewrap, strip + drop blanks: $(diff $S/a.js.n $S/b.js.n | grep -c '^[<>]')"
echo "code edit, strip + drop blanks: $(diff $S/a.js.n $S/c.js.n | grep -c '^[<>]')"
~~~

~~~out ran
aee7bdf7
exit 1
exit 1
self-test: PASS
1
em-dash: clean (1173 files scanned)
0
5
1
.sdlc/adapter.md
.sdlc/handoffs/parallel-batch-U2.md
.sdlc/reviews/parallel-batch-U2-review.md
figma/binder/mode-apply-plan.mjs
figma/plugin/ui.html
test/repo/em-dash.mjs
1
1
2
1
1
figma/binder/figma-semantic-binder/code.js linguist-generated -diff
figma/binder/figma-semantic-binder/code.js: diff: unset
fork-point list: 2
unit-base list: 1
rewrap, strip: 1
rewrap, strip + drop blanks: 0
code edit, strip + drop blanks: 2
~~~

## Pass 2 (builder, rework of the adapter bullet)

The review `.sdlc/reviews/parallel-batch-U2-review.md` failed the adapter half only; the code half (`1d2f65c1`) is untouched. Only `.sdlc/adapter.md` (the new §1 bullet) and this handoff changed.

| Finding | Fix |
|---|---|
| F1 pitfall 4 inverted | Measured myself in scratch (`ran` block, last three lines): a rewrap-only edit reads `1` under `sed 's|//.*$||'` (the review's sample read `2`; the count depends on how many comment lines the rewrap drops), `0` once whitespace-only lines are dropped on both sides, a real code edit still reads `2`. The bullet now says the strip leaves whitespace-only lines so a rewrap is a false red, names the cure, and adds the blind spot after a `//` inside a string (checked: `"http://a"` vs `"http://b"` strips to the same text) |
| F2 pitfall 3 wrong mechanism | The bullet names the merge-base form and its hazard (the plan's fork point also lists files of earlier merged units) and the unit-base form `git merge-base plan/<slug> HEAD`. The live repo cannot show it yet (no wave A unit has merged, so both lists are equal), so the `ran` block builds a throwaway repo: fork-point list `2`, unit-base list `1` |
| F3 pitfall 2 | "and in the plan" dropped; says comment prose in the same file; adds `name: ".*<words>` for labels with an `E1 ` prefix |
| F4 pitfall 1 | `.gitattributes` `-diff` (line 11; `git check-attr` reads `diff: unset`), printed in the `ran` block; the C2.4 needle kept |
| F5 C2.1 grep | Widened to the plan revision 5 form, both exit 1 (see `ran`) |
| Claims rows | Pitfalls 3 and 4 rows now state the corrected claim; pitfall 1 and 2 rows reworded to match. Each has a measured line in `ran`, not only a needle |

Notes. Line 1 of the `out` block is the head before this pass 2 commit (`aee7bdf7`); C2.5's list now includes the review and this handoff, both already on the unit branch. C2.4's slice count is `5` (plan says `4` or more), baseline `ok    head:` count `1`. The `ran` block runs under `sh` and writes only under `/Users/kimba/.claude/jobs/8c58a81c/tmp/pb-U2-b2`.

`npm test`: `✓ all 54 test files passed`, exit 0, `NODE_OPTIONS` unset, process probe printed 4 (bound 5), tree clean after apart from the two edited files. `node test/repo/em-dash.mjs` and `branding.mjs` clean.
