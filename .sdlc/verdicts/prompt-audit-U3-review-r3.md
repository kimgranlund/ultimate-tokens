FAIL

# prompt-audit U3 review, pass 3 (#758)

- reviewed: unit/pa-U3 at ddff8a39 (records fix on top of bfde1cd9), delta 77639f59..ddff8a39 plus the baseline diff against B
- B: 8f5c6dc0 (unchanged from pass 2; ddff8a39 adds no merge)
- reads: `git clone -q --shared` of the worktree, `/private/tmp/claude-501/pa-U3-r2`, head ddff8a39
- negative controls: `/private/tmp/claude-501/pa-U3-r2-neg`, head ddff8a39, each edit restored with `git checkout` (`git status --short` 0 at the end)
- scope of the delta: `.sdlc/baseline.md` (1 line), `.sdlc/handoffs/prompt-audit-U3.md` (2 lines), and the pass 2 record; `git diff --name-only 77639f59 ddff8a39 -- mcp src figma test` prints 0, so the pass 2 criteria results (U3-1 to U3-8, `npm test` 53 of 53) carry forward unchanged

## Checks

| Check | Result | Evidence (clone at ddff8a39) | Negative control (neg clone at ddff8a39) |
|---|---|---|---|
| #681 line reads 6.4 KB | 🟢 | line 273: `grew by 6.4 KB`; 4117.5 minus 4111.1 is 6.4 | line set back to 6.7: the `grew by 6.4 KB` count drops to 0 |
| baseline diff vs B is only the build cell and the U3 paragraph | 🟢 | `git diff 8f5c6dc0 -- .sdlc/baseline.md \| grep -E '^[+-][^+-]'` prints 3 lines: the build cell's `-` and `+` and the added U3 paragraph (`4118.0 KB to 4124.7 KB`, `grew by 6.7 KB`, both true) | #681 line set to 6.7: the same filter prints 5 lines |
| handoff U3-3 evidence cell | 🟢 | reads `Only available once a kit has been GENERATED` 0 | 77639f59's handoff: the `GENERATED` 0 match counts 0 |
| handoff M6 row | 🟢 | now says `describe-mcp-core.mjs` still prints 1 and that the standalone lint clause was reworded in the second rework commit; measured: `mcp/describe-mcp-core.mjs:1`, `mcp/brand-kit-merged-core.mjs:0` | 77639f59's handoff: the `still prints 1` match counts 0 |
| handoff baseline-note row | 🔴 | still reads "correction paragraph re-figured to 4124.7 and 6.6 KB"; the U3 paragraph at line 347 reads `grew by 6.7 KB` | the cell with `6.7 KB` typed in prints `re-figured to 4124.7 and 6.7 KB`, so the grep sees the difference |
| baseline check | 🟢 | `ok    ui.html: baseline 4124.7 KB, tree 4124.7 KB`; `stale total: 1`, the known `time test` prose line, out of scope | pass 2's control (cell at 4124.6 prints `STALE ui.html`) still applies; the figure did not move |
| em-dash and branding over the new records | 🟢 | `em-dash: clean (795 files scanned)`; `branding: clean (787 files scanned)`; added U+2014 lines under `.sdlc/` since B: 0 | not run (no added glyph to remove) |
| `npm test` | not re-run | the delta touches only `.sdlc/` records, and both tests that scan `.sdlc/` (em-dash, branding) ran directly above; pass 2's foreground run at 77639f59 was 53 of 53 with a clean tree | n/a |

## Findings

| Sev | Where | Finding | Fix |
|---|---|---|---|
| 🔴 Medium | `.sdlc/handoffs/prompt-audit-U3.md`, Review r1 rework table, `baseline note` row | the third of the three cells pass 2 named is unfixed: it says the U3 paragraph was "re-figured to 4124.7 and 6.6 KB", while the paragraph reads 6.7 KB. The fix commit's message says the handoff cells were restored, so the record claims a fix that is not in it | change `6.6 KB` to `6.7 KB` in that cell; proof `grep '^\| baseline note \|' .sdlc/handoffs/prompt-audit-U3.md \| grep -c '4124.7 and 6.7 KB'` prints 1 |
| 🟡 Low, open by ruling | `mcp/describe-mcp-core.mjs` `generate_kit` description | "plus a lint array" still double-counts `lint`; team-lead ruled it open and non-blocking | none this unit |

## Next

Records-only builder pass: the one `6.6` to `6.7` in the handoff's baseline-note cell. No code, bundle or baseline change.

verdict: 🔴
