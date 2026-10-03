---
kind: verdict
plan: prime-name
seat: verifier
pass: 1
ticket: "#789"
written: 2026-10-03
---

# Pre-PR · prime-name · pass 1 · 🟢 at `1cea505d`

verdict: 🟢
sha: 1cea505dd7ce15db2f3edf4263f52768bf4fd18a
version: n/a (a plan landing, no release)

`plan/prime-name` at `1cea505d` (U1 and U2 merged, main merged in), scope `origin/main...1cea505d`, criteria C1.1 to C1.7 and C2.1 to C2.5 of `.sdlc/plans/prime-name.md`. Checkers in fresh context, both dispatched by this seat: reviewer-l3 (opus) on the whole diff (PASS, one medium and three low findings) and verifier-l2 (opus) re-grading every criterion on the integrated head in a throwaway clone. Substitution (R86/R92, no Fable): reviewer-l3 and verifier-l2 stand in for reviewer-l4 and verifier-l3. The builders were sonnet, so both checkers sit outside their family. The Orchestrator's own reviewer-l3 PASS (`.../8c58a81c/tmp/prime-name-prepr/review.md`) agrees, but was not used as evidence. The sha is `1cea505d`, not the in-branch request's `fc35d881`: `fc35d881..1cea505d` is the main merge only (three `.sdlc/` files). `baseline-agrees-check.sh` prints `stale total: 0`. CI has not run: no PR exists for this head (Findings 1). Landing also needs green CI, which this record does not certify.

## Rows

| Check | State | Evidence | Negative control |
|---|---|---|---|
| C1.1 no `prime-prime` in src mcp plugin figma test docs/reference/data | 🟢 | `git grep -l prime-prime -- src mcp plugin figma test docs/reference/data` prints nothing, rc=1 | primeSlug reverted to `` `prime-${step}` `` in `src/engine/prime.mjs`, `npm test` (regenerates): grep prints `docs/reference/data/adia-oklch-export.css` (1 file, not the plan's 5: source now composes via primeSlug, so no literal reaches `exports.js`, `ui.html` or `describe-mcp-assets.js`; non-empty is the pass condition for the control) |
| C1.2 new/old counts on `stateOf(defaultDocument())` | 🟢 | scratch `pnpr/c12.mjs` at HEAD: `new 1 1 2 old 0 0 0`; at merge-base tree: `new 0 0 0 old 1 1 2` | same primeSlug revert: `new 0 0 0 old 1 1 2` |
| C1.3 prime test group | 🟢 | `npm test` exit 0 (gate row); `src/engine/prime.mjs:66` owns the rule, `git grep -n 'prime-\${' -- src mcp` shows only the helper and its comment (plus the generated describe asset), no inline composers | primeSlug revert: `FAIL prime, CSS missing --c-neutral-prime (hex)` plus `radix-refs-extras`, `design-system-prime`; single emitter (Tailwind line back to `prime-${step}`), `node test/engine/exports.mjs` exit 1: `FAIL prime, Tailwind missing --color-neutral-prime` |
| C1.4 UI3/JSON/DTCG byte-equal vs merge-base, schema stamp masked | 🟢 | `pnpr/c14.mjs` (masks `schema.vN`, `brand-kit/N`, schema numbers) HEAD vs merge-base: `cmp` prints `BYTE-EQUAL`, 799528 bytes each | `primeVars` key changed to `` `${p.n}/prime-${step}` `` (`src/engine/exports.js:730`): `DIFFERS: 4 diff lines` |
| C1.5 `figma/binder/migrations.mjs` untouched | 🟢 | `git diff --stat $(git merge-base origin/main HEAD) -- figma/binder/migrations.mjs` prints nothing | appended a comment line: `figma/binder/migrations.mjs \| 1 +` |
| C1.6 schema bump = merge-base + 1 | 🟢 | HEAD `EXPORT_SCHEMA_VERSION = 4`, merge-base `EXPORT_SCHEMA_VERSION = 3` | constant set back to 3: `EXPORT_SCHEMA_VERSION = 3`, equal to base, check reds |
| C1.7 / C2.4 / gate `npm test` | 🟢 | `npm test` exit=0, last line `✓ all 54 test files passed`, porcelain empty | adapter control `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`; `node test/run.mjs` exit=1, `FAIL refs-canonical, ordered key set != canonical`, `✗ 1/54 test file(s) failed` |
| C1.7 gate `npm ci && npm run build` | 🟢 | `npm ci` exit 0, `npm run build` exit 0, last line `wrote figma/plugin/ui.html 4162.0 KB`; ui.html shasum `772bda8e67f2` committed and after build (unchanged); porcelain empty | appended `export const primeSlug2 = (;` to `src/engine/prime.mjs`: build exit=1, `SyntaxError: Unexpected token ';'` |
| gate `npm run smoke` | 🟢 | exit 0, `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, 43 `✓` lines; porcelain empty | `test/smoke/smoke.mjs:288` regex 60px to 61px: exit=1, `✗ New-Palette modal is draggable by its header`, `SMOKE FAIL (1):` |
| C2.1 no `prime-prime` in docs/plugin (archives and data excluded) | 🟢 | `git grep -l prime-prime -- docs plugin ':!docs/tickets' ':!docs/plan/archive' ':!docs/reference/data'` prints nothing, rc=1 | `knowledge-04-export-formats.md` restored from merge-base: grep prints it |
| C2.2 six suffixed steps named in color-tokens SKILL.md | 🟢 | `... \| sort -u \| wc -l` prints `6` | SKILL.md restored from merge-base: prints `2` |
| C2.3 CHANGELOG Unreleased spells the bare name | 🟢 | awk/grep count prints `3` | CHANGELOG.md restored from merge-base: prints `0` |
| C2.5 no stale `brand-kit/3` / `0.3.0` in .claude/skills | 🟢 | `git grep -a -n 'brand-kit/3\|version: "0.3.0"' -- .claude/skills` prints nothing, rc=1 | `.claude/skills` restored from merge-base: prints `best-practices.md:70,73` and `foundations.md:13,41,43`, rc=0 |
| check `baseline-agrees-check.sh` | 🟢 | exit 0, `stale total: 0` | baseline.md:36 `4162.0 KB` to `4161.0 KB`: exit 1, `STALE ui.html: baseline 4161.0 KB, tree 4162.0 KB`, `stale total: 1` |
| check `card-amendment-check.sh` | 🟢 | exit 0, `stale total: 0` | ADR-010 card Lineage date `2026-09-16` to `2026-09-99`: exit 1, `stale card ADR-010`, `stale total: 1` |
| check `card-source-range-check.sh` | 🟡 | exit 1, `range mismatches: 3` (ADR-026 end 768 vs 791, ADR-027 start 770 vs 793, end 816 vs 839) | on `origin/main` (`e18404fe`): exit 1, `range mismatches: 3`, output identical (`diff` empty); the branch does not touch `decision-records.md`, so not introduced here |
| check `doc-drift-rows-check.sh` | 🟢 | exit 0, `rows 56 drifted 11 holds 45 undetermined 0 bad 0` | architecture.md DD1 quote altered: exit 1, `QUOTE DD1: not found at .claude/CLAUDE.md:22`, `bad 1` |
| check `verdict-frontmatter-check.sh` | 🟢 | exit 0, `verdicts 267 graded 267 bad 0` | deleted the `verdict:` line of the first verdict file: exit 1, `bad 1` |
| check `ceiling-counts-check.mjs` | 🟢 | exit 0, `ceiling-counts: clean` | deleted the `284 s` row: exit 1, `FAIL prose total == rows (prose 20, rows 19)` |
| CI (stated, not certified) | 🟡 | `gh pr list --state all --head plan/prime-name`: no PR; `gh run list --branch plan/prime-name`: no runs. Remote `plan/prime-name` = `1cea505d`. The request says "draft PR open"; no PR exists for this head | not run; CI is the Conductor's leg |
| Mergeability | 🟢 | `git merge-tree --write-tree origin/main 1cea505d` rc=0, tree `d6d94d8a`, no conflicts; origin/main is 2 commits ahead (`2c7963db` handoff, `e18404fe` verdict), records only | cross-check: the reviewer ran `git merge-tree --write-tree origin/main 1cea505d` separately, also clean |
| Review | 🟢 | reviewer-l3 `PASS` at `1cea505d`: one name rule (`primeSlug`, `src/engine/prime.mjs:66`) at every flat emitter, nested keys unchanged, schema 4 and MCP `0.4.0` with every pin moved, no shim or alias (R98), no dead code, baseline correction `4162.0 KB` checked, hygiene clean, `git merge-tree` clean | the reviewer's own scratch run of the default kit: doubled name `0`, bare name `1` per format, the inverse of the merge-base |

## Findings

1. 🟡 No PR and no CI runs exist for `plan/prime-name` (`gh pr list --head plan/prime-name` empty), although the request says a draft PR is open. The four required legs have not run on `1cea505d`. Landing waits on the PR and green CI.
2. 🟡 Reviewer F1 (medium): `plugin/ultimate-tokens/skills/color-tokens/SKILL.md` changed while `plugin/ultimate-tokens/.claude-plugin/plugin.json` stays `0.2.1`, and `plugin/HOSTING.md:29-31` says a content change without a bump reaches nobody. What users have now is not wrong: the 0.2.1 skill already names the bare centre. #761 and #763 set the same precedent. Bump to `0.2.2` in this PR or file a follow-up; the Orchestrator chooses.
3. 🟡 Reviewer F2 (low): `docs/reference/references/knowledge-04-export-formats.md:67` shows `--c-{n}-prime-brightest ... --c-{n}-prime-dimmest`, and the ellipsis hides the centre step. It is the one generic pattern not next to its bare-centre note (that note is at `:253`).
4. 🟡 `card-source-range-check.sh` exits 1 with 3 ADR-026/027 range mismatches, byte-identical on `origin/main`. It is a red on main this branch does not touch; named here, not absorbed.
5. Low (reviewer F3, F4, F5): the Stitch and Claude Code spine's bare-centre note has no test (`src/engine/ds-export.js:802`). The CHANGELOG cites `#789`, so append the PR number at squash. The plan's §6 progress table still says U2 "not started": close-out per adapter §5.
6. Info: C1.1's control brings back 1 file, not the plan's 5, because after U1 the old name is never a source literal. It still reds.
