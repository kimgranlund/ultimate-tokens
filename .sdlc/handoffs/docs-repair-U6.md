# Handoff U6 pass 1 · builder to verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U6 @ 08cdec61 |
| Base | plan/docs-repair @ 5c139146 |
| Files at 08cdec61 | test/repo/citations.mjs (block (4), `FACT_PINS`, six pins; the pass line gains ` + 6 fact pins`) |
| Files in this handoff commit | .sdlc/handoffs/docs-repair-U6.md |
| Ran | the `~~~sh ran` block below at 08cdec61 in `.worktrees/dr-U6`, output pasted unedited as `~~~out ran`; `npm test` at 08cdec61: `✓ all 50 test files passed`, exit 0, `git status --short` empty after |
| Left out | no build, no smoke (no `node_modules`; U6 touches no bundled file). The controls edit and restore in the worktree (`git checkout -- .`), not in a clone |

## Notes

| Item | What ran |
|---|---|
| U6-4 regex | the plan cell's `\|` inside `grep -E` is a literal pipe, so the cell as written prints `0` on `source: () => 15` (vacuous); the block carries `\|` with the escape removed, and `printf 'source: () => 15,\n' \| grep -c -E '...(53\|15\|10\|4)\b'` prints `1` while the escaped form prints `0` |
| U6-1 control | `git show 5c139146:test/repo/citations.mjs \| grep -c FACT_PINS` printed `0` |
| U6-2 parent control | on the parent's citations.mjs with `15 voices` to `11 voices` and the skill's `deleteTypeMode`/`deleteGeomMode` to `deleteMode`: `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 08cdec61)`, green, the gap this unit closes |
| U6-3 (b) | the stub returns 11 keys and the test's import line alone is pointed at it: `code holds 11` |
| U6-3 (f) | also reds the reactivity review's cite at line 63 of `02-sections-and-resolvers.md`, since the rename moves a cited line in `typography.js`; expected, that is the audit leg |
| U6-4 controls | `printf 'want: 15,\nwant: 150\n' \| grep -c want` printed `2`, the digit-regex fixture printed `1` |
| U6-5 control | registering one extra `.mjs` in a copy of `test/run.mjs` printed `51` for the first command |

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
B=5c139146; F=${F:-${TMPDIR:-/tmp}}
# U6-1
grep -c 'FACT_PINS' test/repo/citations.mjs; bash -c 'set -o pipefail; node test/repo/citations.mjs | tail -1'; echo "exit $?"
# U6-2
r() { out=$(node test/repo/citations.mjs 2>&1); echo "exit $?"; echo "$out" | grep -c '^  ✗'; echo "$out" | grep '^  ✗' | cut -c1-170; git checkout -q -- .; }
perl -pi -e 's/`system` \\\| //' docs/lld/app-shell.md; r
perl -pi -e 's/15 voices/11 voices/' docs/lld/app-shell.md; r
perl -pi -e 's/10 formats \(color\)/5 formats (color)/ if /T8 export:/' docs/reference/references/ui-plan.md; r
perl -pi -e 's/a 53-role/a 59-role/' docs/reference/references/ui-plan.md; r
perl -pi -e 's/`app-helpers\.mjs` \(pure\)/`app.js` (pure)/ if /^\| `btn\(\)` \|/' docs/reference/references/component-inventory.md; r
perl -pi -e 's/`deleteTypeMode`\/`deleteGeomMode`/`deleteMode`/' .claude/skills/building-editor-sections/SKILL.md; r
# U6-3
r() { out=$(node test/repo/citations.mjs 2>&1); echo "exit $?"; echo "$out" | grep -c '^  ✗'; echo "$out" | grep '^  ✗' | cut -c1-170; git checkout -q -- .; }
printf 'export const makeVoices = () => Object.fromEntries(Array.from({ length: 11 }, (_, i) => ["v" + i, {}]));\n' > "$F/stub.mjs"
perl -pi -e 's/this\.colorMode = "system"/this.colorMode = "light"/ if /Color section value-mode control/' src/ui/app.js; r
perl -pi -e 's/this\.colorMode = "system"/this.colorMode = "light"/' src/ui/app.js; r
perl -pi -e 's#\.\./\.\./src/engine/type\.mjs#'"$F"'/stub.mjs#' test/repo/citations.mjs; r
perl -pi -e 's/\["radix", "Radix"\], //' src/ui/overlays/drawer.js; r
perl -pi -e 's/"rolesPerPalette": 53/"rolesPerPalette": 59/' docs/reference/data/role-table.json; r
perl -pi -e 's/^export const btn = /export const btn2 = /' src/ui/app-helpers.mjs; r
perl -pi -e 's/^  deleteTypeMode\(id\) \{/  deleteTypeMode2(id) {/' src/ui/sections/typography.js; r
# U6-4
grep -c 'want' test/repo/citations.mjs; grep -c -E 'source: *(\(\) *=> *)?(53|15|10|4)\b' test/repo/citations.mjs; grep -c 'FACT_PINS' test/repo/citations.mjs
# U6-5
perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m), "\n"' test/run.mjs; git diff --name-only "$B" -- test/run.mjs | wc -l; git diff "$B" -- .sdlc/baseline.md | grep -c '^[+-]| \x60npm test\x60 |'; sh .sdlc/checks/baseline-agrees-check.sh | grep 'tests:'; node test/repo/citations.mjs | grep -c '^✓'
# P3
tail -1 <(node test/repo/branding.mjs)
~~~

~~~out ran
08cdec61
3
✓ citations: parser self-test + STALE 0 across 10 discovered docs + 6 fact pins (HEAD 08cdec61)
exit 0
exit 1
1
  ✗ docs/lld/app-shell.md: fact pin "colorMode states": doc no longer carries `system` on a line matching /`this\.colorMode`/
exit 1
1
  ✗ docs/lld/app-shell.md: fact pin "type voices": doc no longer carries `15 voices`
exit 1
1
  ✗ docs/reference/references/ui-plan.md: fact pin "colour formats": doc no longer carries `10 formats` on a line matching /T8 export:/
exit 1
1
  ✗ docs/reference/references/ui-plan.md: fact pin "roles per palette": doc no longer carries `a 53-role`
exit 1
1
  ✗ docs/reference/references/component-inventory.md: fact pin "btn home": doc no longer carries `app-helpers.mjs` on a line matching /^\| `btn\(\)` \|/
exit 1
1
  ✗ .claude/skills/building-editor-sections/SKILL.md: fact pin "delete mode methods": doc no longer carries ``deleteTypeMode`/`deleteGeomMode``
exit 1
1
  ✗ src/ui/app.js: fact pin "colorMode states": docs/lld/app-shell.md says `system` but the code holds false
exit 1
1
  ✗ src/ui/app.js: fact pin "colorMode states": docs/lld/app-shell.md says `system` but the code holds false
exit 1
1
  ✗ src/engine/type.mjs: fact pin "type voices": docs/lld/app-shell.md says `15 voices` but the code holds 11
exit 1
1
  ✗ src/ui/overlays/drawer.js: fact pin "colour formats": docs/reference/references/ui-plan.md says `10 formats` but the code holds 9
exit 1
1
  ✗ docs/reference/data/role-table.json: fact pin "roles per palette": docs/reference/references/ui-plan.md says `a 53-role` but the code holds 59
exit 1
1
  ✗ src/ui/app-helpers.mjs: fact pin "btn home": docs/reference/references/component-inventory.md says `app-helpers.mjs` but the code holds false
exit 1
2
  ✗ docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md: 1 STALE/NOFILE citation line(s): 63 (run `node scripts/audit-citations.mjs` for the mechani
  ✗ src/ui/sections/{typography,geometry}.js: fact pin "delete mode methods": .claude/skills/building-editor-sections/SKILL.md says ``deleteTypeMode`/`deleteGeomMode`` bu
0
0
3
50
       0
0
ok    tests: baseline 50, test/run.mjs TESTS 50
1
branding: clean (746 files scanned)
~~~
