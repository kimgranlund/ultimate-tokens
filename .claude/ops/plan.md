# Ops plan — ultimate-tokens

## Status 2026-07-29 (host session update)

- ✅ 1 branch sweep — done; remotes down to 3
- ✅ 2 push `aa2f58c` — done; main in sync
- ✅ 3 ADR coverage — RESOLVED NO-MIGRATION: harness 2.4.5's `adr_checkpoint.py` gained single-file mode; classify verified green against the monolith 2026-07-29 (21 ADRs, supersessions adr-004/adr-008 detected). This repo's `<adr-source>` is `docs/reference/references/decision-records.md`. #401 (the split, filed on the stale halt evidence) closed obsolete; the 2026-07-25 halt was an older cached tool version.
- ✅ 4 OD-004 — re-statused DEFERRED (087063b)
- 🟡 5 PR #158 go-live — still held; LS dashboard activation-limit check remains (Kim)
- ✅ 6 bootstrap answers — recorded (0c8cb2c)
- ✅ 7 gitignore rules — CLOSED NO-CHANGE: both rules are live, not dead (`test/plugin/hosted-pack.mjs:21` creates `.hosted-pack-scratch/`; `.github/workflows/pages.yml:41` builds `_site/`); repo-cleaner's "match nothing" check misses runtime/CI-only paths

- **Written:** 2026-07-25, by chore-planner (sweep dispatch from chore-lead)
- **Mode:** sweep — judged exactly the three attached seat reports (decision-watcher 🟡, issue-sorter 🟢, repo-cleaner 🟡); nothing refetched
- **Prior plan:** none existed — this is the first plan for this repo; no carry-forward entries
- **Live-state coverage:** all three seats measured; nothing UNMEASURED this dispatch

## Queue

### 1. Finish deleting the 58 merged-and-verified remote branches

- **Action:** Re-dispatch repo-cleaner to run `campaign_close.py <pr>` for the remaining 58 PRs — or, if the classifier keeps refusing, a human runs a one-time `git push origin --delete <branch>` sweep from the report's table. Whoever unblocks it should also answer why the classifier allowed 23 invocations then refused (per-session heuristic?), so the next campaign doesn't stall the same way.
- **Owner:** repo-cleaner (re-dispatch), fallback Kim (manual `git push origin --delete` sweep)
- **Evidence:** repo-cleaner report `.claude/ops/reports/2026-07-25T191525Z.md` — full PR#/branch table; every entry independently reverified `MERGED` with branch live on `origin` via fresh `git fetch --prune` (84 → 61 branches after the 23 already closed this firing). Backlog reaches back to PR #85/#97.
- **Size:** ~30–45 minutes scripted (58 invocations); ~15 minutes as a manual batch delete

### 2. Push local `main` commit `aa2f58c` (issue-sorter ops bootstrap)

- **Action:** `git push origin main`. Before any future `git pull`/`sync_main.py` on this checkout, verify `aa2f58c` is still present (not silently dropped).
- **Owner:** Kim (push consent is human-held)
- **Evidence:** repo-cleaner report — local `main` = `aa2f58c`, `origin/main` = `369bc82` (1 ahead, unpushed); `git show --stat aa2f58c` confirms only `.claude/ops/*` files touched (friendlies.json, held-items.md, watch-checkpoint.json). Verified safe: no source files in the commit.
- **Size:** 2 minutes

### 3. Decide decision-watcher ADR coverage for this repo

- **Action:** Human decision, three options: (a) split `docs/reference/references/decision-records.md` (21 ADRs, one monolithic file) into per-ADR files with `doc-type: adr` frontmatter — a TKT-0031-shaped migration; (b) point the checkpoint tool at the single-file shape (e.g. section-level hashing); (c) declare this repo's ADR corpus out of scope for the automated checkpoint and rely on manual sweeps. Until decided, every scheduled decision-watcher firing halts and produces no value.
- **Owner:** Kim (placement/tooling decision — the seat explicitly declined to invent it)
- **Evidence:** decision-watcher report — `adr_checkpoint.py classify` halted on missing `<adr-dir>`; all 21 ADRs live as `##` sections with inline `**Status.**` lines; manual sweep otherwise clean (no orphaned review findings, no ADR drift)
- **Size:** decision ~10 minutes; option (a) migration is hours if chosen

### 4. Resolve OD-004 — plugin-free Figma import validation, stale 5.5 weeks

- **Action:** Either run the manual native-Figma import cascade test in `docs/reference/references/od-004-plugin-free-import-test.md` and update ADR-002/OD-004 with the result, or explicitly re-status OD-004 to `DEFERRED` (matching OD-002) so it stops reading as an active loose end.
- **Owner:** Kim (manual Figma test; only a human can run it)
- **Evidence:** decision-watcher report — `docs/reference/references/spec-draft.md:206-209` shows OD-004 `OPEN — spike implemented (2026-06-17)`, untouched since; the `rawColl` opt-in is shipped and shape-gated (`hpg-export-resolved`) but never validated end-to-end in real Figma — users could rely on unconfirmed behavior today
- **Size:** manual test ~1 hour; re-status ~10 minutes

### 5. PR #158 — held go-live flip (TIERS_ENFORCED → true)

- **Action:** Human decision: complete the known pre-merge check (LemonSqueezy dashboard activation-limit verification) and merge #158, or leave it held with that reasoning current. No agent merges this.
- **Owner:** Kim (held approval)
- **Evidence:** issue-sorter report — PR #158 open, the known held go-live PR; repo-cleaner confirmed `feat/go-live-flip-held` untouched and correctly classified healthy/held, not stale
- **Size:** dashboard check ~15 minutes; merge ~5 minutes

### 6. Answer the two issue-sorter bootstrap questions (roster + MCP offer)

- **Action:** (a) Confirm `friendlies.json` trusted-author roster as `[kimgranlund]` or name additions; (b) accept or decline the project-scoped read-only GitHub MCP server offer (`https://api.githubcopilot.com/mcp/`, PAT via `${GITHUB_MCP_PAT}` env-var only). Record both via a follow-up issue-sorter dispatch so the offer stops re-surfacing.
- **Owner:** Kim (both are REQ-011/REQ-013 human answers), then issue-sorter records them
- **Evidence:** issue-sorter report — `.claude/ops/friendlies.json` evidence-seeded this firing (sole owner/collaborator/historical author); MCP offer state "surfaced-but-pending, will re-surface until answered"
- **Size:** 5 minutes total

### 7. Retire the 3 stale `.gitignore` rules

- **Action:** Confirm none of `_site/`, `*.local`, `test/plugin/.hosted-pack-scratch/` is deliberately forward-looking, then delete the dead rules (small PR or fold into the next hygiene commit).
- **Owner:** Kim decides forward-looking status; repo-cleaner (or any maker) executes the edit
- **Evidence:** repo-cleaner report — `gitignore_check.py` read-only run, `warn` verdict: 3 rules match nothing in the tree, no `FAIL`
- **Size:** 10 minutes

## Watched, not queued

- **#377** (hosted describe-palette MCP) — blocked externally (domains, accounts); correctly labeled, nothing actionable from this side.
- **#379** (describe-palette tracking issue) — umbrella only; closes itself when #377 unblocks. No independent action.
- **OD-002** (semantic 250/500 scrims) — explicitly `DEFERRED`, not stale-by-neglect.
- **17 of 18 archived ticket files carrying `status: open` frontmatter** — by design per ADR-017/TKT-0031 (frozen snapshots; GitHub is live truth). Named, not a defect.
- **Issue/PR triage backlog** — none; all 34 all-time issues correctly labeled, no unlabeled or unknown-author items (issue-sorter, 🟢).
