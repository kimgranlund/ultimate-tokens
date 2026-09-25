PASS

# chroma-floor U1 review, pass 1, round 3 (reviewer-l2, F6 delta only)

| Field | Value |
|---|---|
| Target | `unit/cf-U1` @ 0d514bab, delta `33a81283..0d514bab` (`test/engine/anchor.mjs`, `.sdlc/handoffs/chroma-floor-U1.md`) |
| Round 2 | `.sdlc/verdicts/chroma-floor-U1-review-r2.md` (FAIL at d154909c on F6) |
| Host | two scratch `git clone --shared` copies of 0d514bab under `$TMPDIR` (head, plateau off), deleted after; load average 60 to 97, so no timing here is baseline evidence |

F6 is fixed. The in-gate control now renders through `hydrate()` plus a patched `projectView`, and it prints 65 at head, the same count the real engine gives with the plateau off.

## F6 at 0d514bab

| Check | State | Evidence |
|---|---|---|
| Render path | 🟢 | `anchor.mjs` loads `src/ui/model.mjs` as a data URL with its `tonal.js` import pointed at the plateau-neutralised module, then reads each palette's `fullRamp` from that module's `projectView(doc)`, where `doc` is the same `hydrate({ ...preset, toneMode: "even" })` the real sweep uses. All 15 relative imports in `model.mjs` at 0d514bab (lines 14 to 42, 234, 261) are in the rewrite list, and each missing target FAILs by name |
| Witness key | 🟢 | the key is now slug + preset name + palette name + anchor hex + stop, matching the real sweep's label, so different presets no longer collapse into one Set entry |
| Head | 🟢 | `node test/engine/anchor.mjs --full`, exit 0: `pass  anchor-ramp lone-spike ...: 0 (expected 0, corpus 3380 anchored + default kit 16, no allow-list)`, then `lone-spike negative control: plateau-neutralised engine produced 65 spike(s) over the corpus + kit (want > 0)`, `PASS (FULL)` |
| Plateau off | 🟢 | the same run with `uG *= t * t * (3 - 2 * t);` replaced by `uG *= 1;` in `src/engine/tonal.js`, exit 1: `FAIL  anchor-ramp lone-spike ...: 65 (expected 0, ...)`, the control line also reads 65, `FAIL: 1 gate failure(s)`. The real sweep and the in-gate control agree on 65 independently |
| Scope | 🟢 | `git diff --stat 33a81283..0d514bab -- src/` is empty; no engine or FLOORS change |

## Nits (not blocking)

- ⚪ The per-gate first-FAIL rule (`anchor.mjs:50`) means that with the plateau text removed, the red names the first unexpected lone-spike member, not the "patch target string was not found" guard. Round 2 already showed the guard firing when the text moves without a behaviour change. When the behaviour changes too, the gate still reds, so either diagnosis is acceptable.
- ⚪ The handoff's new prose paragraph contains one em dash, just before "together undercounting". Repair it in the next handoff edit, per the no-em-dash rule for records.

verdict: PASS
