---
kind: rediagnosis
plan: prompt-audit
unit: U6
ticket: "#758"
after: .sdlc/verdicts/prompt-audit-U6.md pass 1, 🔴 at 60fd4668
written: 2026-09-29
seat: planner, dispatched by the Orchestrator
plan-edits: revision 8 (U6-6 to U6-10, the SB8 row, P5, the grade table)
---

# U6 re-diagnosis: the reviews matched the recipe as text and took the plan's word for `ROLES`

Every plan row is 🟢 at 60fd4668 and the skill is still wrong in three places. Each miss has the same shape: the check read the skill's words, never the thing the words are about.

## 1. Root cause

| Finding | What the unit wrote | Why two reviews let it through |
|---|---|---|
| F1, `ROLES` derives | Step 5: `Some tests derive the count (semExpect, headless-boot's ROLES)` | The plan's own SB8 row says `(s4) derives`. Review r1 F7 called the claim true and its Kept-handles row cites `headless-boot.mjs` line 727, which reads `=== ROLES`; an imported name looked derived. Nobody opened `test/ui/counts.mjs`, where `export const ROLES = 53;` is a hand literal its header says is kept independent of the engine on purpose. Review r2 re-checked r1's F1 to F5 only |
| F2, the `\b` recipe finds nothing | `git grep -nE "\b<oldcount>\b" test` in three places of SKILL.md and two of best-practices.md | U6-3's needle is typed `'\\b37\\b'` so it can match the literal text of the old command; that proves the old text left, not that the new command works. Review r2 ran a real `\b37\b` in the seat shell, where ugrep and BSD grep both honour `\b`, saw `3`, and concluded `\b` works. The recipe is `git grep -E`, whose regex on this git (`2.54.0 Apple Git-157`) has no `\b`: every recipe prints `0` for `53`, `-w` prints `27` on `test` alone. Nobody executed a recipe as the skill prescribes it |
| F3, `semantic.mjs:30` | Untouched line 75 of `adding-semantic-roles/references/foundations.md` | The prose rule drops every `:NNN` pin, but its only needle is U6-2's `app.js:4046`. The reviewers' Prose row counts pins on added lines, a diff check, so a pre-existing pin in a file the unit edited passed. The real assert is at `:52`; the `(line ~23)` and `(line ~32)` approximations beside it are off too (`validPrim` is at `:44`, the scrim check at `:54`) |

The generic failure: a review verified the diff against the audit's hunks and the plan's needles; nothing verified the surviving file against the tree. A skill is a program the next agent runs, so the check that bites is to run it.

## 2. Pass 2 builder brief

Branch `unit/pa-U6` from 60fd4668, the same 13-file wall plus the U6 records. No source, test, script or generated file changes. `S=.claude/skills`.

1. `$S/adding-semantic-roles/SKILL.md` step 5 (F1). `ROLES` is a hand literal in `test/ui/counts.mjs`, shared by headless-boot's `(s4)` and the smoke test, so a role-count change edits it; name the file. `semExpect` (`test/figma/plugin.mjs`) does derive from the bundle and may stay in the derived clause. The handoff's SB8 row names `test/ui/counts.mjs`.
2. Every count search in SKILL.md (step 5, the sweep in the parenthetical, the verify line) and in `references/best-practices.md` (the sweep bullet, the closing `37|49` line) (F2). Replace `-nE "\b<oldcount>\b"` with `-nw "<oldcount>"` and the historical pair with `-nwE "37|49"`. No `\b` on any `git grep` line of the skill. Run each recipe with `53` substituted before committing; each prints hits (`27`, `229`, `63`, `229`, `6` at 60fd4668 with `-w`).
3. `references/foundations.md` (F3). Drop the `:30` pin: cite the `scrims.length !== 7` assert by its gate name (`roles`) and file only. Replace `(line ~23)` and `(line ~32)` with the symbols, `validPrim` and the `roles` gate's `okScrim`. `references/best-practices.md`: drop `(line ~132)` after the knowledge-03 anecdote (it sits at `:153` now); the file and phrase locate it.
4. The 🟡 items on lines U6 touched. `geometry-system/references/rubric.md` G7: `REF` holds only `height`, `icon`, `font`, so a caret or `GAP_UNIT` retune updates the `caret's own ramp` assert or `GAP_UNIT` block, not `REF` (F4). `geometry-system/references/best-practices.md`: the composition test asserts `JSON.stringify(composed) === JSON.stringify(base)` (message `value-neutral at defaults`), which implies frame equality; there is no `composed.paddingNarrow === standalone.paddingNarrow` assert and no `bodyBase` assert, the override assert is `"UI-control|MD": 17` flowing into `MD.font` (F5). `adding-export-formats/SKILL.md` step 4: the groups are `Colors`, `Typography`, `Geometry`, `Design System`, `Project`, not by destination (F6); the ds-export paragraph lists every name in `ds-export.js`'s `./exports.js` import (F7). `color-math/SKILL.md`: cite `hydrateStoredDoc` as `` `hydrateStoredDoc` (`src/ui/app-helpers.mjs`) `` so U9's scanner resolves it (F8).
5. Handoff (F9): headed pass 2, names the head code commit and B, `Ran` figures re-measured at that commit (branding `810`, em-dash `818` at 60fd4668; re-read after the edits), P6 removed count re-read.
6. Rerun U6-1 to U6-5, P3 to P6, and U6-6 to U6-10 below. `npm test` green, tree clean.

## 3. New criteria rows

Commands run in the unit worktree; `S=.claude/skills`, `H=.sdlc/handoffs/prompt-audit-U6.md`, `F` the seat's scratch directory. No cell carries a pipe character: loops read from process substitution, counts come from `awk 'END{print NR}'`. Each control was run at 60fd4668 and prints what the last column says.

| Id | Criterion | Command | Expected | Negative control | At 60fd4668 |
|---|---|---|---|---|---|
| U6-6 | the skill says what `ROLES` is | `R=$S/adding-semantic-roles/SKILL.md; grep -c '^export const ROLES = 53;' test/ui/counts.mjs; grep -c -E 'derive[^.]{0,80}ROLES' <(tr '\n' ' ' < $R); grep -c 'test/ui/counts.mjs' $R; grep -c -E '^. SB8 .*counts\.mjs' $H` | `1` (the literal exists), `0`, `1` or more, `1` | a copy of the pass 2 SKILL.md with step 5's sentence restored from 60fd4668 prints `1` on the second grep | `1`, `1`, `0`, `0` |
| U6-7 | every count search the skill prescribes finds hits on this tree, and none uses `\b` | `bt=$(printf '\x60'); while IFS= read -r c; do eval "$c" > "$F/hits" 2>/dev/null; printf '%s ' "$(awk 'END{print NR}' "$F/hits")"; done < <(sed -E -e 's/<oldcount>/53/g' -e "s/.*(git grep [^$bt]+).*/\1/" -e t -e d $S/adding-semantic-roles/SKILL.md $S/adding-semantic-roles/references/best-practices.md); echo; grep -c -F '\b' <(grep -h -F 'git grep' $S/adding-semantic-roles/SKILL.md $S/adding-semantic-roles/references/best-practices.md)` | five counts, each `1` or more (measured with `-w`: `27 229 63 229 6`), then `0` | a copy with one recipe typed back to `-nE "\b<oldcount>\b"` prints `0` in that position and `1` on the last grep | `0 0 0 0 0`, then `5` |
| U6-8 | no line pin or line approximation remains in the wall | `while IFS= read -r f; do grep -n -E '\.[a-z]{2,4}:[0-9]+' "$f"; grep -n -E '\(line ~[0-9]+\)' "$f"; done < <(git ls-files $S/geometry-system $S/adding-export-formats $S/adding-semantic-roles $S/color-math/SKILL.md $S/figma-file-migration/SKILL.md) > "$F/pins"; awk 'END{print NR}' "$F/pins"; grep -c 'scrims.length !== 7' test/engine/semantic.mjs` (`\.[a-z]{2,4}:[0-9]+` reads any `file.ext:NNN` pin without an alternation, so the cell carries no pipe) | `0`, `1` | the files at 60fd4668 print `4` (`semantic.mjs:30`, `(line ~23)`, `(line ~32)`, `(line ~132)`); `adding-export-formats/references/rubric.md`'s `(~line 433)` is a different shape, outside the wall, and stays U9's | `4`, `1` |
| U6-9 | the 🟡 claims on touched lines match the code | `G=$S/geometry-system/references; E=$S/adding-export-formats/SKILL.md; grep -c 'unless the \x60REF\x60 table' $G/rubric.md; grep -c 'composed.paddingNarrow === standalone.paddingNarrow' $G/best-practices.md; grep -c 'value-neutral' $G/best-practices.md; grep -c -E 'larger type .bodyBase. scales the geometry .font' $G/best-practices.md; grep -c 'by DESTINATION' $E; while IFS= read -r g; do printf '%s ' "$(grep -c -F "$g" $E)"; done < <(awk '/const FORMAT_GROUPS = \[/{f=1;next} f&&/^    \];/{exit} f{match($0,/\["[^"]+"/); print substr($0,RSTART+2,RLENGTH-3)}' src/ui/overlays/drawer.js); echo; while IFS= read -r n; do n=${n// /}; [ -n "$n" ] && printf '%s ' "$(grep -c "\x60$n\x60" $E)"; done < <(tr ',' '\n' < <(sed -n 's/^import {\(.*\)} from ".\/exports.js".*/\1/p' src/engine/ds-export.js)); echo; grep -c 'hydrateStoredDoc\x60 (\x60src/ui/app-helpers.mjs\x60)' $S/color-math/SKILL.md` | `0`, `0`, `1` or more, `0`, `0`, five group counts each `1` or more, thirteen import counts each `1` or more, `1` | a copy with step 4's group list restored prints `1` on `by DESTINATION` and `0` for `Colors`; the group and import legs read the engine, so a renamed group or a new import reds them until the skill follows | `1`, `1`, `0`, `1`, `1`, `0 1 1 0 1`, `2 2 2 1 1 1 1 0 0 2 0 1 2`, `0` |
| U6-10 | the handoff is measured at the commit it describes | `grep -c -F "$(tail -1 <(node test/repo/branding.mjs))" $H; grep -c -F "$(tail -1 <(node test/repo/em-dash.mjs))" $H; grep -c "$(git log -1 --format=%h -- .claude/skills)" $H` | `1`, `1`, `1` | the handoff at 60fd4668 carries `807`, `815` and `91b6f571` while the tree prints `810`, `818` and `60fd4668` | `0`, `0`, `0` |

U6-7 is the row the question asked for: it runs the skill instead of reading it, and it reds whenever any prescribed search returns nothing on the live tree, which is also the row that would have caught the audit's original SB9. If the plan is reopened, its shape (extract each command a skill prescribes, run it, require hits) belongs in P-level for every unit whose files carry a recipe.

## 4. Plan defects fixed in revision 8

SB8's Re-verification cell (`(s4)` derives) rewritten to what the tree says; the U6 grade row reads thirteen files and pass 2 grades; P5's second grep is compared with the id count plus the handoff's review rows (`F<n>`), and its bare-pipe control, which errors under BSD grep instead of biting, is replaced by a deleted-row fixture. U6-2 is left as is: U6-8 carries the leftover-pin needle for the whole wall.
