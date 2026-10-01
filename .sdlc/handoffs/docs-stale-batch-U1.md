# docs-stale-batch U1 handoff (pass 1, rewritten at U7)

Only `figma/README.md` changed (three sentences). Base 2008659e. Rewritten in docs-stale-batch U7 to the ledger and ran-block shape (pre-land pass 1 finding 2): the old `Claim | Status | Evidence` table with `path:line` anchors is replaced by the `## Claims` ledger below, and the ran block is the replay at the named head.

| Id | Result |
|---|---|
| U1-1 | SCRIM_STRENGTH_STEPS / SCRIM_SUFFIXES / SCRIM_KEYS grep counts: 1 1 1 |
| U1-2 | README states 20 gates; `DECLARED` length at this base is 20 (gates-batch added `renameparity`, so the plan's 19 is stale; graded relative). SAME. `mode-apply-plan.mjs` count: 2 |
| U1-3 | `libraryparity` README 1, `executor path` README 0, `libraryparity` in test/figma/plugin.mjs 59 |
| U1-4 | no U+2014 in README; P3 and P4 on this file at the head named in the ran block |

`npm test` was skipped at the original cap (process probe printed 2, not under 2); it is green at the U7 head (`✓ all 54 test files passed`, exit 0). The README is not embedded anywhere, so no generated file moves for U1.

Decisions: the old ledger's `import of migrations.mjs` absent row was dropped, since `figma/plugin/code.js` has no such import and the claim it carried is the removed `executor path` sentence, now an absent row on the README itself. The stale comment on `figma/binder/migrations.mjs` line 3 that U1 did not report is fixed in U7.

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
# U1-1
for n in SCRIM_STRENGTH_STEPS SCRIM_SUFFIXES SCRIM_KEYS; do grep -c "$n" figma/README.md; done
# U1-2
R=$(grep -o -E '[0-9]+ gates' figma/README.md | head -1 | cut -d' ' -f1); D=$(node -e 'const s=require("fs").readFileSync("test/figma/binder.mjs","utf8");const m=s.match(/const DECLARED = \[([^\]]*)\]/);process.stdout.write(String(m[1].split(",").filter(Boolean).length))'); echo "$R $D"; [ "$R" = "$D" ] && echo SAME; grep -c 'mode-apply-plan.mjs' figma/README.md
# U1-3
grep -c 'libraryparity' figma/README.md; grep -c 'executor path' figma/README.md; grep -c 'libraryparity' test/figma/plugin.mjs
# P2
node test/repo/em-dash.mjs | tail -1 | cut -d' ' -f1-2; node test/repo/branding.mjs | tail -1 | cut -d' ' -f1-2
~~~

~~~out ran
bf3a73af
1
1
1
20 20
SAME
2
1
0
59
em-dash: clean
branding: clean
~~~

## Claims

| Claim | Needle | Anchor | Kind |
|---|---|---|---|
| the README names the three SCRIM constants the generator carries | `SCRIM_KEYS` | `scripts/gen-figma-binder-code.mjs` | present |
| the README's gate count is the `DECLARED` list length | `DECLARED` | `test/figma/binder.mjs` | present |
| the README says the flagship code.js keeps its own hand-mirrored voice map | `LIBRARY_TYPE_VOICE_MAP` | `figma/plugin/code.js` | present |
| the README names the `libraryparity` gate that checks the map | `libraryparity` | `test/figma/plugin.mjs` | present |
| the README no longer claims every executor path receives the same maps | `executor path` | `figma/README.md` | absent |
