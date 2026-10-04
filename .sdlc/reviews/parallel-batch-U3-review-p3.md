PASS

# Review pass 3: parallel-batch U3 (#787 predicate) · reviewer

Seat note: this review stands in for the capped fable reviewer seat (R92). It was run by a Sonnet 5.5 session under the team-lead's dispatch. The builder is opus; the commit trailer's Sonnet 5.5 line is boilerplate.

| Field | Value |
|---|---|
| Unit | U3, `unit/pb-U3` @ a7f4897c (pass 2 code fb7f69f1, last review head ee0a38b0) |
| Verdict | 🟢 PASS. The shared root cause of the two earlier FAILs (a name set not read from the output) is closed: every name set is now read from the real output of a registry of surfaces, and a completeness check reds when an exporter or bundle file appears that the registry does not cover |
| Contract | Owner ruling A (the 10 formats plus the 3 DS bundles, position-independent superset); `Reported, not refused` is stated in the header |
| Criteria | C3.1 🟢 · C3.2 🟢 · C3.3 🟢 · C3.4 🟢 · C3.5 🟢 · C3.6 🟢 (every command and negative control re-run) |
| Gates | `npm test` exit 0, `all 55 test files passed`, `engine/names.mjs pass`, `git status --short` 0 lines after. `NODE_OPTIONS` unset. Load average was 25 to 60 during the run, well above the 5-or-fewer guidance; nothing failed under it |
| Scope | The lane only: `src/engine/names.mjs`, `test/engine/names.mjs`, `test/run.mjs` (the `TESTS` line), handoff and review records. `src/engine/exports.js` and `src/engine/ds-export.js` untouched. U+2014 in the diff: 0. Nothing from `.claude/docs/other` |

## Re-run of the criteria

| Check | Result |
|---|---|
| C3.1 to C3.6 commands | green on re-run |
| C3.4 `node test/run.mjs` count | 55 |
| Negative controls | each reds against the module itself, run in a scratch copy: a prefix-heuristic predicate (oracle disagrees on `x-primer`, `x-5000` and 10 more); `-dark` dropped from the reader (7 failures, including the C3.5 case); the tokens.json registry row deleted (`unread surface: claude:tokens.json`); the DESIGN.md row deleted (`unread surface: claude:DESIGN.md, stitch:DESIGN.md`); a planted `exportAll` key (`unread surface: all.stylex`); a planted Claude bundle file (`1 unread`) |
| Registry completeness | `surfaces 12 read, 10 listed as NO_FLAT_NAMES, 0 unread`; planting a new `exportAll` key or a new bundle file turns the completeness check red |
| Memoization and purity | one probe render per process, memoized; names.mjs imports only `exports.js`, `ds-export.js`, `type.mjs`, `geometry.mjs`; no `document` or `window` |
| Header contract | accurate. `Reported, not refused` is on one line; the `data-1-on-data-1` claim and the `primary` and `primary-dark` kit-alias claim were each verified against real output |

## Independent probes

| Probe | Result |
|---|---|
| Raw scan of every exporter and DS bundle output for slug-bearing names | nothing slug-bearing is unread. The 334 names in the default document that no slug explains are all kit constants (shadcn, type, geometry, space) |
| Two-palette battery, 4 arrangements, 179 candidate partners (every dash prefix of every tail in any emitted name, plus `x-primer`, `x-5000`, `x-10`, underscore and spacing variants) rendered pairwise against a direct duplicate scan | 0 false negatives, 0 false positives |
| Special-slug battery (reserved radix keys, data palettes, `-dark` siblings, key colours), 448 pairs | 434 agree (299 collide). The 14 nominal disagreements were artifacts of my own scanner and each resolved by a direct render: (accent, accent-palette) and the other reserved-key siblings do not collide, because the Radix exporter's `-palette` rename (#630) prevents it; (Neutral, neutral-dark), (Neutral, neutral-hover-dark), (Primary, primary-dark), (Data 1, data-1-dark) and (data-1, data-1-dark) are real DESIGN.md duplicate keys, and the predicate correctly reports them |
| Over-approximation | by design. The DS bundles pick the chrome palette by regex, the probe is chrome, so fill-family pairs are over-reported. Example: (Neutral, x, x-background-dark) is reported although that arrangement's DESIGN.md is clean. Contract A names this as a superset |
| Candidate partners in a one-palette process | `nameCollisions` agrees with the direct scan on 127 colliding of 179 candidates; the rest are correct cleans (`x-primer`, `x-5000`, `y`) |

## Findings, by severity

No critical, major or medium findings.

### L1 · low · a palette named `Meta` or `Constants` is overwritten silently in `all.json`

`exportAll` writes top-level `meta` and `constants` keys beside the palette keys, so a palette whose slug is `meta` or `constants` is clobbered. It is in the same "kit constant" class as the other reported-not-refused cases but the header does not name it. A one-line header addition covers it. No change to behaviour needed.

### L2 · low · `templateNames()` hands out the mutable memo set

A caller that adds to the returned `Set` poisons every later `emittedNames`. I confirmed it in a scratch process: after `templateNames().add("zzmut")`, `emittedNames("q")` contains `zzmut`. No current caller mutates it. Return a copy or freeze it.

### L3 · low · the oracle covers one arrangement

`test/engine/names.mjs` renders the x-first arrangement only. My battery shows the other arrangements agree, so this is coverage, not a defect.

### L4 · low · first call cost

The first call costs about 120 ms (one probe render across the 12 surfaces); later calls are memoized. The handoff already documents this.

## Next

Orchestrator: record this PASS, take U3 to the Verifier. L1 and L2 are optional follow-ups.
