---
kind: verdict
unit: U8
plan: adopt-hygiene
sha: 266d13e
base: 0aec4a8
pass: 2
reviewed: 2026-09-17
verdict: 🟢
---

# Verdict adopt-hygiene U8 (pass 2 review) · 🟢

Reviewed in fresh context on 2026-09-17 against `unit/hygiene-U8` @ 266d13e (worktree `.worktrees/hygiene-U8`, read only, left at status 0), unit diff 0aec4a8..266d13e, pass 2 delta d7cf7f4..266d13e (`.sdlc/debt.md` four notes, `.sdlc/records/index.md:52`, the handoff; nothing else). Criteria: root `.sdlc/plans/adopt-hygiene.md` §U8 (rows 1 and 3 revised). The three scripts were extracted from `.sdlc/plans/adopt-hygiene-prepr3.md` §Checks with `awk` and run from the worktree root. Controls ran in detached scratch worktrees at 61a3f90, d7cf7f4 and a mutable copy of 266d13e (all removed afterwards; `git worktree list` shows the root, the U8 worktree and one unrelated agent worktree). The handoff and the pass 1 verdict were read after the measurements, not used as evidence.

Verdict: 🟢, 0 blocking, 3 minor. All 13 criteria met with their controls; the independent debt audit found no note that disagrees with its row's evidence; no record this plan wrote says something the head makes false.

## Criteria

| # | Criterion | State | Evidence at 266d13e | Negative control |
|---|---|---|---|---|
| 1 | records index agrees with the head, PLAN-overhaul reads complete | 🟢 | `1 index stale: 0 reactivity: 1 ops-untracked: 1`, then `1`; `:19` names ADR-023, `:52` complete with the D2 carry, `:75` reactivity row, `:77` ops untracked, `:81` PRD gap closed | 61a3f90: `2 0 0`, then `0` |
| 2 | adapter: three appended amendments, no deletion since 80ae4d8 | 🟢 | `s2: 1 s3-ignores: 1 s8: 1 deletions-vs-80ae4d8: 0`; also 0 deleted lines vs b44883d | 61a3f90: `0 0 0 0` |
| 3 | every closing note agrees with its row's evidence (13 full, 8 partial), R12 trigger, wording block | 🟢 | `debt-closure-check.sh` prints no row line, exit 0; `3 debt disagreeing: 0 R12-trigger: 1 emdash: 0 bold: 0 counts: 7/7 45/45` | 61a3f90: twenty `no-note` lines, `disagreeing: 20`, exit 1; d7cf7f4: `false-close R6`, `false-close R8`, `false-close D2`, `false-close G2`, `4`, exit 1; scratch head copy: header planted in `ui.html` prints `half-gone G2`; `.gitattributes` removed prints `not-done G2`, `not-done G3`; overhaul items 1, 3, 4 ticked prints `half-gone D2`; D4 note dropped prints `no-note D4`; restored: `0` |
| 4 | decisions ledger gaps closed and rows updated | 🟢 | `gaps-closed: 5 rows: 1 1 1 1 1 G6: 1` | 61a3f90: all `0` |
| 5 | cards: no `active`, PLAN-overhaul closed, ADR-004 names ADR-023 | 🟢 | `active: 0 overhaul-closed: 1 adr004-names-023: 2` | 61a3f90: `2 0 0` |
| 6 | architecture K18 row and script | 🟢 | `vN: 0 snapshot: 1 script: 0` | 61a3f90: `1 1 0` |
| 7 | plan wording (branch copy) | 🟢 | `three-units: 0 bold-lead: 0 U8-listed: 1` | 61a3f90: `3 3 0` |
| 8 | shipping-changes: no "no hooks" claim, no pinned model | 🟢 | `stale: 0` | 61a3f90: `3` |
| 9 | project-docs SPEC row | 🟢 | `spec-absent: 0 spec-files: 2` | 61a3f90: `1 2` |
| 10 | no plan-authored em dash or bold label on added lines | 🟢 | `plan-authored em dashes: 0, bold labels: 0`, exit 0 | 61a3f90: the nine §2a lines and three plan labels, `9, 3`, exit 1; scratch head with the README:56 dash restored and committed: that line, `1, 0`, exit 1 (the script reads `git diff`, so the flip must be committed; a working-tree edit alone prints `0, 0`) |
| 11 | carried rows stay green | 🟢 | P1 `all 44 test files passed`, status 0; P2 `0`; P3 `0`; P4 `clean (427 files scanned)`; P5 `0`; U1-7 `moved 1 0`; U1-8 `4 2 0`; U1-11 `moved 1 0`; U1-12 `1`, block silent; U2-4 `0 1 1`; U6-1 `0 4`; U6-4 `1 1 1 1 0`; U7-2 `2`, corrected loop (`/Users/[a-z]`) prints nothing, clash block prints nothing, `0`, `0`, `7 / 7`, `45 / 45` | the old `/Users/` loop still prints the false `missing .sdlc/plans/adopt-hygiene-U7-p2.md` (pre-existing, revised away by the plan) |
| 12 | gates green, tree clean, branding clean | 🟢 | `npm test` exit 0, `✓ all 44 test files passed`; `git status --porcelain` 0 after the run; `branding: clean (427 files scanned)` | not rerun (P1 control measured by the pass 1 verifier on this branch) |
| 13 | board: U2 cell closed, U8 row present | 🟢 | root `.sdlc/board.md`: `follow-up` 0, `U8` 1 | b44883d per plan: `1`, `0` |

## Independent debt audit (every row with a closing or partial note, read against its own `where` cell and the head tree, not the script)

| Row | Note class | What I read | State |
|---|---|---|---|
| R1 | full | three `Amendment (2026-09-16)` blocks at `decision-records.md:158, :290, :394`; `lld-muted-base-key-spikes.md:221` names `resolve.mjs`; `go-live-runbook.md:33` names the `flagOf()` consumers; `describe-palette-spec.md:579` amended | 🟢 |
| R4 | full | `docs/plan/` holds only `archive/`; both archived plans `status: complete`; overhaul plan `**Closed 2026-09-16.**` at :79 | 🟢 |
| R7 | full | `## ADR-023` :669, `## ADR-024` :682; `docs/prd/prd-0001-app-shell.md` present | 🟢 |
| R11 | full | `.claude/CLAUDE.md:21` lists `gen:adia-exports` | 🟢 |
| C1 | full | `pages.yml:38-39` `node-version: 22`, `npm ci` | 🟢 |
| D1 | full | `git ls-files .claude/ops` empty; the human half (allow-list ruling) is adapter C6 `rm --cached` all seven | 🟢 |
| D3 | full | `.claude/workflow.json` `"canonical": ".sdlc/adapter.md"` | 🟢 |
| D4 | full | `.claude/docs/reports` untracked; `docs/reference/reviews/2026-08-20-reactivity/` 6 files | 🟢 |
| G3 | full | `.gitattributes` lists `src/ui/describe-mcp-assets.js` | 🟢 |
| G4 | full | `README.md:121` names `gen-font-test.mjs` | 🟢 |
| K11 | full | `.claude/CLAUDE.md:66-67` ratifies the `html:` exception with the count | 🟢 |
| K18 | full | §6.1 K18 block greps `test/ui/persist.mjs` for `schema-rename v4` (real case at :183); table row names the snapshot case | 🟢 |
| P4 | full (A5) | adapter §5 "The Orchestrator closes a plan on landing" | 🟢 |
| R3 | partial | `README.md:56` "interchange-only"; `drawer.js:38` label still `Figma UI3` with no interchange word | 🟢 |
| R6 | partial | `od-004-plugin-free-import-test.md:41` names root `CHANGELOG.md` (tracked); index OD-004 `OPEN` | 🟢 |
| R8 | partial | `describe-eval.yml:31-34` exits 1 with `::error::ANTHROPIC_API_KEY is not set`; `gh secret list` still `NPM_TOKEN` only; G6 "custody undecided" | 🟢 |
| G2 | partial | `.gitattributes` marks `ui.html` and the K9 set; first 300 bytes of `ui.html` carry no generated header | 🟢 |
| D2 | partial | overhaul Phase 4: item 2 `[x]`, items 1, 3, 4 `[ ]`; Closed note carries them as D2; card `:1` and `decisions.md:58` agree | 🟢 |
| P2 | partial | `git branch -vv` 0 `: gone]`; 38 remote branches besides `main` | 🟢 |
| C4, P1 | partial | live `gh api`: `[true,false,false,false]`; `main` "Branch not protected" | 🟢 |
| C5 | resolved by U7 | `settings.json` `extraKnownMarketplaces.nonoun` `{"source":{"source":"github","repo":"kimgranlund/sdlc-orchestration"}}`, `sdlc@nonoun` true | 🟢 |
| C6, C7, R12 | accepted / human / trigger | C6 accepted, C7 waits on the human push, R12 names "the first plan after #643 that opens `scripts/` or `test/`" | 🟢 |

Rows the script never probes (H1 to H9, R2, R5, R9, R10, C2, C3, G1, K9, K14, K17, P3): all behind the P3 wall or human items; P3 `0` shows nothing under `src`, `mcp`, `scripts`, `test` moved, so none became done without a note. K9 ("`ui.html` carries no generated header") is still true and consistent with G2's open half.

Script logic reviewed: the note only classifies a row (`full`/`partial`/`open`) and every verdict comes from a tree or `gh` probe; a full note with an `open_probe` that fires prints `false-close`, a partial whose open half is gone prints `half-gone`, a done row with no note prints `no-note`. The only blind spot is a row outside its 21-id list, which the P3 wall covers for this plan; a later plan that closes a new row must add it to the list.

## Other checks

| Check | State | Evidence |
|---|---|---|
| Append-only in `debt.md` and `adapter.md` | 🟢 | vs b44883d: adapter 0 deleted lines; debt: 21 of 22 changed rows are pure appends, the four pass 2 replacements (R6, R8, G2, D2) are the sanctioned exception and each keeps every other cell byte-identical; see minor M1 for R12 |
| Scope of pass 2 | 🟢 | `git diff --stat d7cf7f4..266d13e`: `.sdlc/debt.md`, `.sdlc/records/index.md`, `.sdlc/handoffs/adopt-hygiene-U8.md` only |
| Em dashes and bold labels on pass 2 lines | 🟢 | 0 and 0 on the debt and index deltas; handoff 0 and 0 |
| Branding | 🟢 | `test/repo/branding.mjs` clean on the unit; no retired string written in this review |
| Records U8 wrote vs the head | 🟢 | every added line in `.sdlc/records` (ADR-004 card and index row, three PLAN cards, PRD-0001 card, decisions ADR-013/ADR-016/ADR-020/SITE-runbook/PLAN-overhaul rows, G1 to G6, index :52/:75/:77/:81) checked against the file or tree it describes; all true |
| Handoff accuracy | 🟢 | every number in the pass 2 checks table matches my rerun; the control table matches |

## Minor (not blocking)

| # | Where | Finding |
|---|---|---|
| M1 🟡 | `.sdlc/debt.md` R12 (pass 1, d7cf7f4) | the tail "so it waits for a unit that can" was replaced, not appended to, by the prepr3 §3 prescription; the handoff's "every other row is still an append" overstates by one. Meaning is a strict refinement; nothing to redo, but the sentence in the handoff is inaccurate |
| M2 🟡 | root `.sdlc/plans/adopt-hygiene.md` revision row 2026-09-17 (U8 pass 2) | says U7 row 2's `/Users/` loop now reads `/Users/[a-z]`, but the loop's text lives nowhere in the current plan (row 2 says "the two commands of pass 1"; the pass 1 text exists only at 65bbda3 in history). The next verifier has to find the loop in `git show 65bbda3` and patch it by hand. Orchestrator's text, one sentence to add to row 2 |
| M3 🟡 | criterion 10 control wording | "on a scratch copy of the fixed tree, one dash restored" only fires once the edit is committed, because `wording-check.sh` reads `git diff BASE...HEAD`; a working-tree edit prints `0, 0`. Worth one word ("committed") in the control cell so the control cannot be run vacuously |

Next: Orchestrator sends to the verifier; M2 is a plan-text fix in the root, not unit work.
