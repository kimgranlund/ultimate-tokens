# Independent verification , plan `preset-intent-fidelity` U1 (ticket #681)
verdict: 🟢

| Field | Value |
|---|---|
| Verdict | **PASS** (2 🟡 concerns, both plan-text / process, neither a code defect) |
| Unit | U1 , palette `anchor` field + `prime.DEFAULT` byte-exact |
| Branch | `unit/pif-u1-anchor` @ `ab9eaa6891e3f4420d8d0122aaf686687a72622e` |
| Handoff `base:` | `bf2aaf659fde4db3bddaed8dfa23e2f485ab2c46` |
| `git merge-base HEAD origin/main` | `bf2aaf659fde4db3bddaed8dfa23e2f485ab2c46` , **matches the handoff, independently confirmed** |
| Worktree used | own scratch worktree, read-only against the branch; no `.git-worktrees/pif-*` path touched |
| Verified by | own command runs + own cross-tree computation; reviewer's numbers reproduced, not accepted |

Branch was NOT pushed to origin (`git ls-remote` shows only `refs/heads/plan/preset-intent-fidelity`
@ `f11ae18`). The commit was reachable locally, so no peer request was needed.

---

## Criteria

| # | Criterion | State | My evidence | My negative control |
|---|---|---|---|---|
| C1 | `npm test` exit 0, `all 48 test files passed`, tree clean after | 🟢 | Ran `npm test` twice in my own worktree. Both: `✓ all 48 test files passed`, `EXIT=0`, and `git status --short` empty after each. Per-file result lines byte-identical between the two runs. 48 = 47 baseline + `engine/anchor.mjs`, confirmed present in the runner output. | Corrupted `docs/reference/data/role-table.json` two ways and reran `node test/run.mjs`: (a) one-byte change to `defaults[1].anchor` (`#0C5DCC`→`#0C5DCD`) → exit 1, `engine/semantic.mjs FAIL`, named: `role-contrast , default "Primary" anchor: model.mjs has #0C5DCC, role-table.json has #0C5DCD , the two default sources have split`; (b) deleted one of the 53 `roleTable` entries → exit 1, `engine/semantic.mjs FAIL` + `plugin/color-tokens.mjs FAIL`. Tree restored clean afterwards (verified). |
| C2 | Anchor identity: `primeSwatches(...)[3].hex === anchor` **and** `prime.DEFAULT` OKLCH == independent hex→oklch of `anchor`, 3,380 exact / 0 off | 🟢 | `node test/engine/anchor.mjs` → `anchor-identity: 3380 exact, 0 off`. Reproduced the identity half myself outside the gate: my own loop over the regenerated corpus (3,780 palettes loaded, 3,380 carrying `anchor`) gives **3380 exact of 3380**. For the exports half I went through the **real shipped export path** (`exportPanda` → `tokens.colors.<n>.prime.DEFAULT`), which the gate does not do (it reads `derivedAll()[0].prime.prime`): 117 sampled anchored palettes, **117/117** have `prime.DEFAULT.value` exactly equal to my own from-scratch OKLab→OKLCH conversion of the stored anchor, and `DEFAULT === prime` in all 117. Primary `#0C5DCC` → `oklch(0.504 0.1867 258.99)`, matching spec EX-1. | Corrupted one anchor by one byte and reran the exportPanda comparison: `#93533F`→`#935330` moved `prime.DEFAULT` to `oklch(0.5101 0.0984 48.07)`; no longer equals the original-anchor expectation, and does equal the corrupt-anchor expectation. Check bites. Also the gate's own in-run corruption control fires every run. |
| C4 (prime part) | With `anchor` stripped, `paletteStops`/`primeSwatches` byte-identical to `origin/main` at the handoff's base sha, 3,780 palettes, three modes | 🟢 | **The plan's named command does not exist on this branch** (see 🟡-1), so I ran the criterion's substance directly and more strictly than the gate does. Created a read-only worktree at `bf2aaf6` and compared the **branch engine against the actual base tree** (not a reimplementation): `primeSwatches` **158,760 cells compared, 0 differing** (both hue spaces × primeChroma 100/60/0 × all 3,780 base palettes, `anchor` stripped); `paletteStops` **215,460 cells, 0 differing** (19-stop display) and **283,500 cells, 0 differing** (25-stop export), each over perceptual/peak/even. Also: branch palette objects minus `anchor`/`sourceAnchor` deep-equal the base palette objects for **all 3,780** , `gen-categories.mjs` changed nothing else. Base corpus carries 0 anchor fields; branch carries 3,380. `src/engine/tonal.js`, `hct.js`, `okhsl.js` are untouched vs base (`git diff --stat`: only `prime.mjs` +120/-13 and `exports.js` +8). The in-repo gate separately reports `prime-identity-control: 3796 exact, 0 off`. | Mutated one palette's `chroma` by +37 on the branch side only → my prime loop reported 7 differing cells, naming `architecture info step brightest: #BCD8FC vs #CEDBED`. Mutated one palette's `lift` by +11 → my stops loop reported 20 differing cells. Both loops bite. |
| C10 (schema note part only) | Schema bump for `DOMAINS.palette.anchor`/`sourceAnchor` with a RENAME_MAPS no-op entry per the TKT-0016 rule | 🟡 | `CURRENT_SCHEMA_VERSION = 5` (`src/ui/persist.js:364`), bumped from 4, with a 6-line v5 note (`persist.js:358-363`) naming ticket #681/U1 and the TKT-0016 convention. **There is no literal `RENAME_MAPS` array entry for v5** , `RENAME_MAPS` holds exactly three entries (versions 1, 2, 3) and v5 is documented as a comment, not an object. See 🟡-2: this matches the repo's actual rule and its own v4 precedent, but not the plan's literal wording. Behaviour verified by my own round-trip: `serialize()` stamps 5; `anchor` and `sourceAnchor` round-trip on all 16 default palettes; lowercase `#0c5dcc` normalizes to `#0C5DCC` (F3 fix real); `"not-a-hex"` drops to `undefined`; a pre-v5 doc (`schemaVersion: 4`) with both fields absent hydrates with both still absent. | The C1 (a) control above is the live gate on the anchor field's cross-source parity, and it fires by name. The persist behaviours were each checked against their inverse (malformed → dropped, absent → stays absent, lowercase → normalized rather than silently lost). |

---

## The two flagged re-checks

### 1. Allow-list gate , frozen by NAME, and all 4 dupes are genuinely byte-identical. Peer disagreement settled.

**Frozen by name, not just count: confirmed.** `test/engine/anchor.mjs` declares `ORDER_ALLOW`
(23 entries, lines 221-245) and `DUPE_ALLOW` (4 entries, lines 246-251) as sorted string constants,
each entry `<slug> "<preset>" <palette> <anchorHex>`. The gate compares the corpus's own sorted name
arrays **element-wise** against those constants (lines 273-282), and on any difference names the
missing member and the uninvited member individually. A same-count substitution cannot pass. The file
also carries its own control for exactly that scenario (lines 291-297): a same-length, one-member-
swapped copy of `ORDER_ALLOW` must compare unequal or the gate fails itself.

I verified the frozen lists against the gate's own printed output rather than trusting either: both
`diff`s are empty , 23/23 order names match, 4/4 dupe names match.

**All 4 named dupes are byte-identical (0-unit diff), NOT "close but distinct": confirmed by my own
computation.** I recomputed `primeSwatches(...)` at `primeChroma: 100` over all 3,380 anchored
palettes and enumerated every colliding rung pair myself. Exactly **4** palettes have any duplicate
hex, each a single `prime`/`dimmest` collision with **channel delta [0,0,0], maxDelta 0**:

| Preset | Palette | anchor | colliding pair | sRGB channel delta |
|---|---|---|---|---|
| film "The Night of the Hunter …" | tertiary | `#1E211E` | `prime` / `dimmest` both `#1E211E` | [0,0,0] |
| film "Suspiria …" | tertiary-muted | `#201F25` | `prime` / `dimmest` both `#201F25` | [0,0,0] |
| music "P-Funk …" | secondary-muted | `#211E27` | `prime` / `dimmest` both `#211E27` | [0,0,0] |
| music "Black metal …" | secondary | `#1E2024` | `prime` / `dimmest` both `#1E2024` | [0,0,0] |

In all four the colliding hex **is** the stored anchor, so C2's token exactness survives the
collision , the ladder loses one distinct rung, the token never moves. The names match `DUPE_ALLOW`
exactly. The handoff's "byte-identical, not merely close" claim is correct; a report describing these
as near-but-distinct would be wrong.

### 2. #686 does not reach U1's own gates. U1 is not blocked on it.

Two independent arguments, both mine:

- **Structural.** U1's anchored path is `hexToRgb` → `rgbToOkhsl` → `okhslToRgb` only
  (`prime.mjs:114-120`, `rungHex` at :152-158). `src/engine/okhsl.js` has **zero imports** , it cannot
  reach `hct.js`'s `maxChromaInGamut`/`peakC` memo, which is the whole of #686's surface. The
  non-anchored path does call `peakC`/`hctToRgb`, so C4's surface is in principle exposed.
- **Empirical.** I flooded the shared `boundedCache` (cap 5,000) with 20,000 off-corpus `peakC` /
  `maxChromaInGamut` calls in two different sweep orders, forcing eviction and repopulation, and
  re-measured between each: `3380 exact of 3380`, `order=23`, `dupe=4`, and the anchored order/dupe
  name lists byte-identical cold vs. perturbed. For the exposed non-anchored surface, **0 of 3,780**
  palettes changed their prime ladder under perturbation.
- **Run-to-run.** `node test/engine/anchor.mjs` twice → output byte-identical (`diff` empty). Full
  `npm test` twice → identical per-file results, clean tree both times.

---

## Findings, ranked

**🟡-1 (Medium, plan sequencing , not a builder defect).** C4's named command,
`node scripts/report-preset-fidelity.mjs --identity-control --base <sha>`, **cannot be run at U1**:
that script does not exist on this branch, nor at the base sha. The plan itself assigns it to **U4**
("adds `scripts/report-preset-fidelity.mjs`"), so C4 as written is unsatisfiable by its own named
command until U4 lands. The builder substituted `test/engine/anchor.mjs`'s `prime-identity-control`,
which compares against a **reimplementation of the pre-#681 formula written by the same builder** ,
weaker than the criterion asks for, because a reimplementation that mirrors a misconception in the
new code would agree with it. I closed that gap myself by comparing against the **actual base tree at
`bf2aaf6`** (657,720 cells across `primeSwatches` and both `paletteStops` stop sets, 0 differing), so
C4's substance is met with better evidence than the branch carries. Action: either U4 backfills the
named command and the record cites it, or the plan's C4 line is amended to name the check that is
actually runnable at U1. Nothing to fix in U1's code.

**🟡-2 (Low, wording drift between plan and repo rule).** The plan's U1 line asks for "a RENAME_MAPS
no-op entry per the TKT-0016 rule". The repo's actual rule is **rename-scoped**: `docs/tickets/tkt-0016.md`
Acceptance reads "every future canon **rename** adds its map", and `.claude/skills/type-scale/SKILL.md:74`
says "A voice **RENAME** (not an add) → … PLUS a `RENAME_MAPS` entry". `anchor`/`sourceAnchor` are
additions, so no entry is owed, and the pre-existing **v4** bump in this same file set the identical
precedent (bump + comment, no array entry). The code is right; the plan's phrasing implies an artifact
the rule does not require and that v4 already did not produce. Action: U5's records pass should correct
the plan/criterion wording. No code change.

**🟡-3 (Low, informational).** The plan and `.sdlc/adapter.md` §1 name C1's negative control as
"corrupt `docs/reference/data/role-table.json`, expect **17 FAIL**" without specifying the corruption.
Neither corruption I tried produces 17: a one-byte anchor change gives 1 failing file, deleting a role
gives 2. The control **does** bite decisively in both cases, which is what C1 needs, but the "17" is
not a reproducible target from an unspecified mutation and should not be read as a pass/fail number by
a future verifier. Not U1's to fix; worth a line in the adapter.

**Note, not a finding.** The handoff's `Branch` row names `e2e8a43`; the actual branch head is
`ab9eaa6`, one docs-only commit later (the rebase/ruling record). The handoff's own later text records
`ab9eaa6`'s content, so this is a stale header row, not a discrepancy in what was verified.

Handoff notes N3 (the `anchor-ladder` gate evaluates at `primeChroma: 100` only) and N4 (`rungHex`
duplicates the final render's math rather than being called by it) are accurately self-reported as
gaps and correctly left to U6. I confirmed N3 independently: my own sweep at primeChroma 60 and 0 is
covered for the **non-anchored** identity control but nothing gates the **anchored** ladder below 100.
That is a real residual gap, cheap to close, and not a reason to hold U1.

---

## Commands run (all in my own scratch worktree, branch untouched)

```
git ls-remote origin refs/heads/unit/pif-u1-anchor      # absent , not pushed
git merge-base unit/pif-u1-anchor origin/main           # bf2aaf6… == handoff base
npm test                                                # ×2, exit 0, all 48 passed, clean tree after each
node test/engine/anchor.mjs                             # ×2, byte-identical output
node test/run.mjs                                       # ×2 under role-table corruption (both bit; tree restored)
# own scripts (scratchpad/): c4-crosstree.mjs, c4-stops.mjs, dupecheck.mjs, probe686.mjs, c2-panda.mjs
```

Artifacts: `run1.log`, `run2.log`, `anchor-a.log`, `anchor-b.log`, `negctl.log`, `negctl2.log`,
`printed-order.txt`/`frozen-order.txt`, `printed-dupe.txt`/`frozen-dupe.txt`, all under the same
scratchpad directory as this file.
