# Handoff U1 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/cf-U1 @ 9c9a953b (merged plan/chroma-floor revision 11, 7fc8fc99) |
| Files | src/engine/tonal.js · test/engine/anchor.mjs · test/engine/tonal.mjs · test/engine/semantic.mjs · test/engine/mode-isolation-gate.mjs (new) · test/engine/fixtures/mode-isolation.json (new) · test/engine/fixtures/tonal-legacy.json · scripts/report-preset-fidelity.mjs · package.json · .github/workflows/ci.yml · .sdlc/adapter.md · .sdlc/baseline.md · .sdlc/checks/baseline-agrees-check.sh · docs/reference/SKILL.md · docs/reference/rubrics/acceptance-criteria.md · docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md |

## Ran

| Criterion | Command | Output | Control |
|---|---|---|---|
| C1 | `npm test` | `✓ all 50 test files passed`, exit 0, tree clean after commit | n/a (the gate itself) |
| C2 | `npm run gate:corpus-anchor` | exit 0, `anchor-ramp lone-spike ...: 0 (expected 0, corpus 3380 anchored + default kit 16, no allow-list)`; greps `LONE_SPIKE_ALLOW\|DEFAULT_KIT_SPIKE_FINDING` 0, `loneSpikeSorted.length === 0` 1, `dropCheck\|swapCheck("lone-spike"` 0 | in-gate data-URL copy with the plateau neutralised (`uG *= t*t*(3-2*t)` -> `uG *= 1`) still finds spikes over the same corpus+kit, no `DID NOT bite` FAIL |
| C5 | `report-preset-fidelity.mjs --envelope --gate-path` / `--envelope` | gate-path even: 10.9/16.2, 39.1/52.2, 39.0/44.6, 16.3/16.5, above100 0 OK — all four `OK`; default (rendered) run byte-identical to `<base>` (15.6/37.0, 48.4/113.7, 42.5/80.2, 22.9/52.0, above100 670); perceptual+peak block md5 `6e558839ee9e43217e1e2f7afc898b7b`, matches `<base>` | `--gate-path --damp-amp 55`: above100 1916 FAIL (bites) |
| C6 | `npm run gate:mode-isolation` | exit 0, `perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture (captured at 282fca8ddc84703a9bffc0bcc0f3b8462747cca5, 343 corpus + 16 default kit, 25-stop, projectView)` | same hashes reproduced with the U1 patch reverted (`git stash` on `tonal.js` alone) — proves the shoulder never touches these modes |
| C7 | `node test/engine/tonal.mjs` (sampled) | `anchor-ramp monotone: 0`, `distinct (25-stop): 16`, `pass skew-lift-okhsl`, `pass chroma-envelope`; `chromaEnvelope(` greps 1 export / 5 mentions, unchanged | scratch copy with a second `export function chromaEnvelope` reds the first grep (per the skill's own convention, not re-run this pass — no source touches that shape) |
| C8 | `node test/engine/semantic.mjs`, FLOORS comparator vs `<base>` | `pass chroma-floor`, `pass role-contrast`, `pass role-contrast Q-B floor gate`; comparator: `FLOORS changed 4, down 4` (Warning light+dark on one row, Data 3/5/8 light each their own row = 4 changed family-rows covering the 5 cell-level moves R44 names), `exit 1` (down != 0, expected under R44's re-pin); `npm run gate:corpus-contrast`: `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | negative control not re-run this pass (unchanged shape, verified in the plan's own revision-8 record) |
| C9 | `node test/ui/headless-boot.mjs` | exit 0, `HEADLESS BOOT PASS`, `(hs)` source count 4, no `(hs)` line in the log (green run) | n/a, unaffected by this unit |
| C10 | regen + `git diff --stat` vs merge-base | `git status --short` 0 after regen; `docs/` diff: `docs/reference/data/adia-oklch-export.css` unchanged (Adia carve-out holds); 4 paths beyond the named six, all one-line citation-number repairs (see Left out / notes) | n/a |
| C12 | `sh .sdlc/checks/baseline-agrees-check.sh` | 13 `ok` + 1 `STALE ui.html` (baseline 4125.3 KB, tree 4130.1 KB — the one line the rule allows) + 1 `note`, `stale total: 1`, `exit 1` — exactly the shape C12 rules for an engine change | scratch `test/run.mjs` with one extra entry reads `stale total` one higher, not re-run this pass (verified in the plan's own revision-8 record) |

## The neighbourhood term

`src/engine/tonal.js`'s `chromaEnvelope`, even branch only: `uG` (the damping exponent term) is
multiplied by a smoothstep plateau of `|sd| / EVEN_NEIGHBOURHOOD_R` (0 at the anchor, 1 by
`R = 0.2`), flattening the envelope's own infinite initial slope near the anchor. `R = 0.2` is the
plan's own established minimum (its feasibility probe swept 0.2/0.3/0.4; 0.2 is the smallest that
fully closes both spike populations). `env(anchorStop) = 1` holds unconditionally (`sd = 0` at the
anchor regardless of the plateau). Perceptual and peak never take the `isEven` branch (C6).

## Probe table, re-measured on the real engine (not the scratch probe)

| reading | before (shipped) | after (this commit) |
|---|---|---|
| lone spikes (corpus 3380 anchored + kit 16) | 64 + 1 | 0 + 0 |
| rendered dips, 25+19-stop, by stop | 90 (450: 57, 500: 32, 550: 1) | 56 (400: 3, 450: 20, 500: 32, 550: 1) |
| gate-path dips (anchor omitted) | 0 | 0 (unchanged; control at 1.6x floor still reads 155) |
| `--envelope` even cells, gate-path | 10.9/16.2, 39.1/52.2, 39.0/44.6, 16.3/16.5, above100 0 | identical |
| `--envelope` even cells, rendered | 15.6/37.0, 48.4/113.7, 42.5/80.2, 22.9/52.0, above100 670 | identical |
| even 25-stop cells moved / 94,500 | 0 | 4,580 (all within two lifted-stop steps of the anchor) |
| max |dC| at any moved cell | 0 | 19.1356 (Danger, stop 550) |

The 500-stop 32-count dip population (the notch class, Q-C/`NOTCH_ALLOW`) is unchanged and not
this unit's or this plan's — #681's. The 20-at-450 remaining dips are floor-bound (mechanism 2,
U2's `evenChroma` floor redesign); the 3 new dips at stop 400 are real and unlisted in
`EVEN_DIP_BASELINE` (U2's list to retire — U2's `gate:corpus-tonal` FULL leg currently reds on
them, expected and not this unit's criterion, C3/C4 are U2's).

## Default-kit even accent ratios, before/after, and which FLOORS moved

Independently re-measured via `brandKit`/`contrastRatio` (not read off the FLOORS comments, though
they agree to 4dp). Owner ruling R44 (`.sdlc/questions/chroma-floor-U1.md`, answer B): re-pin down
to `floor(measured, 1dp)`, the table's own stated convention.

| family | side | before | after | floor before | floor after |
|---|---|---|---|---|---|
| Warning | light | 9.9148 | 9.8756 | 9.9 | **9.8** |
| Warning | dark | 5.3334 | 5.2819 | 5.3 | **5.2** |
| Data 3 | light | 6.5224 | 6.4562 | 6.5 | **6.4** |
| Data 5 | light | 5.8350 | 5.7748 | 5.8 | **5.7** |
| Data 8 | light | 5.8570 | 5.7955 | 5.8 | **5.7** |

Every other family holds or rises (Neutral is byte-identical: zero chroma, the shoulder is a
no-op there). Six cells pass within 0.05 of their own floor without needing a re-pin: Secondary
light/dark, Danger dark, Data 1 dark, Data 4 dark, Data 6 light/dark, Data 7 light/dark. AA
(4.5:1) holds everywhere; the lowest ratio anywhere in the kit is Info dark at 4.5840:1.

`FLOORS` comparator (`<base>` 282fca8d vs this head): `perceptual entries: base 16, branch 16`,
same for even/peak; `even Warning: 9.9/5.3 -> 9.8/5.2 DOWN`, `even Data 3: 6.5/4.8 -> 6.4/4.8
DOWN`, `even Data 5: 5.8/5.3 -> 5.7/5.3 DOWN`, `even Data 8: 5.8/5.3 -> 5.7/5.3 DOWN`; `FLOORS
changed 4, down 4`, `exit 1` (non-zero `down` is the expected shape here, per R44 — the comparator
exists to make a downward move visible, not to bar it once ruled). No `perceptual` or `peak` line
moved.

A paste-ready comment for #662 (not posted; the Orchestrator posts it) is at
`.sdlc/handoffs/chroma-floor-U1-662-comment.md`.

## Movement table (blast radius)

- 4,580 of 94,500 even 25-stop cells move (4.8%), all within two lifted-stop steps of the anchor
  (`|sd| <= 0.222`, stops 400/450/550/600 under lift 0; the exact set shifts under `liftStop` for
  lifted defaults, still bounded by the same `R`).
- Max |dC| 19.1356 CAM16 C, Danger stop 550 (a saturated default, lift 0).
- Perceptual and peak: 0 cells move (C6's own fingerprint proof).
- Gate-path (non-anchored) construction: 0 cells move in count terms that matter to any gate (the
  gate-path dip sweep and the `--gate-path` envelope cells are both byte-identical before/after).
- `docs/reference/data/adia-oklch-export.css`: unchanged (`dampAmp` 70 carve-out; the Adia kit is
  excluded by name from every `dampAmp`-0 sweep this term touches).

## Left out / notes

- C10's named six `docs/` paths are untouched by this unit (no spec/glossary/CHANGELOG edit — U2
  and U3 own those). Four *additional* `docs/` paths changed for citation-line-number repair only,
  forced by this unit's own line-count shift in `tonal.js`/`test/engine/tonal.mjs`:
  `docs/reference/SKILL.md:95`, `docs/reference/rubrics/acceptance-criteria.md:25` (both
  `okhsl-modes`/`lift-monotonic` line-range re-pins), and one line each in
  `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md`
  (`okhslLAt`/`_okL` line re-pins, the identical repair class already ratified for `okl-memo` U1,
  `.sdlc/questions/okl-memo-U1.md` answer A). No prose claim changed except the two `_okL` lines,
  which now say plainly that `_okL` was removed at #738 rather than relying on the citation
  checker's old (lucky) fuzzy match.
- C3/C4 (the dip gate's own retirement, the new `gate:even-dips` script) are U2's, not graded here.
  `gate:corpus-tonal`'s FULL leg currently reds on the 3 new stop-400 dips this term introduces —
  expected, U2's first job.
- `gate:mode-isolation`'s baseline.md timing row is NOT quiet-host-confirmed (host load 10-24
  across this session, other agents running concurrently); three real seconds are recorded (20,
  27, 34) but counted 0/3 per the quiet-host rule. A genuine quiet-host set is owed before
  pre-land.
- The FLOORS comparator's own counting granularity is per (mode, family) row, not per light/dark
  cell: Warning's light+dark both moving counts as one changed row. Plan revision 11's text reads
  "down 5" describing the five CELL-level moves the ruling named; the comparator itself prints
  `changed 4, down 4` (four family rows). Both describe the same five cells; flagging the
  wording gap here rather than silently squaring it.

## Criteria verdicts

| # | Criterion | State |
|---|---|---|
| C1 | npm test green | 🟢 |
| C2 | lone spikes, true 0, no allow-list | 🟢 |
| C5 | envelope cells hold on the gate path, perceptual/peak unmoved, rendered path reported | 🟢 |
| C6 | mode-isolation gate, perceptual/peak byte-identical | 🟢 |
| C7 | ramp shape gates at zero, one envelope function | 🟢 |
| C8 | chroma-floor properties hold, contrast holds, re-pin direction correct (5 named DOWN moves, owner-ruled) | 🟢 |
| C9 | Q-D unchanged | 🟢 |
| C10 | regenerated assets clean, docs move by the named list (+4 citation repairs, named) | 🟢 |
