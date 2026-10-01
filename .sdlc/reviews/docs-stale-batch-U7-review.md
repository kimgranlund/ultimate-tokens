PASS

# Review docs-stale-batch U7 pass 1 · trivial lane · #779

Reviewed unit/dsb-U7 @ 7b6275e5 (base plan/docs-stale-batch @ 66dfb49b). Every criterion and its negative control run by the reviewer.

| Id | Result | Evidence |
|---|---|---|
| U7-1 | pass | `every executor path` 0, `hand-mirrored` 1 at the head; control: the base blob prints 1 for the first grep. The new line matches `figma/README.md:38` |
| U7-2 | pass | `stale total: 0`, Correction count 1 (names U3, U4, U7 comment edits); `npm test` here printed `wrote figma/plugin/ui.html 4160.0 KB`, tree clean after; control: baseline row set back to 4159.4 KB makes the check print `stale total: 1` |
| U7-3 | pass | U1 ledger has 5 rows (4 present, 1 absent), bare-path anchors, no `path:line` anchor; P3 `5 ok`, `1`, `1`; P4 `SAME` at bf3a73af; controls: base U1 handoff has 0 `## Claims`; a ledger needle edited to a missing word printed `MISS` |
| U7-4 | pass | ANSI grep 0; P4 on U4 `SAME` at 6497a7bd (non-TTY, `FORCE_COLOR` unset); control: base U4 handoff has 2 ANSI lines |
| U7-5 | pass | diff names only baseline.md, U1, U4, U7 handoffs, `migrations.mjs`, `ui.html`; code-token count 0; `ui.html` text diff is the same one comment line; control: a planted code line prints 1 |
| U7-6 | pass | P1 exit 0, `all 54 test files passed`, tree clean (heavy-suite count was 0 before the run); P2 em-dash and branding clean; P3 and P4 on the U7 handoff `5 ok`, `SAME` at its named head 14a15aa9; P5: no `scripts/`, `githooks/`, `hooks/` path |

## Findings

1. Info. P4 replays only at the head the ran block names (the first line is the sha): on the U1 and U4 handoffs at 14a15aa9 the diff is that line alone. By design per P4's own control, so not a defect, but the pre-land reviewer must check out each handoff's named head.
2. Info. The U7 handoff's named head 14a15aa9 is one commit before the unit tip 7b6275e5 (the handoff commit itself), as the handoff states.
3. Info. U7-5's "generated files that comment moves" is one file, `figma/plugin/ui.html` (+27 bytes), no figure change; `npm run build` and smoke were not run (no `node_modules`), owed at pre-land.

No blocking or major findings.
