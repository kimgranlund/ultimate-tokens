# Integration brief · compute-layers · merge main into the plan branch · orchestrator to builder

| Field | Value |
|---|---|
| Worktree | `.worktrees/cl-merge`, branch `unit/cl-merge`, from `plan/compute-layers` @ 9862c5f0 |
| Task | `git merge --no-ff origin/main` into `unit/cl-merge`, resolve every conflict, commit (one merge commit, trailer `Seat: builder`), return the sha. No other change. |
| Known conflicts | `src/engine/exports.js` (compute-layers U1 removed `controlsOf`, main's pane-context #785 added fields to it: `baseChroma`, `primeChroma`, `paletteGroups`, `hueSpace` comment text and others; read `git diff 9862c5f0..origin/main -- src/engine/exports.js`), so the added fields belong in `resolveControls` in `src/engine/controls.mjs` and `test/engine/controls.mjs`/`anchor.mjs` parity must hold; `docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md` (line numbers: take main's); `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` are generated: resolve source first, then regenerate (`npm test` runs the gen chain) and `git add` the outputs |
| `.sdlc/board.md` | not in this worktree's lane: if it conflicts, take main's (`git checkout --theirs .sdlc/board.md`) |
| Gates | `unset NODE_OPTIONS`; heavy count (`ps -Ao command \| grep -E 'test/run.mjs\|gate:\|--full' \| grep -vc grep`) 5 or fewer, wait inside your turn; `npm test` green with the tree clean; `npm ci && npm run build` green; `node test/repo/em-dash.mjs` and `node test/repo/branding.mjs` clean |
| Rules | R98: no shim or fallback. No U+2014. Scratch only under `/Users/kimba/.claude/jobs/8c58a81c/tmp/cl-merge/`. Do not push. Write `.sdlc/handoffs/compute-layers-merge-main-done.md` in the worktree listing each conflict, how it resolved, and the gate output |
