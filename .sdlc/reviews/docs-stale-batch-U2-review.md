PASS

Reviewer pass 1, docs-stale-batch U2 (#779, closes #773), trivial lane. Head f6e5b174 (code commit 53aa63e1), base 17edb2d2.

## Findings

| Sev | Where | Finding |
|---|---|---|
| 🟡 | `.sdlc/handoffs/docs-stale-batch-U2.md` `~~~out ran` line 1 | The block's first line is `53aa63e1` (the code commit), while the branch head is `f6e5b174` (handoff commit). P4 run literally at HEAD prints `f6e5b174` and diffs on line 1. The handoff states the block was run at 53aa63e1, so the pair is honest; the orchestrator should run P4 at the named code sha or accept the sha line as the known difference. Not a content defect. |
| 🟢 | `best-practices.md:29-30` | New sentence is true against code. `fit()` (`src/ui/app.js:544-551`) sets `{ panX: 0, panY: 0, zoom: 1 }` and schedules `_fitTopLeftInset` (`app.js:560`), whose comment says it positions the scene's top-left corner at a fixed CANVAS_INSET, "not dead-centered". |
| 🟢 | workaround 1, P2 `cut -d' ' -f1-2` | Keeps intent. I re-ran both scans: `em-dash: clean (1015 files scanned)`, `branding: clean (1007 files scanned)`. Only the trailing file count is dropped, and that count includes the handoff so it cannot be stable across the code and handoff commits. The verdict word is what P2 asserts. |
| 🟢 | workaround 2, in-awk count | Keeps intent. The plan's original `grep -c -E 'zoom: 1\|_fitTopLeftInset'` and the builder's awk both print `3` on the head. The control (renaming the helper inside `fit()`) drops the plan probe to `1` with my broader sed (the plan's narrower rename gives `2`), and the awk uses the same two patterns, so it discriminates the same way. |

## Criteria re-run (own runs at f6e5b174)

| Id | Result | Control |
|---|---|---|
| U2-1 | `0`, `1`, `4` (expected `0`, `1`, 2 or more) | base 17edb2d2 prints `1`, `0` |
| U2-2 | `3` | `_fitTopLeftInset` renamed inside `fit()` gives a lower count (`1`) |
| P2 | clean, clean | n/a |
| P5 | names exactly one `.md` plus the handoff; nothing under `scripts/`, `githooks/`, `hooks/` | n/a |

Hygiene: no U+2014 in either changed file, no board file, no `.claude/docs/other/` path. `npm test` not re-run (builder ran it; 54 files green, tree clean).
