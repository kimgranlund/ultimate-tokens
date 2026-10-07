---
id: T-0018
title: "Arrow-stepping and palette add/duplicate/delete must keep the current right-pane tab (gh 786)"
type: bug             # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: S              # S | M | L | XL
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-07
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
GitHub #786: stepping palettes with ArrowUp/ArrowDown, or adding, duplicating or deleting a palette, must keep the current right-pane tab; only a row click switches the tab (no per-caller special cases, R98). The Roles tab that the issue named was removed in #807 (T-0016), so first check whether the same bounce still happens on the remaining tabs.

## Intent
- Do: in `src/ui/sections/color.js` / `src/ui/app.js` find `selectPalette` and the callers for keyboard stepping and add/duplicate/delete. Reproduce through the headless shim on each remaining right-pane tab (Palette, Global, Story or whatever tabs exist now); if any tab still jumps to Palette on those actions, fix it in the one place (`selectPalette` takes the tab-switch as an explicit argument only for row clicks) and add a headless-boot group that fails before the fix. If no tab bounces, add one regression group that pins the behaviour and report that the issue is moot.
- Non-goals: other tabs' behavior, engine code.
- Done when: a headless test pins that arrow stepping, add, duplicate and delete keep the current tab on every remaining right-pane tab, red before any fix (or documented as already green with the planted regression proof), `npm test` green locally; report whether #786 can be closed.

## Context
Files overlap with T-0014 (`src/ui/sections/color.js`, `test/ui/headless-boot.mjs`), which is running in `.worktrees/prime-anchor-follows-chroma`. Keep this diff tiny and merge it after T-0014 lands, with a rebase.

## Constraints
No push, PR or issue comment from the agent. Gates local through `gate_lock.py run --name <what> -- <cmd>` with SDLC_GATE_WORKERS=16. No U+2014 em dash. Never commit `*.log`, `.run.lock`, `*.attempt.json`. Run no smoke locally.
