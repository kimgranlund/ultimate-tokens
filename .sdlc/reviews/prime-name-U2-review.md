PASS

# Review prime-name U2 (records) · #789

Reviewer l3, pass 1. Branch `unit/pn-U2`, head `2ef8d733`, records commit `926e2714`, base `plan/prime-name` `f70c3f94`. Criteria: `.sdlc/plans/prime-name.md` U2 C2.1 to C2.5 (revision 4). Diff is 7 record files plus the handoff; no `src/`, board, or plan file touched.

## Criteria

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| C2.1 | `git grep -l prime-prime -- docs plugin ':!docs/tickets' ':!docs/plan/archive' ':!docs/reference/data'` | `no output`, rc 1 | the three named files held the needle at base; the diff replaces one in each (`git diff f70c3f94..926e2714 -- docs`) | 🟢 |
| C2.2 | the plan's `grep -oE ... \| sort -u \| wc -l` on the skill | `6` | same command on the skill at `f70c3f94`: `2` | 🟢 |
| C2.3 | the plan's `awk ... \| grep -cF` | `3` (at least 1) | the entry is the only `[Unreleased]` addition; dropping it leaves `0` | 🟢 |
| C2.4 | not re-run by me | builder reports `npm test` exit 0, `54` files, tree clean | host load average `9.6` at review start, so no second `npm test`; the diff is docs only and the em-dash scan was run directly (`0` hits) | 🟡 verifier owns the run |
| C2.5 | `git grep -a -n 'brand-kit/3\|version: "0.3.0"' -- .claude/skills` | `no output`, rc 1 | the diff shows the five lines (foundations 13, 41, 43; best-practices 70, 73) were `/3` and `"0.3.0"` before | 🟢 |

## Checks asked for

- CHANGELOG entry is true: bare name `--{pfx}-{n}-prime` and Tailwind `--color-{n}-prime` match `primeSlug` use at `exportCSS` and `exportTailwind`; schema 4 matches `EXPORT_SCHEMA_VERSION = 4` (`src/engine/exports.js:55`); MCP 0.4.0 matches `SERVER.version` (`mcp/brand-kit-core.mjs:15`); one new entry under one new `### 2026-10-03` heading; the only `prime-prime` in the live tree outside archives and `.sdlc` is that entry's breaking note (`CHANGELOG.md:16`). `#789` is the ticket, not a PR number; the file header says entries cite the squash-merged PR, so the Orchestrator may swap it at landing.
- Panda key-path sentence is accurate: `exportPanda` builds `raw.prime[step]` for every `PRIME_STEPS` entry and `prime.DEFAULT = prime.prime` (`src/engine/exports.js` around line 982 to 988), so the centre is `prime.prime` and `prime.DEFAULT`, unchanged by U1.
- Edited lines assert nothing U1 made false: EX-7 (Tailwind bare `--color-primary-prime`), knowledge-04 line 349, panda-park spec (a), the skill paragraph, and the maintaining-brand-kit-mcp numbers are all consistent with the code at head.
- Stale scan across live tree (excluding `docs/tickets`, `docs/plan/archive`, `.sdlc`): `prime-prime` one hit (the allowed note); `brand-kit/3` none; remaining `0.3.0` hits are SPEC/LLD document versions and the `adding-export-formats` "SPEC 0.3.0 RP-8" cite, none is the MCP server version.
- Em dash (U+2014): 0 in the diff `f70c3f94..HEAD`.

## Findings, ranked

1. Medium. Generic prime patterns in canonical docs still read as if the centre were suffixed. With `{step}` ranging over the seven `PRIME_STEPS`, these lines now imply `prime-prime` for the centre, which U1 made false, and unlike `ds-export.js` prose (plan section 1: "pattern plus the bare-centre note") they carry no bare-centre note:
   - `docs/reference/references/knowledge-04-export-formats.md:259` (CSS row) and `:263` (Tailwind row), the canonical export table
   - `docs/spec/spec-muted-base-key-spikes.md:300` and `:302` (REQ-054 naming), and `:636` (R3)
   - `docs/lld/lld-muted-base-key-spikes.md:128` and `:132` (emitted names block)
   - `docs/reference/references/knowledge-02-tonal-scale.md:298`
   C2.1 passes because it greps the literal, so this is outside the criteria; it falls under the "stale context is a defect" rule. Cheapest repair in this unit: append "(the `prime` centre is the bare `--{n}-prime`)" to 259 and 263 and to REQ-054, leave the LLD block comment with one note line. Orchestrator's call whether to fold in now or file a follow-up.
2. Low. The Panda parenthetical is placed in Radix-preset sentences (knowledge-04:349, panda-park spec (a)). It is true of the Panda raw exporter, but those sentences describe the Radix refs preset, whose centre key is the single leaf `colors.{n}.prime` (`group.prime` in the Radix builder). A reader could take "Panda key path" as the Radix leaf. Suggest "the Panda raw key path (`exportPanda`)" to disambiguate.
3. Low. `docs/site/describe-palette-spec.md:339` and `:408` cite `ultimate-tokens-brand-kit/1`; stale before U2 (schema was 3), not caused by this change. Mention only.
4. Low. knowledge-04:349 and spec EX-7 lines now run long (single-line parentheticals); no gate is affected.

## R98

R98: none found. One CHANGELOG breaking note names the old variable; no alias, mapping, or legacy layer in any edited file.

## Verdict

PASS. All five criteria hold; finding 1 is a Medium follow-up outside the criteria, not a blocker.
