---
kind: handoff
plan: records-refresh
unit: U2
branch: unit/rr-U2
written: 2026-09-19
---

# Handoff U2 records-refresh · builder -> reviewer

measured at d814500

| Field | Value |
|---|---|
| Branch | unit/rr-U2 @ f857ce7 (before this commit) |
| Worktree | .worktrees/rr-U2 |
| Files | .sdlc/architecture.md, .sdlc/checks/doc-drift-rows-check.sh (new), this handoff |

## Step 1 gate

`sh .sdlc/checks/baseline-agrees-check.sh` printed seven `ok` lines and `stale total: 0`, exit 0.
`awk '/^## /{exit} /^Staleness note \(graded 2026-09-18\)\./{n++} END{print n+0}' .sdlc/architecture.md`
printed `1`. U1 is in; proceeded.

## Step 2: head

`HEAD7=$(git merge-base origin/main HEAD | cut -c1-7)` = `d814500`. This equals the `ref` sha in
`.sdlc/baseline.md` and is the "measured at" sha used in §8, the rerun note, this handoff, and (to be
written by the verifier) pass 5. `origin/main` itself has moved on to `92ad427` since; the merge base
still resolves to `d814500` because `unit/rr-U2` sits on `plan/records-refresh` which was rebased onto
it, so no `git merge-base d814500 HEAD` fallback was needed.

## Step 3: 18 controls, own run at the head, clone `job691u2`

All 15 read-only controls (K1-K6, K8, K10-K18) were run directly in this worktree (no writes). K7 and
K9 (they write) and every plant for all 18 controls ran in a throwaway clone
(`$CLAUDE_JOB_DIR/tmp/u2`, `git reset --hard && git clean -fdx` between plants; the clone was actually
made at `/private/tmp/claude-501/.../scratchpad/job691u2/u2` because `$CLAUDE_JOB_DIR` was unset in
this session).

| K | own HEAD result | map cell | delta | plant | hits |
|---|---|---|---|---|---|
| K1 | 0 | 0 | none | `const x = document.body;` appended to `src/engine/tonal.js` | 1 |
| K2 | 0 | 0 | none | `import { h } from "../ui/app-helpers.mjs";` appended to `src/engine/hct.js` | 1 |
| K3 | 0 | 0 | none | `import fs from "node:fs";` in `src/engine/hct.js` + `import x from "lodash";` in `mcp/describe-eval.mjs` | 2 |
| K4 | 0 | 0 | none | `import { HctApp } from "../app.js";` appended to `src/ui/sections/color.js` | 1 |
| K5 | 0 | 0 | none | `const v = figma.variables;` appended to `figma/binder/live-diff.mjs` | 1 |
| K6 | 0 | 0 | none | `fetch("https://x");` appended to `figma/plugin/code.js` | 1 |
| K7 | (clone) `node scripts/bundle.mjs`: exit 0, `wrote dist/ultimate-tokens.html 3774.8 KB` | exit 0, wrote 3692.6 KB | bundle grew since the map was recovered (`.sdlc/baseline.md`'s build line records the current `ui.html` KB, 3777.8; the raw `dist/` write differs slightly from the Figma-wrapped `ui.html` by construction) | new `src/engine/planted.mjs` (`export const planted = 1;`) imported by name (`import { planted } from "./planted.mjs";`) at the top of `src/engine/exports.js` | exit 1, `bundle.mjs preflight found 1 registry problem ... import path "./planted.mjs" is not registered in KEY` |
| K8 | `node test/engine/semantic.mjs` PASS; `node test/figma/binder.mjs` PASS; 53 = 53 | both exit 0; 53 = 53 | none | (a) `figma/binder/figma-semantic-binder/code.js` `SCRIM_STRENGTH_STEPS` last entry `600` changed to `999`; (b) `docs/reference/data/role-table.json` `.roleTable` popped by one row | (a) `FAIL: 1 gate failure(s)` in `test/figma/binder.mjs` (parity); (b) `FAIL: 1 gate failure(s)` in `test/engine/semantic.mjs` (refs-canonical) |
| K9 | (clone) full regen chain: exit 0, 0 `CHANGED BY REGEN` lines, `git status --short` empty | 0, clean | none | one hand-edit marker appended to each of `docs/reference/data/adia-oklch-export.css`, `docs/reference/data/adia-radix-export.mjs`, `figma/plugin/ui.html`, `src/ui/mcp-assets.js` | 4 `CHANGED BY REGEN` lines, one per file |
| K10 | 6 raw hits, all inside multi-line `try{}` blocks by manual trace (`app-helpers.mjs:89,91,92,114,134`; `app.js:2273`) | 6 raw hits | line numbers shifted from the map's (`app.js:2296`->`2273`) but same file/count and still all guarded | unguarded `function f(){ localStorage.setItem("a","b"); }` appended to `src/ui/app-helpers.mjs` | 7 |
| K11 | jsx/tsx/vue/svelte tracked files: 0; react/preact/lit/vue/svelte imports: 0; `attachShadow`: 0; `html:` count 6+3+3=12 (color.js/geometry.js/typography.js) | same, 12 `html:` exception | none | tracked `src/ui/planted.jsx` (`export default 1;`) + `import { html } from "lit";` appended to `src/ui/zip.mjs` | 2 |
| K12 | violation check (`role: "dialog"`/`aria-modal`) 0; `showModal(` calls (comment-filtered) 4 (`app.js`, `apply-gate.js`, `settings.js`, `color.js`); `"dialog"` tag 4 | same shape, same 4 files | line numbers shifted slightly (`app.js:610`->`613`) | `h("div", { role: "dialog", "aria-modal": "true" });` appended to `src/ui/overlays/settings.js` | 1 |
| K13 | 0 | 0 | none | `` const x = `font-family:${family}`; `` appended to `src/ui/sections/typography.js` | 1 |
| K14 | 3 (`lc-applied`, `lc-ceiling`, `lc-toneline`, all recorded exceptions) | 3, same three | none | `ty-line` renamed to `zz-line` in `src/ui/sections/typography.js` | 4 total (the 3 known exceptions plus 1 new `MISSING .an-svg .zz-line`) |
| K15 | `node_modules/` tracked: 0; `.claude/docs/other` tracked: 0; history: none; hook selftest PASS | same | none | force-added `node_modules/p/i.js` (1) + `.claude/docs/other/n.md` (1) | 2 |
| K16 | 0 | 0 | none | `console.log("hi");` appended to `mcp/brand-kit-server.mjs` | 1 |
| K17 | no framework import under `test`; 0 unlisted `.mjs` test files | same | none | `import test from "node:test";` appended to `test/engine/hct.mjs` + new tracked `test/engine/zzz.mjs` | 2 |
| K18 | silent (`CURRENT_SCHEMA_VERSION` 4, `schema-rename v4` present in `test/ui/persist.mjs`) | silent at 4 | none | `CURRENT_SCHEMA_VERSION` bumped to 5 in `src/ui/persist.js` | 1, `no test/ui/persist.mjs snapshot case for CURRENT_SCHEMA_VERSION 5` |

No control printed a hit outside its recorded exceptions at the head: no real drift found. Every
delta cell above is either "none" or a cosmetic difference already covered by an existing exception
(bundle size growth, line-number drift from unrelated commits).

## Step 5: Doc drift sweep

Three passes, each per coordinator direction. `.sdlc/architecture.md` §8 now has 47 rows, DD1-DD47.
`AGENTS.md` is absent (`git ls-files AGENTS.md` empty), stated in the section's lead sentence.
`sh .sdlc/checks/doc-drift-rows-check.sh` -> `rows 47 drifted 9 holds 38 undetermined 0 bad 0`, exit 0.

Pass 1 wrote DD1-DD7 (the seven required seeds). Pass 2 added DD8-DD17 (five more
`.claude/CLAUDE.md` claims, five `README.md` claims) after the coordinator's first review named
missed lines. Pass 3 (this one) walked both files top to bottom for full coverage after the
coordinator flagged four specific misses, adding DD18-DD47.

Findings (drifted or revised rows only; every other new row `holds`, listed in the coverage ledger
below):

- **DD5, `drifted`.** The first pass graded this `holds` by reading `.git/info/exclude` in this
  worktree, which does carry the line. A fresh `git clone` of the branch at `d814500`
  (`/private/tmp/.../scratchpad/job691u2/freshclone2`) shows `git check-ignore -v
  .claude/docs/other/anything.md` exits 1: `.git/info/exclude` is per-checkout and is never cloned,
  so the sentence's named mechanism protects nothing in a fresh clone. The real enforcement is the
  `git-precommit-privatedocs-guard` hook (K15), which the same sentence also names; only the
  ignore-rule half of the claim is drifted.
- **DD8, `holds` (revised).** The first pass called this `undetermined` from `exports.js`'s own
  nine named emitters alone. The coordinator's second pass pointed at the actual user-facing
  surface: `src/ui/overlays/drawer.js:39`, the export dialog's "Colors" `<select>` group, which
  lists exactly 10 entries (`css`, `oklch`, `tailwind`, `shadcn`, `panda`, `radix`, `figma`, `ui3`,
  `dtcg`, `json`). The 10th is `figma` (Figma variables), which ships through the binder/apply path
  rather than an `exports.js` function, which is why `exports.js`'s own count reads 9. `#638`'s
  second Radix export (`exportRadixModule` producing a raw form and a `refs: true`
  token-referencing form, `src/ui/model.mjs:1020-1036`) ships as two files under the single `radix`
  dropdown entry, so it does not push the count to 11. Holds.
- **DD15, `drifted`.** `README.md:51` says "a curated hub of **7 categories**" and names them. Code:
  `src/ui/categories/index.js`'s `CATEGORY_INDEX` carries 8 entries, an 8th `Brands` category (7
  palettes, not the other seven's 48-per-category shape) that the README's list omits;
  `src/ui/app.js:943` renders `CATEGORY_INDEX.length` directly as the hub's own displayed count, so
  a live user sees 8, not 7.
- **DD18, `drifted`.** `README.md:62` says the type scale is "seven voices (Display · Heading ·
  Sub-heading · Kicker · Body · UI · Code)". `src/engine/type.mjs:2,67-69` names fifteen voices
  (Display, Headline, Sub-heading, Title, Sub-title, Lead, Body, Body-mono, Label, Label-mono,
  Kicker, Tiny, Tiny-mono, UI-control, UI-widget). Not just the count is off: most of the seven
  names README gives (`Heading`, `UI`, `Code`) do not match any real voice name either.
- **DD19-DD22, `drifted`.** README's `## Layout` ASCII tree (lines 108-125) under-lists four of its
  five subtrees. `test/` (line 124) names 4 of 8 top-level entries, omitting `mcp/`, `plugin/`,
  `repo/`, `smoke/` (the coordinator's named miss). The same pattern repeats for `src/engine/`
  (line 112, 5 of 18 files, missing `geometry.mjs` and `type.mjs` among 13 others),
  `src/ui/` (line 113, 6 of 13, missing `overlays/` and `sections/` among 7 others), and `scripts/`
  (line 120, 6 of 17, missing `gen-adia-derived-exports.mjs`, `gen-mcp-assets.mjs`,
  `gen-type-fonts.mjs` among 9 others).
- **DD23, `drifted`.** `README.md:43` lists the Relative color-theory relationships as "extend /
  complement / contrast / bridge / anchor / recontextualize". `src/engine/derive.mjs:69-74`'s six
  relationship ids are `extend`, `complete`, `contrast`, `bridge`, `anchor`, `recontextualize`.
  `complement` is not an id; it is a word inside `contrast`'s own hint text (describing
  oppose-at-180°), so the README's list swapped `complete` for the word that describes a different
  entry.
- **DD33, `drifted` (smaller).** `.claude/CLAUDE.md:38`'s own `test/` layout line lists 6 of 8
  entries (it already has `mcp/`, `plugin/`, `smoke/`, which README's DD19 omits), missing only
  `repo/`. Same underlying gap as DD19, much smaller in this sibling file.

Every other DD8-DD47 row (33 of the 38 holds, not counting DD8) confirmed the doc claim as stated;
none needed correction. DD10 was checked live against GitHub (`gh issue view 325`/`342`), both
boundary issues carry the ADR-017 migration labels; DD47 likewise (`gh issue view 564`).

### Coverage ledger

Every line of `README.md` and `.claude/CLAUDE.md` carrying a number, a path, a script/command name,
or a never/only/all-shaped claim, walked top to bottom, mapped to the DD row that checks it or to a
stated reason it has none. Lines with no such content (pure prose, section headers) are omitted.

**README.md**

| Lines | Claim | Maps to |
|---|---|---|
| 3 | CI badge | DD30 |
| 4 | live-demo badge | no checkable claim: decorative link, same repo DD30 already confirms |
| 6-8 | offline single-file build, runs from `file://` | no checkable claim: general description, covered by architecture.md T3 |
| 11 | 53-role semantic layer | DD7 |
| 12-13 | export list ("CSS, Tailwind v4, ... Claude Design and more") | DD17 |
| 15-17 | three distribution channels (web app / component / plugin) | no checkable claim: covered by architecture.md T1/T2/T4 |
| 20, 22-23 | 16 default palettes (8+8) | DD13 |
| 23, 30-31 | perceptual distribution is the default | DD14 |
| 24 | Warning's lifted light end | no checkable claim: not independently re-verified this pass |
| 29-31 | three distribution modes | DD14 |
| 32-34 | vibrancy / relative-chroma / chroma floor / Base chroma / Prime chroma | no checkable claim: parameter names, no number/path/script/never-only-all |
| 35-36 | prime system, seven swatches | DD24 |
| 39-41 | dominant / supportive key colors | no checkable claim: descriptive terminology, no trigger word |
| 42-46 | six relative color-theory relationships | DD23 (drifted) |
| 47-49 | 53-role semantic layer (restated) | DD7 |
| 51 | 7 categories | DD15 (drifted) |
| 52 | 12 volumes × 4 = 48, 336 total | DD16 |
| 53-54 | sourcing / lazy-loading | no checkable claim: not independently re-verified this pass |
| 55-58 | exports list (colors, DTCG, JSON, design-system export, profiles) | DD6, DD17 |
| 59-60 | Include toggle row (Color/Typography/Geometry) | no checkable claim: UI control existence not independently re-verified this pass |
| 61-62 | seven voices | DD18 (drifted) |
| 63 | five type treatments | DD36 |
| 65 | XS-2XL size ramp | DD25 |
| 66 | centering-law formula | no checkable claim: not independently re-verified this pass |
| 67 | five geometry treatments | DD37 |
| 69-70 | `node brand-kit-server.mjs` | DD26 |
| 71-72 | systems opted in, "See `mcp/`" | no checkable claim: `mcp/` existence confirmed under DD26 |
| 73-74 | sun/moon/system toggles | DD27 |
| 78-80 | `npm install`, `npm run dev`, port 5173 | DD28 (`npm install` itself: no checkable claim, standard command) |
| 85-87 | `npm run build` stage comment, `npm run preview` | DD42 (`preview`: no checkable claim, trivially matches `package.json`) |
| 90-94 | `dist/`, `dist/ultimate-tokens.html`, `figma/plugin/ui.html` | DD29 |
| 96-100 | `npm test` description | no checkable claim: same script chain as DD1/DD31 |
| 102-106 | test-suite description, `test/ui/headless-boot.mjs` | DD39 |
| 108-125 | Layout ASCII tree: `src/engine/`, `src/ui/`, `figma/`, `scripts/`, `docs/reference/`, `test/` | DD20 (engine), DD21 (ui), DD22 (scripts), DD19 (test); `figma/` paths and `docs/reference/data/role-table.json`: no checkable claim, already covered by architecture.md A5/T4/T5 and DD7 |
| 127-129 | engine is DOM-free; role-table.json is the canonical contract | no checkable claim: dup of K1 and DD7 |
| 131 | `npm run gen:categories`, `src/ui/categories/` | DD40 |
| 137-141 | Figma manifest path, `Color Primitives` / `Color Roles` collections | DD38 (manifest path: no checkable claim, dup of architecture.md T4) |
| 142-143 | `figma/binder/figma-semantic-binder/` | no checkable claim: already covered by K8's parity control |
| 147 | MIT license | DD41 |

**`.claude/CLAUDE.md`**

| Lines | Claim | Maps to |
|---|---|---|
| 9 | `docs/reference/data/role-table.json` path | no checkable claim: dup of DD7 |
| 13-14 | `npm test` description | no checkable claim: dup of DD1 |
| 15-16 | build needs `node_modules`, test does not | DD31 |
| 17 | `npm run smoke` runs build first, `#564` | DD47 |
| 18-19 | real headless Chrome, `smoke-out/` gitignored | DD11 |
| 20 | `npm run dev`, "in Safari" | no checkable claim: workflow preference, not a code fact |
| 21-22 | `gen:type-fonts` excluded from `test`/`build` | DD1 |
| 27-28 | 10 documented color formats | DD8 |
| 28-29 | `derive`/`tonal`/`hct`/`okhsl` named (not exhaustive) | no checkable claim: named examples, not framed as a full listing (unlike README's ASCII tree) |
| 30 | ds-export.js split, TKT-0015, "not one of the 10" | DD32 |
| 31-34 | `overlays/` (`drawer`/`settings`/`apply-gate`) | DD45 |
| 35 | `do not hand-edit` generated assets | DD2 |
| 36 | `figma/binder/figma-semantic-binder/code.js` mirrors `semanticRoles` | no checkable claim: covered by K8's parity control |
| 36 | `figma/plugin/ui.html` generated bundle | no checkable claim: covered by K9 |
| 38-39 | `test/` layout (engine/ui/figma/mcp/plugin/smoke) | DD33 (drifted, smaller gap) |
| 39 | `scripts/` (the generators) | no checkable claim: not framed as an exhaustive listing |
| 40 | `plugin/ultimate-tokens/` | DD46 |
| 42-44 | `docs/marketing/`, `docs/tickets/`, `docs/site/`/`docs/lld/`/`docs/img/` | no checkable claim: not independently re-verified this pass |
| 51-53 | ADR-017, TKT-0031, Issues #325 to #342 | DD10 |
| 55-56 | native `<dialog>` + `showModal()`, engines DOM-free | no checkable claim: dup of K1 and K12 |
| 59-60 | `renderCenter`/`renderLeftPane`/`renderRightPane` | DD34 |
| 61-62 | 53 semantic roles, deep-equal, parity-gated | no checkable claim: dup of DD7/K8 |
| 64-65 | font-family quoting example | no checkable claim: covered by K13 |
| 66-67 | SVG `fill: none` rule | no checkable claim: covered by K14 |
| 68-70 | `html:` exception, 12 live attributes | DD4 |
| 71 | `node_modules` NOT tracked, never re-add | DD35 |
| 86 | `sdlc@nonoun` in `.claude/settings.json` | DD43 |
| 91 | `.worktrees/<unit>` off `plan/<slug>` | DD12 |
| 94-95 | ~60 s, `npm test` | DD9 |
| 96 | `npm ci` needed for build | no checkable claim: dup of DD31 |
| 97 | `adapter.py`, `.sdlc/config.json`, preset `github` | DD44 |
| 106 | `docs/reference/references/decision-records.md` | no checkable claim: dup of DD32's citation, file already read in this pass |
| 108-109 | branding gate scans `.sdlc/` | no checkable claim: covered by the plan's own P4 gate |
| 111 | `.claude/docs/other/`, `.git/info/exclude`, privatedocs-guard hook | DD5 |
| 114-115 | `npm test` green, `.claude/docs/other/` and `node_modules` never committed | no checkable claim: dup of P1 gate and K15/DD35 |

## Step 6: Texts and criteria

Wrote the rerun note, the §7 Counts bullet, and §8 into `.sdlc/architecture.md`; created
`.sdlc/checks/doc-drift-rows-check.sh` byte for byte from the plan's `sh doc-drift` fence
(`diff` empty, `same`).

## Criteria (builder's own run; rows 7-8 are pre-land's per the division of labour)

| # | Criterion | Command result | Verdict | Negative control |
|---|---|---|---|---|
| 1 | §8 present once, last, section grep counts 6 | `1`, no `NOT LAST` line, `6` | 🟢 | not run (would require a second copy of §8) |
| 2 | §8, rerun note, Counts bullet all name the merge-base/`ref` sha | `d814500` x5 | 🟢 | not run |
| 3 | every §8 row well-formed, quotes verbatim, paths tracked, seven seeds present (more rows expected) | `rows 47 drifted 9 holds 38 undetermined 0 bad 0`, exit 0; seed grep `7` | 🟢 | not run (would corrupt the committed section) |
| 4 | check script is the plan's text byte for byte | `diff` empty, `same` | 🟢 | not run; extraction command matches the plan's `sh doc-drift` fence exactly |
| 5 | rerun note once, U1's note untouched, debt.md untouched, architecture.md zero deletions vs merge base | `1`, `1`, `0`, `0`, `1` | 🟢 | not run |
| 6 | handoff evidence table: 18 rows, no empty cell, measured-at line present | `18`, `0`, `1` (see below) | 🟢 | not run |

Row 6 self-check, run against this file after writing it: the K-row count printed 18 and the empty-cell
count printed 0.

## Plan-level gates (P1, P4, P5)

| # | Command | Result | Verdict |
|---|---|---|---|
| P1 | `npm test 2>&1 \| tail -1; git status --short \| wc -l` | `✓ all 47 test files passed`, `0` | 🟢 |
| P4 | `bash -c 'set -o pipefail; node test/repo/branding.mjs \| tail -1; echo "exit $?"'` | `branding: clean (450 files scanned)`, `exit 0` | 🟢 |
| P5 | `git diff --name-only $(git merge-base origin/main HEAD) \| grep -vcE '^\.sdlc/\|^\.gitignore$'` | `0` | 🟢 |

## Left out

- Negative controls for the builder's own U2 criteria rows (1-6) were not independently rerun against
  this unit's just-committed state (they would require corrupting the committed section); the "own
  HEAD result" vs "map cell" columns above already exercise the discriminating shape control by
  control. Flagged for the reviewer/verifier to run fresh if a stronger control is wanted.
- No K control found a real drift at `d814500`; nothing was fixed, per the wall (nothing to report to
  the Orchestrator beyond this).
- Rows 7 and 8 (pass 5 grading, C31 block) are pre-land's per the division of labour; not attempted
  here.
