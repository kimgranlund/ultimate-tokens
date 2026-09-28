# Handoff U3 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/dr-U3 @ 0d1ebb55 |
| Files | docs/lld/app-shell.md, docs/reference/references/component-inventory.md, docs/reference/app-shell-patterns.md, .claude/skills/building-editor-sections/SKILL.md, src/ui/app.js, src/ui/persist.js, src/engine/geometry.mjs, figma/plugin/ui.html (regenerated), src/ui/describe-mcp-assets.js (regenerated), .sdlc/baseline.md (build row KB figure) |
| Left out | none |

## Ran

| Id | Criterion | Command | Output | Control |
|---|---|---|---|---|
| U3-1 | colorMode has 4 states, app-pref persistence stated | grep this.colorMode/`_appPrefsKey`/fontMode in app-shell.md + colorMode: this.colorMode in app.js | `1`,`1`,`1`,`1` | at $B: `0`,`0`,`0` |
| U3-2 | wireframe voice count matches engine | grep 11/15 voices + makeVoices() | `0`,`1`,`15` | at $B: `1`,`0` |
| U3-3 | mixinInto cite lands on call line, audit OK | cite-line grep, sed line check, audit-citations.mjs | cite=2581, `1`, `1` | at $B: cite=2570, audit reads NEAR (-2) |
| U3-4 | deleteMode retired in skill | grep deleteMode/deleteTypeMode/deleteGeomMode + method existence + 2 References rows | `0`,`1`,`1`,`1`,`1`,`1`,`1` | at $B: `1`,`0`,`0`,`1`,`1`,`0`,`0` |
| U3-5 | 5 factory rows say app-helpers.mjs, 2 stay app.js | per-function table-row grep × 5 + export check + segmented/slider row | ten `1`s, then `1`,`0` | at $B: five doc-row greps `0` |
| U3-6 | dead ~/.claude link replaced | grep ui-patterns/, ui-pattern-facts, ~/ | `0`,`1`,`0` | at $B: `1`,`0`,`1` |
| U3-7 | three headers | head -1 app.js/persist.js + geometry.mjs path grep + src-wide grep | `0`,`1`,`1`,`0`,`0` (post-npm-test) | at $B: `1`,`0`,`0`,`1`,`2` |
| U3-8 | fact sheet untouched | git diff --name-only $B -- docs/marketing \| wc -l | `0` | any edit under docs/marketing prints 1+ |
| U3-9 | source diff comments-only, baseline moved with bundle | numstat + baseline diff grep | `2 2` geometry.mjs, `1 1` app.js, `22 31` persist.js (header fold restored, F3); baseline `1` | a non-comment line added to persist.js would make P4's middle command 1+ |
| P1 | npm test green, count 50, tree stable | npm test; TESTS count; git status --short | `✓ all 50 test files passed`, `50`, tree stable at 10 files (pre-commit) | scratch clone, role-table.json scrimX tamper: `✗ 1/50 test file(s) failed` |
| P2 | npm run build green, baseline agrees | npm run build; baseline-agrees-check.sh | `wrote figma/plugin/ui.html 4125.5 KB` reproduced twice, `stale total: 0` | reverting the KB figure to 4125.3 reads `STALE ui.html: baseline 4125.3 KB, tree 4125.5 KB` |
| P3 | branding clean, no added prose line carries an em dash, raw count equals the count stated and listed here | branding.mjs; the plan's two dash counts on the diff | `branding: clean`, `0`, then raw `2` (the two lines listed under Pass 1 fix, both a quoted `persist.js` header inside a code span) | pass 1 verdict caught five rewritten reactivity review lines that kept a prose glyph; each was rewritten with a colon, comma or parentheses, stripped count 5 to 0, raw 7 to 2 |
| P4 | scope wall, source diff comment-only | name-only grep against allow-list; comment-only diff on the 3 headers; test/scripts/CI untouched; DD row check | `0`,`0`,`0`,`0` | fixture of 4 mixed paths through the first filter: `2` (matches plan's own control) |
| P5 | citations gate live in npm test | grep test/run.mjs; node test/repo/citations.mjs | `1`, `✓ citations: parser self-test + STALE 0 across 10 discovered docs` | control not re-run this pass (U3-3's own audit-citations.mjs control above exercises the same predicate on the mixinInto line) |
| P6 | stale count strings gone (plan-level, spans U1/U2/U4 too) | grep for the 8 stale strings across docs+skills; FORMAT_GROUPS count | `12` (not `0`: U3 only owns `11 voices`, now `0`; the other 11 hits are ui-plan.md/SKILL.md/spec-draft.md strings owned by U1/U2, still pending), `10` | at $B: `15` |

## Notes

- P6 will not read `0`/`10` clean until U1 and U2 land; U3's own slice (`11 voices` -> `15 voices`) is done and verified above.
- P3's first pass surfaced 5 em dashes introduced by this unit's own new prose (the app-shell.md persistence-exception paragraph and the app.js/persist.js header lines); all five were rewritten to drop the glyph, and the branding/dash gates were re-run clean before commit.
- Negative controls for U3-1 through U3-7 were run against a scratch `--shared` clone of this branch, checked out at a detached worktree pinned to `$B` (origin/main), never in this unit worktree.
- `npm test` and `npm run build` both ran green in this worktree before commit; the tree is clean after (`git status --short` prints nothing at HEAD).

## Pass 1 fix (verdict rows P3, S7, F3)

Figures below are true at the commit that carries this handoff, measured with the plan's P3 commands against B = 282fca8d.

- P3 stripped count (first command): `0`. Raw count outside handoffs (second command): `2`.
- The two remaining lines quote the retired `persist.js` header, inside a code span, in the sentence "was never touched and". Each is quoted here word for word, with the glyph written as the token U+2014 because this handoff may not carry the character itself: `persist.js <U+2014> UI state persistence for the HCT Palette Generator.`
  1. `.sdlc/reviews/docs-repair-U3-progress.md` line 24, in a parenthesised quote.
  2. `.sdlc/verdicts/docs-repair-U3-review.md` line 50, in a parenthesised quote.
- The five reactivity review lines (`01` finding 1, `02` B4, `03` HIGH 1, `03` LOW 5 and the voice-rename bullet) now carry no glyph. A cite that a colon or comma rewrite left alone was kept.
- F3: the `src/ui/persist.js` header again states the `serialize(state)` and `hydrate(snapshot)` contracts, the byte-for-byte round-trip sentence and the TKT-0016 pointer, and line 1 no longer says hydrate reads from storage. Comment-only: with full-line `//` comments and blanks stripped the file equals B's.
- The header is now 22 added lines (was 16), so every `persist.js` line cite the reactivity reviews re-pointed moved by +6 again; each was re-pointed and `node test/repo/citations.mjs` reads `STALE 0`.
- U3-9's numstat for `persist.js` moves from `16 31` (plan revision c7eafe2d) to `22 31`; `geometry.mjs` `2 2` and `app.js` `1 1` are unchanged. The plan is not edited.
