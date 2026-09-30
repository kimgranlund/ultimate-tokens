---
kind: verdict
plan: gates-batch
unit: U2
ticket: 776
branch: unit/gb-U2
base: ddeddfbd
grade: L2
pass: 1
written: 2026-09-30
---

# gates-batch U2 verdict, pass 1 (rework 1)

verdict: 🟡
sha: 3ddbffbc1417c1f21c602c61b7720b3ad6a33d0a

Checker: verifier-l2 (opus) outside the sonnet builder family (R79). C5 and U2-10 graded by plan revision 4 (943d4b08), which admits generated `src/ui/*-assets.js` whose bytes are generator output. Every control ran in a throwaway clone at the named sha.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| C1 | 🟢 | clone `full` at `3ddbffbc`: `npm test` exit 0, last line `✓ all 54 test files passed`, `grep -c "^▶" npmtest.log` = `54`, `git status --short \| wc -l` = `0` after; wall 2:45 (above the 80 to 130 s band, host had another suite running) | `"scrim` to `"scrimX` in `docs/reference/data/role-table.json`, `node test/engine/semantic.mjs`: `FAIL  refs-canonical, ordered key set != canonical`, `FAIL: 1 gate failure(s)`, exit 1 |
| C2 | 🟢 | `node test/repo/em-dash.mjs \| tail -1`: `em-dash: clean (1017 files scanned)`, exit 0 | `printf '\xe2\x80\x94' >> .sdlc/plans/gates-batch.md`: `✗ .sdlc/plans/gates-batch.md:206`, exit 1 |
| C3 | 🟢 | `git diff --name-only <base>..HEAD -- test/run.mjs .sdlc/baseline.md \| wc -l` = `0` for base `17edb2d2` and `ddeddfbd` | a commit appending `// x` to `test/run.mjs`: same command prints `1` |
| C4 | 🟢 | `git diff --name-only <base>..HEAD -- src/engine/tonal.js src/engine/hct.js src/engine/okhsl.js src/ui/model.mjs test/engine \| wc -l` = `0` for both bases | a commit appending `// x` to `src/engine/tonal.js`: prints `1` |
| C6 | 🟢 | clone `full`: `node scripts/report-preset-fidelity.mjs --identity-control --base 17edb2d2 \| tail -1` = `0 differing cells` exit 0; same with `--base ddeddfbd` = `0 differing cells` exit 0; tree clean after | `--identity-control --base 17edb2d2 --perturb`: `1 differing cells`, exit 1 |
| U2-1 | 🟢 | `node test/repo/citations.mjs \| tail -1`: `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 11 fact pins + 35 count phrases (HEAD 3ddbffbc)`, exit 0 | U2-2 to U2-8 controls below; the per-pin rework control is under U2-8 |
| U2-2 | 🟢 | append `The engine exports eight colour formats.` to `adding-export-formats/SKILL.md`: `✗ .claude/skills/adding-export-formats/SKILL.md: line 160: \`eight colour formats\` but the code holds 10 (fact pin "skill colour formats", src/ui/overlays/drawer.js)`, exit 1 | same plant at `ddeddfbd` and at `8945c618`: `✓ citations: ... 11 fact pins`, exit 0, no `✗` |
| U2-3 | 🟢 | append `Eight voices ride the ramp.` to `type-scale/SKILL.md`: `✗ ... SKILL.md: line 107: \`Eight voices\` but the code holds 15 (fact pin "skill type voices", ...)`, exit 1 | same plant at `ddeddfbd` and `8945c618`: exit 0, no `✗` |
| U2-4 | 🟢 | append `The factory returns fourteen voices.` to `type-scale/references/foundations.md`: `✗ .claude/skills/type-scale/references/foundations.md: line 245: \`fourteen voices\` but the code holds 15`, exit 1 | same plant at `ddeddfbd` and `8945c618`: exit 0 |
| U2-5 | 🟢 | the plan's `node -e` extractor prints `13 voices,five voices,thirteen voices`, each row with a reason; clean tree green (U2-1) | delete the `thirteen voices` row: `✗` at `type-scale/references/best-practices.md:118`, `foundations.md:52` (`Thirteen voices`), `foundations.md:101`, exit 1; delete the `13 voices` row: `✗` at `SKILL.md:73` and `references/best-practices.md:77`, exit 1; delete `five voices`: `✗ foundations.md: line 60`, exit 1 (no allow is dead); `reason: ""`: `✗ ... allow entry without a phrase + reason: {"phrase":"five voices","reason":""}`; reason key dropped: same message, exit 1 |
| U2-6 | 🟢 | append `hundred voices`: `✗ ... line 107: \`hundred voices\` ...: \`hundred\` is outside the parser's range (one to ninety-nine)`, exit 1; instead append `two interactive voices`: `✓ citations: ... + 35 count phrases`, exit 0 | magnitude words cut from `numTok` (a silently skipping grammar): `hundred voices` plant exits 0; qualifier widened to `(?:\\w+ )?` (a grammar that spans an adjective): 8 `✗` lines incl. `line 107: \`two interactive voices\``, exit 1 |
| U2-7 | 🟢 | `sed s/ten colour formats/eight colour formats/g` (2 hits) on `adding-export-formats/SKILL.md`: `✗ ... doc no longer carries \`ten colour formats\`` plus `✗ ... line 18: \`eight colour formats\`` and `line 71`, exit 1 | same flip at `ddeddfbd`: only the needle line `✗ ... doc no longer carries`, exit 1, proving the two phrase lines come from U2 and the needle leg is unchanged |
| U2-8 | 🟢 | `grep -oE 'COUNT_PHRASE_FLOOR = [0-9]+'` = `COUNT_PHRASE_FLOOR = 25` (10 <= 25 <= 35 - 5) | every `noun` stripped (`grep -c 'noun: "'` = `0`): `✗ ... count phrases: only 0 read, below COUNT_PHRASE_FLOOR 25`, exit 1. Rework-1 per-pin floor: misspelling each pin's noun to `zz<noun>` at `bca0a33a` and at `08096abb` exits 0 for `type voices` (34 phrases), `colour formats` (32), `roles per palette` (32), `skill colour formats` (31), reds only `skill type voices` via the total floor; at `3ddbffbc` each of the five reds naming its own pin, e.g. `✗ ... count phrases: fact pin "roles per palette" read 0 phrases for noun \`zzroles?\``. The reviewer repro (`noun: "fromats"` plus planted `eight colour formats`) exits 0 with `+ 31 count phrases` at `bca0a33a` and `08096abb`, and at `3ddbffbc` reds `fact pin "skill colour formats" read 0 phrases for noun \`fromats\``, exit 1 |
| U2-9 | 🟢 | `grep -cE "3-step SM/MD/LG ramp\|each voice.s SM/MD/LG are literal\|\[SM, MD, LG\] literal px" src/engine/type.mjs` = `0`; `grep -ciE 'UI-control and UI-widget\|XS(\.\.\| to )2XL'` = `4`. Content true: `typeScale(DEFAULT_TYPE)` gives `voices 15 steps 51`, step keys `SM,MD,LG` for 13 voices and `XS,SM,MD,LG,XL,2XL` for `UI-control`, `UI-widget` (`SIZES` rows of length 6, `RANKS6`) | base `ddeddfbd` prints `3` and `1`; restoring only line 10 (the 2026-07-13 paragraph the issue did not name) prints `1` |
| U2-11 | 🟢 | at head: `symbol homes: 37 checked, 0 stale` (U1-6, unchanged from the U1 reading the handoff cites), `✓ citations: ... 11 fact pins` (U1-1); U1-7 plant `` `brandKit` in `persist.js` `` in `type-scale/SKILL.md`: `✗ ... SKILL.md:107 \`brandKit\` is not defined in src/ui/persist.js`, `38 checked, 1 stale`, exit 1 | U1-6 control, bare leg forced to `continue`: `symbol homes: 27 checked` plus `✗ ... only 27 citations read, below SYMBOL_HOME_FLOOR 30`, exit 1; U1-7 plant at `8945c618`: `27 checked, 0 stale`, exit 0 |
| U2-12 | 🟢 | `grep -c -E 'every voice is now a 3-step\|11 named voices\|the eleven named voices\|all 33 steps' src/ui/sections/typography.js` = `0`; `grep -ciE 'fifteen (named )?voices\|15 (named )?voices\|51 steps'` = `3`. Counts true against the engine (15 voices, 51 steps, 13 x 3 + 2 x 6) | base `ddeddfbd` prints `4` and `0`; restoring only the tokens-matrix comment (`the eleven named voices, engine order`) prints `1` |
| C5 | 🟢 | name list (both bases `17edb2d2`, `ddeddfbd`): `src/engine/type.mjs src/ui/describe-mcp-assets.js src/ui/sections/typography.js`; comment-stripped `wc -l` = `0`, `0`. The third path is the generated asset; in a clone at `3ddbffbc`, `node scripts/gen-describe-mcp-assets.mjs` then `git status --short \| wc -l` = `0` (bytes are generator output), and C1's full `npm test` left the tree clean. Decoded payload: only the `src/engine/type.mjs` entry differs, comment-stripped equal to base | code token `Object.keys` to `Object.values` in `typography.js`: stripped `wc -l` prints `0`, `4`. Generated-asset clause: `printf '// hand\n' >> src/ui/describe-mcp-assets.js`, commit, rerun the generator: `git status --short` prints ` M src/ui/describe-mcp-assets.js` |
| U2-10 | 🟡 | as C5, met under revision 4. Concern: the handoff's U2-10 row reports the name list as `src/engine/type.mjs src/ui/sections/typography.js`, which the command does not print (it prints the generated asset too) | as C5 |

## Findings

1. 🟡 Handoff record: the U2-10 row misstates the C5 name list (omits `src/ui/describe-mcp-assets.js`). The substance is met; the record is stale.
2. 🟡 `src/ui/sections/typography.js:534`: the trailing clause `since the 2026-07-13 fixed-size-table rewrite` dates the six-step UI ramp to 07-13; it arrived 2026-07-16 (`src/engine/type.mjs:41`, TKT-0008). Invisible to U2-12's grep.
3. 🟡 The rework-1 per-pin floor is `>= 1` read per pin, as asked. A narrowed (not misspelled) noun keeps one read and drops the rest: `roles?` to `role` still reads `a 53-role`, and a planted `52 roles` exits 0. Not a U2 criterion.
4. Process: plan revision 4's C5 change was not re-reviewed for checkability, and C5 keeps the comment-strip rewrap flaw flagged in checkability pass 4 (a comment rewrap leaves whitespace-only lines that read nonzero). It read `0` here, so no false red for this unit.
5. No review record exists for U2 on the branch or main.
6. Out of lane, not graded: `typography.js:672`, `:1002-1003`, `:1012` still say eleven voices; filed as #782.
7. U2-5 plan paraphrase is loose: removing the `thirteen voices` allow row does not red `SKILL.md:73`; removing the `13 voices` row does. Gate behaviour is correct.
8. C1 wall time was 2:45, above the 80 to 130 s band, with another suite running on the host.
