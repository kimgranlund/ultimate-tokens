PASS

# U6 lane review, pass 1 (docs-stale-batch, #768)

Head 49a0f10a, unit base 0d71383a. Every check re-run by the reviewer with `/usr/bin/grep`; the old-state control is the same command at 0d71383a (or the merge base 8428280e for U6-3).

| Check | New | Old or control | Result |
|---|---|---|---|
| U6-1 (amendment, ledger, ran block, #768 in §6) | `4 1 1 1` | base `3 0 0 0` | 🟢 |
| U6-2 (archive cite, file exists, P8 row) | `1`, path, `1` | base cite count `0` | 🟢 |
| U6-3 (nothing outside §6 moved) | `0` | one edit at `## 1.` reads `4` | 🟢 |
| U6-4 (ledger row, bare-path anchor) | `1` | anchor edited to `adapter.md:200` reads `0` | 🟢 |
| P2 em-dash / branding | clean (1065 / 1057 files) | builder control: planted U+2014 fails | 🟢 |
| P3 | 8 ledger rows `ok`, `1`, `1` | see finding 2 | 🟢 |
| P5 | `.sdlc/adapter.md`, `.sdlc/handoffs/docs-stale-batch-U6.md` only, both `.md` | none under `scripts/`, `githooks/`, `hooks/` | 🟢 |
| P1 `npm test` (ps count 0, below 2, so run here) | exit 0, `all 54 test files passed`, tree clean | handoff: same at 20b5cfea | 🟢 |

Lane boundary: the diff is one 2-line addition in §6 of the adapter (one paragraph plus its blank line) and the handoff. Nothing else moved. The new paragraph cites only the archived plan path; the `absent` ledger row for the live plan path holds.

Accuracy against the plan's record shape: the paragraph states the ledger columns, the three kinds, the bare-path anchor, the `~~~sh ran` first line, the `# <id>` line per criterion, the `~~~out ran` pair, and the re-run-and-diff rule, matching "The record shape this plan uses". It does not mention the `# P2` / `# P6` lines or which P rows stay out of the block; the plan scopes that to itself, so that omission is fine.

## Findings

1. Low. The paragraph says the needle is "taken from the sentence", while R10 (adapter §6) says a needle is a function name, id or count "never exact prose". The plan's own U6 text uses the same wording, so this is inherited, not a builder error. Not a blocker.
2. Low (plan, not unit). P3's literal command filters the header with `(Claim\|---)`, which in ERE does not match the header row, so it reports 9 rows (header included; its kind `Kind` matches no case arm). The handoff states 8, the true count. Fix the plan's filter in a later revision if desired.
3. Note. Builder did not merge `origin/main` 550becc2; the handoff explains it (only `board.md` differs, adapter identical). U6-3 against the merge base reads `0`, so nothing is hidden.
4. Note. `npm run build` and smoke not run here (no `node_modules`); owed at pre-land, as the handoff says.
