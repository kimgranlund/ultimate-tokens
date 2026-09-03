## Scenario playbook — the seven procedures, worked

Each scenario below was run for real, through the Figma MCP, against the live BZZR Tokens file.
The BZZR numbers cited are real outcomes, not illustrations — read them as evidence a procedure
scales, not as a target to hit. Source findings: `docs/tickets/tkt-0009.md` (collection merge,
segment bindings), `tkt-0010.md` (rename-in-place, readback), `tkt-0012.md` (the engine-side
rename capability these scripts either drive or stand in for), `tkt-0013.md` (the full ADR-016
rename wave + the frozen-map coverage bug).

Every scenario assumes `figma-use` is already loaded and every write happens inside one
`use_figma` script — split a migration across multiple calls only when a step genuinely depends on
inspecting the result of a prior one; a same-call readback (scenario 5) is only meaningful if nothing
else touched the file in between.

### 1. Id-preserving rename-in-place

**Rule.** `variable.name = "new/name"` (equally: a collection's `.name`, a style's `.name`) mutates
the object in place — the id is untouched, so every existing binding (a node's `boundVariables`, a
style's bound field, a component's variant prop) keeps resolving through the rename with **zero**
re-binding. The alternative — delete the old-named thing and create a new one — is a *prune +
recreate*, and it orphans every consumer: Figma's normal apply loops reconcile by name, so from
their point of view a renamed variable simply vanished and a new, unrelated one appeared.

**Procedure.**
1. Build (or load, from `figma/binder/migrations.mjs`) the `{oldName: newName}` map for the
   surface being renamed — variables, a collection, or styles.
2. Enumerate the live collection/variable/style set and resolve each entry against the map by
   OLD name.
3. For every match, set `.name = newName` directly — never `remove()` + `create()`.
4. Anything in the live file NOT matched by the map is either already-current (already renamed, or
   never had the old name) or a genuine miss — treat a miss as scenario-1's trap (below), not as
   "nothing to do."
5. Readback (scenario 5): re-fetch the same objects by id and assert `.name === newName` for every
   entry the map claimed.

**Trap: an incomplete rename map is a SILENT partial rename, not an error.** TKT-0013's frozen
`SCRIM_STEPS_FROZEN` constant (in `figma/binder/migrations.mjs`) listed 7 of the engine's 11
canonical scrim steps — the migration ran clean, reported success, and left 32 of BZZR's scrim
color variables (the 4 missed steps × 8 palettes) on the old name, unnoticed until a later
full-count readback. Nothing threw: the missing steps were simply outside the map's domain, so
they were correctly skipped by a rename pass that only ever acts on what it's told about.
**Defense:** before calling a rename
pass done, diff the map's claimed old-name DOMAIN against the live file's actual pre-migration
name set — the map should cover every name matching the OLD grammar, and the diff should be
empty in both directions (map claims a name the file doesn't have → dead map entry, worth
investigating; file has an old-grammar name the map doesn't claim → the TKT-0013 bug shape,
fix the map's source constant, not the live file by hand only). This is a generalization of the
`test/figma/migrations.mjs` gate added after the bug was found (it snapshots the live engine
constants a migration map claims to mirror and fails if they drift).

**When there's no frozen map yet.** A migration is sometimes the FIRST time a rename ships (before
`figma/binder/migrations.mjs` has an entry for it) — build the map from the engine's own
before/after naming functions (e.g. old-grammar and new-grammar name builders side by side) rather
than hand-typing pairs, then commit that derivation into `migrations.mjs` in the same change so the
next migration — and the next normal apply-loop run — inherits it (see SKILL.md step 1).

### 2. Full-payload mode/breakpoint add

**Rule (hard-constraints §7 — cited, not restated here):** `addMode()` mints a column without
populating it; every variable keeps reading the new mode from its default until explicitly given
a value, and nothing errors or looks empty in the meantime.

**Procedure — what's new beyond the constraint itself:**
1. `addMode()` once, capture the new mode id.
2. Build the payload from the collection's **FULL** live variable list — not from a subset you
   remember touching, not from "the variables this ticket cares about." A breakpoint mode is
   collection-wide; a constant that "doesn't vary" (space/radius ladders, borders, focus rings in
   this engine's Geometry collection) still needs its value SET for the new mode.
3. Call `setValueForMode(newModeId, value)` for every variable in that full list.
4. Readback (scenario 5): assert `unset === 0` in BOTH directions — `(payload keys) − (collection
   variable names)` (a typo/stale-list target) and `(collection variable names) − (payload keys)`
   (the constraint's actual failure mode: a variable the new mode never got a value for).

**Worked scale:** BZZR's TV mode (a 6th, file-only breakpoint, not part of the shipped engine's
mode set) was added by hand against 350 variables — the payload was built from the collection's
own variable enumeration, and `unset === 0` was asserted before the mode was considered live.

### 3. Segment-level binding recovery

**Rule (hard-constraints §6 — cited, not restated here):** a mixed-styled text node binds
`fontSize`/`letterSpacing` PER SEGMENT; node-level `setBoundVariable` silently no-ops on it, and
`paragraphSpacing` is the exact inverse (node-level only, throws on a range).

**Procedure — the ordering + proof this playbook adds:**
1. For every text node the migration touches, call
   `node.getStyledTextSegments(["boundVariables"])` FIRST — don't assume uniform styling.
2. If it reports more than one segment, re-point EACH segment individually via
   `setRangeBoundVariable(segment.start, segment.end, field, newVariable)` — never the node-level
   setter for a segmented field.
3. Re-bind `paragraphSpacing` node-level only, after every segment's font has finished loading (an
   early call before fonts resolve silently doesn't take either).
4. A migration touching text must handle BOTH layers in the SAME script and re-scan
   (`getStyledTextSegments` again, plus a fresh node-level read) before reporting done — the
   setter's return value proves nothing either way.

**Worked scale:** ~60 mixed-styled specimen nodes across BZZR's Typography page needed this
recovery during the TKT-0009 collection merge; the plain node-level rebind path (used for the
other ~4,000 uniform text layers) silently skipped every one of them on the first pass.

### 4. Zero-consumer sweep before deletion

**Rule.** Never delete a collection, variable, or style because an EARLIER investigation found no
consumers. Consumers change as a migration proceeds (a rename, a rebind, a segment recovery all
alter what's "live") — the only sweep that's trustworthy is the one run immediately before the
delete, in the same session as everything that preceded it.

**Procedure.**
1. Enumerate every page and every node in the file (a full tree walk / `findAll`, not a cached
   panel count) and check each node's `boundVariables` (and, for text, each segment's) for any
   reference to the target's id.
2. Enumerate every style object and check its bound fields the same way — a style can be the last
   consumer even when every node in the canvas has already been re-pointed.
3. Only when BOTH sweeps return zero, delete/retire the target.
4. Prefer a **retire** over a hard delete where the shipped engine supports it (this repo's
   apply-loop tags a superseded collection with `retire: [...]` and the executor only removes a
   REGISTRY-TRACKED collection under that name — provenance-only, so a user's own same-named
   collection survives). A live-file migration doing the equivalent by hand should apply the same
   caution: confirm the target is the one THIS migration created/owns before deleting it.

**Worked scale:** TKT-0009's Typography collection was deleted only after re-pointing 464 style
bindings across 136 styles AND every node-level consumer (183 + 60 nodes on the Typography page,
6 on a Scratch page) — the delete followed a FRESH zero-consumer sweep run after all of that
re-pointing, not the sweep that first scoped the work.

### 5. Same-call readback verification

**Rule.** Every write in a migration script gets verified by a READ, in the same script, before
the migration is reported done. A setter returning without throwing is not evidence of anything —
scenario 2 and scenario 3 are both concrete cases where Figma's API accepts a call and silently
does nothing.

**Procedure.**
1. After each batch of writes (a rename pass, a mode payload, a segment recovery pass), re-fetch
   the SAME objects by id (not by name — the name may have just changed) and assert the expected
   post-state directly: name equals the new name, value-for-mode equals the payload, segment
   binding equals the new variable.
2. For a bulk value change, verify VALUES, not just presence — cell-for-cell against the ratified
   source table, not merely "every variable has SOME value for this mode."
3. Roll the assertions up into one explicit tally (e.g. "270 variables, 1,350 values, 0
   mismatches" or "141 styles, 0 unbound, 0 dangling") and report that tally, not "it ran without
   error."

**Worked scale:** TKT-0009's merge verified all 1,350 values (270 variables × 5 modes) cell-for-
cell in the same call that wrote them; TKT-0010's rename verified 180 values (the gap matrix +
four pads, across 6 modes) with a formula check, `0/180` mismatches, in the same call as the
writes.

### 6. Collection merge with alias/style re-pointing

**Rule.** Folding one collection into another (e.g. TKT-0009's Typography → Geometry fold) is
scenarios 1–5 composed, in order, plus one extra concern: every CONSUMER of the source collection
— alias targets, style bindings, node-level bindings — must be re-pointed at the destination
BEFORE the source is retired, and a MODE MISMATCH between the two collections needs an explicit
resolution, not a silent drop.

**Procedure.**
1. Copy every source variable's values into the destination collection under its new (typically
   prefixed, e.g. `type/<voice>/<step>/<prop>`) name — verify cell-for-cell (scenario 5).
2. **Resolve mode mismatches explicitly.** If the two collections don't share an identical mode
   list, union the mode sets in the destination; for each half's variables, back-fill any mode it
   doesn't natively define with that half's own DEFAULT-mode value — "doesn't vary there" is
   itself a value to write (the same principle as scenario 2), not an omission.
3. Re-point every alias, style binding, and node-level binding that referenced the source
   collection's variables to the destination's new-named equivalents.
4. Run scenario 3's segment-level recovery pass for any text nodes among those consumers.
5. Run scenario 4's zero-consumer sweep against the SOURCE collection, immediately before deleting
   it — not before step 3 finished.
6. Retire (don't blind-delete) the source, preferring a registry-tracked retire tag the executor
   recognizes, per scenario 4.

**Worked scale:** TKT-0009 copied 270 type variables into Geometry (1,350 values verified),
re-bound 464 style bindings across 136 styles, re-pointed 183+60+6 node-level consumers, then
deleted the Typography collection after a fresh sweep. Final tally: 141 styles, 0 unbound, 0
dangling; Geometry grew to 350 variables (80 pre-existing + 270 type/) across 5 modes.

### 7. NUMBER-to-STRING weight rebind (fontWeight → fontStyle)

**Rule.** Converting a voice family from numeric `fontWeight` bindings to named `fontStyle`
bindings (hard-constraints §1's "a custom styleName is strictly more specific") is scenarios 1–5
composed, plus two order-dependent traps neither one calls out on its own.

**Procedure.**
1. For every style/node currently bound via `fontWeight`, read its OWN already-rendering
   `fontName.style` as ground truth — don't theorize a nearest-real-cut mapping (tie-breaks,
   "does this family even have a Semi-bold") when the object already shows you the real answer.
2. Ensure a `weight-style/<group>/<kebab-style>` STRING variable exists with that exact value;
   create it if missing (a plain `weight-style/<group>/<realStyle>` naming derivation, not a
   guess) — a programmatic "is one still missing" pass catches what a manual tally misses (this
   migration's manual list missed 3 of 13 real gaps on the first pass).
3. **Clear `fontWeight` to `null` BEFORE setting `fontStyle` to the new variable — never the
   reverse order, and never in one call each without checking which ran last.** Calling
   `setBoundVariable('fontWeight', null)` AFTER `setBoundVariable('fontStyle', newVar)` on the
   SAME style/node **silently strips the fontStyle binding that was just set**, even though
   `fontWeight` was already absent — no error, `fontWeightCleared` reads `true`, but a same-call
   readback shows `fontStyle` never landed. Reversing the order (null the weight, THEN set the
   style) is unconditionally safe. This is a NEW trap beyond hard-constraints §1's "clear the
   stale half explicitly" — that rule is correct about WHICH field to null, not the order to null
   it in relative to the field being set.
4. Run scenario 4's zero-consumer sweep (styles AND node/segment level — this migration's sweep
   caught 2 direct segment-level `fontWeight` bindings on a Scratch page that no shared style ever
   touched) before deleting the numeric `weight/*` ramp.
5. Delete the confirmed-orphaned numeric variables (scenario 5's discipline) — **but verify the
   deletion via `figma.variables.getLocalVariablesAsync()` or `collection.variableIds.includes(id)`,
   never via `getVariableByIdAsync(id)` truthiness.** `getVariableByIdAsync` returns a stale,
   fully-populated phantom object for a just-deleted id — in this migration it did so both
   same-call AND in a fresh follow-up `use_figma` call — even though `.remove()` had already
   correctly removed the variable from its collection and the authoritative local-variables list.
   Trusting `getVariableByIdAsync`'s truthiness as the deletion readback would have reported all
   84 real, successful deletions as failures.
6. **Warn the human, in the same report, that Figma's own desktop UI (the Local Variables panel)
   can keep showing deleted rows after a plugin/MCP session removes them — it does not always
   live-refresh.** A migration that's clean by every API readback (steps 3–5) can still look
   broken to a human checking the panel by eye, prompting a confused "these are still here" report
   that re-litigates a delete that already succeeded. Name the fix directly: close/reopen the
   Local Variables panel, or reload the file — never re-run the delete against ids the API already
   confirms are gone.

**Worked scale:** BZZR's weight ramp — 87 fontWeight-bound text styles (across 13 voice groups +
UI-control/UI-widget) rebound to fontStyle, 13 missing `weight-style/*` STRING variables created
(3 found only by the programmatic re-check, not the manual tally), 2 segment-level node bindings
recovered on a page no style touched, 84 numeric/invalid variables deleted (60 `weight/*` +
12 `type/ui-control|widget/*/weight` + 12 orphaned `*/semi-bold` and `*/extra-bold` STRING
variables — GT America and GT America Mono have no real Semi-bold(600) or Extra-bold(800) cut).
Final tally: 141/141 styles clean (0 fontWeight bound, every fontStyle value matches its
rendered face), 0 remaining consumers of any deleted variable across all 10 pages.

## Cross-scenario failure-mode summary

| Symptom | Which scenario it belongs to | What actually happened |
|---|---|---|
| A rename "succeeded" but some variables/styles kept their old name, no error anywhere | 1 | The rename map's domain didn't cover those names (TKT-0013's frozen-constant gap) |
| A new mode column looks populated but shows stale/wrong values once someone switches to it | 2 | `addMode` was called but not every variable got `setValueForMode` |
| A migration reports done, but a specimen/mixed-styled text layer still shows the old binding | 3 | Node-level `setBoundVariable` no-op on a segmented field; needed `setRangeBoundVariable` per segment |
| `paragraphSpacing` throws mid-migration | 3 | It was passed to `setRangeBoundVariable` — it's node-level only, the inverse of the other metric fields |
| A deleted collection/style orphaned a binding nobody expected | 4 | The zero-consumer sweep was stale — run before a later rename/rebind step, not immediately before the delete |
| A migration script's own report says success but a later full readback disagrees | 5 | The report trusted setter return values instead of re-reading the written state in the same call |
| A merged collection's variables read correctly on the default mode but wrong on the others | 6 | A mode mismatch between the source and destination collections wasn't back-filled explicitly |
| A `fontStyle` bind reads as set, but a readback shows the field never landed | 7 | `setBoundVariable('fontWeight', null)` ran AFTER `setBoundVariable('fontStyle', var)` on the same object — reverse the order |
| A batch delete reports success, but the deleted variables still show up on every later check | 7 | The check used `getVariableByIdAsync(id)` truthiness — it returns a stale phantom for a deleted id; check `getLocalVariablesAsync()` instead |
| A human reviewing Figma right after a verified-clean delete says the deleted rows are still there | 7 | The desktop Local Variables panel didn't live-refresh — the file is actually correct; close/reopen the panel or reload the file |
