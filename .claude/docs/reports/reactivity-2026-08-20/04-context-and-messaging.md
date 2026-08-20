# 04 — Context providing, messaging & async workflows

Reviewer: fresh-context agent `rx-context` · 2026-08-20 · commit `63e3dc3` · read-only.
Scope: src/ui/app.js, overlays/{drawer,apply-gate,settings}.js, app-helpers.mjs,
scripts/gen-figma-ui.mjs (the bridge), figma/plugin/code.js, sections/typography.js,
model.mjs, src/engine/tonal.js, test/figma/plugin.mjs. Reproduced verbatim.

---

Verdict up front: **one designed protocol for the bridge itself (well-versioned, mostly
symmetric), sitting inside an accumulated, un-systematized context layer** — the mixin
flattening was a deliberate architectural choice (documented, not accidental), but the
busy-flag/cleanup discipline around it was clearly added ticket-by-ticket (TKT-0004, TKT-0020,
…) rather than from one wedge-proofing rule, and it shows: one real wedge bug, one narrow
leak, no cross-cutting timeout policy.

## A — Bridge message-type table

Bridge script: `scripts/gen-figma-ui.mjs:17-56` (injected before `</body>`, becomes `figma/plugin/ui.html`'s bottom `<script>`). It is the ONLY inbound dispatcher — every `figma.ui.postMessage` from `figma/plugin/code.js` lands on `window.onmessage`, unwraps `e.data.pluginMessage`, and calls one `app().<method>()`. There is no `figma-semantic-binder/code.js` traffic here — that's a separate, UI-less, standalone command plugin (no `showUI`, no message protocol; out of scope).

**UI → sandbox** (`parent.postMessage({pluginMessage:{type}}, "*")`):

| Type | Call site | Sandbox handler | Reply |
|---|---|---|---|
| `load-config` | `app.js:987` (probe), `app.js:2306` (explicit load) | `code.js:161-164` | `config-loaded` |
| `read-variables` | `app.js:988` (probe), `app.js:2354` (manual re-read) | `code.js:172-175` | `variables-read` |
| `load-sets` | `app.js:989` (probe) | `code.js:179-182` | `sets-loaded` |
| `read-float-variables` | `apply-gate.js:36` (gate open) | `code.js:176-178` | `float-variables-read` |
| `list-fonts` | `typography.js:837` (one-shot) | `code.js:165-171` | `fonts-listed` |
| `save-sets` | `app.js:1138` (`persistSets`) | `code.js:183-185` | **none** (fire-and-forget) |
| `save-config` | `app.js:2293` | `code.js:158-160` | **none** (only a `figma.notify`, not a postMessage) |
| `apply` | `apply-gate.js:94` | `code.js:122-157` | `apply-done` or `apply-error` |
| `sweep-scan` | `apply-gate.js:167` | `code.js:186-192` | `sweep-scanned` |
| `sweep-delete` | `apply-gate.js:194` | `code.js:193-201` | `sweep-done` |

**Sandbox → UI** (`figma.ui.postMessage`, all dispatched by the bridge):

| Type | Sandbox origin | Bridge line | UI handler | State mutated | Re-renders? |
|---|---|---|---|---|---|
| `figma-init` | `code.js:38` (once, right after `showUI`) | `gen-figma-ui.mjs:32` | `app.js:2238 setInFigma` | `this.inFigma` | yes (`app.js:2244`) |
| `config-loaded` | `code.js:163` | `:34` | `app.js:2320 applyLoadedConfig` | `this.fileConfig` or opens a new set | yes, both branches |
| `variables-read` | `code.js:174` | `:36` | `app.js:2358 receiveLiveVariables` | `this.liveVars`, `this.liveVarsFound` | yes |
| `float-variables-read` | `code.js:178` | `:39` | `apply-gate.js:248 receiveLiveFloatVariables` | `this._liveFloatVars` | yes |
| `sets-loaded` | `code.js:182` | `:42` | `app.js:1146 receiveStoredSets` | `this.sets` (guarded) | yes |
| `fonts-listed` | `code.js:171` | `:45` | `typography.js:840 receiveFigmaFonts` | `this._figmaFonts` | yes |
| `apply-done` | `code.js:157` | `:48` | `apply-gate.js:112 onApplyDone` | `this._applyBusy=false`, `this.applyGateOpen=false` | yes |
| `apply-error` | `code.js:208` (catch-all, apply only) | `:49` | `apply-gate.js:131 onApplyError` | `this._applyBusy=false` | yes |
| `sweep-scanned` | `code.js:192` | `:52` | `apply-gate.js:171 receiveSweepScan` | `this.sweepResults`, `this.sweepBusy=false` | yes |
| `sweep-done` | `code.js:201` | `:53` | `apply-gate.js:198 onSweepDone` | `this.sweepBusy=false`, clears results | yes |

Refresh discipline is consistent — every inbound handler calls `this.render()` (or delegates to one that does). The one intentional exception: `receiveStoredSets` (`app.js:1147`) no-ops if `this.view !== "gallery"` — a deliberate anti-clobber guard, not a bug (a probe reply landing after the user already opened an editor mustn't overwrite `this.sets`).

**Asymmetry (the one real design gap):** `apply` is the only inbound request with a guaranteed reply on failure — `code.js`'s outer `catch` (lines 203-211) explicitly special-cases `msg.type === "apply"` to post `apply-error`. `sweep-scan` and `sweep-delete` get NO such carve-out: if `figma.getLocalTextStylesAsync()`/`sweepCandidates`/the delete loop throws, the catch only calls `figma.notify(...)` — no `sweep-scanned`/`sweep-done` is ever posted. See (B) below — this is a real wedge, not theoretical.

## B — In-flight flags + cache inventory

| Flag | Set | Cleared | Wedge risk |
|---|---|---|---|
| `_applyBusy` (`app.js:129`) | `apply-gate.js:99` (`applyToFigma`) | `onApplyDone` (`:116`) or `onApplyError` (`:132`) | **Covered on the Figma-side throw** (code.js always answers `apply` either way). **Not covered** if the reply never arrives at all — no timeout, so a UI reload/detach of the plugin frame mid-apply wedges it forever (session-scoped only; a fresh open resets the constructor default). Documented intent (TKT-0004) is "belt-and-suspenders re-entry guard," not "impossible to wedge." |
| `sweepBusy` (`app.js:79`) | `apply-gate.js:166` (scan), `:193` (delete) | `receiveSweepScan` (`:174`), `onSweepDone` (`:200`), or the local `catch` if `postMessage` itself throws (`:168`, `:195`) | **NOT covered** if the sandbox's OWN handler throws after receipt — see the asymmetry in (A). A throwing `sweep-scan`/`sweep-delete` sets `sweepBusy=true`, the sandbox only `figma.notify`s, no reply ever posts, and the Cleanup panel's Scan/Delete buttons (`settings.js:335,350-353`) stay disabled **permanently** for the rest of the session. Real bug — worth a ticket (either code.js posts `sweep-scanned:{texts:[],paints:[]}`/`sweep-done:{removed:0}` from its own catch, mirroring the apply carve-out, or the UI needs a timeout fallback). |
| `_loadRequested` (`app.js:84`) | `loadFromProject` (`:2304`) | `applyLoadedConfig` (`:2327`) on any exit path, or the local `catch`/no-raw branches (`:2306,2311,2312`) | Fully covered — every path resets it. No wedge. |
| `_figmaProbed` (`app.js:85`) | `probeFigmaProject` (`:985`), immediately | never reset (one-shot by design — "probe once when the gallery opens") | Not a wedge — a fire-once latch, correctly documented as such. |
| `_figmaFontsRequested` (`app.js:76`) | `typography.js:836`, immediately | never reset | Same shape — deliberate one-shot per the adjacent comment. Not a wedge. |

Two more request/reply pairs have no busy flag at all, and don't need one: `readLiveVariables`/`receiveLiveVariables` (`app.js:2352-2368`) and `receiveLiveFloatVariables` (`apply-gate.js:248`) just overwrite state on reply with no gating — a lost reply just leaves stale/null data, never a stuck disabled control.

**Cache inventory** (module- and instance-scoped):

- `_categoryData` (`app.js:73`, `{}` → `slug → module`) — lazy `import()` cache, populated in `openCategory` (`app.js:812-819`). Invalidation: never (categories are static generated modules, correctly never invalidated). Race safety: **good** — the `.then` callback re-checks `this.category === slug` (`:818`) before rendering, and the promise closure captures its own `slug`, so navigating away mid-import can't cause a stale render.
- `_faceCache` (`app.js:80`, `Map`, family → renders-here boolean) — invalidated on font-family change (`typography.js:927,984`) and on `document.fonts.ready` firing once per hook (`:901-903`, guarded by `_fontsReadyHooked`). Correctly per-instance.
- `_okL` (`src/engine/tonal.js:275`, module-level `Map`, `L*.toFixed(2) → OKHSL lightness`) — the **only actual module-scope mutable state** found anywhere in `engine/*` or `model.mjs`/`app-helpers.mjs`/`sections/*`. A pure memoization with a naturally bounded domain (≤10,001 keys), never invalidated, never needs to be — not a leak, but the one spot where "pure, no module state" isn't literally true.
- Everything else checked in `model.mjs`, `app-helpers.mjs`, `sections/*.js`, and every `engine/*` file has zero top-level `let`/`var` — every apparent hit was function-local (confirmed by grep + spot read).

## C — Implicit-context coupling (via the flattened `this`)

`mixinInto` (`app.js:2522-2529`) copies every prototype method from `ColorSection`, `TypeSection`, `GeomSection`, `DrawerMixin`, `ApplyGateMixin`, `SettingsMixin` onto one `HctApp.prototype` (composition point: `app.js:2535`). There is no interface, no explicit import of "the methods I depend on" — every mixin file just calls `this.whatever()` and trusts it exists somewhere in the final flattened prototype. Cross-file dependencies found:

- `overlays/drawer.js` (never defines these itself) calls: `this._typeScaleFor`, `this._geomScaleFor`, `this._typeModeScales`, `this._geomModeScales`, `this._typeBaseOpts`, `this._geomBaseOpts`, `this._typePrefix`, `this._geomPrefix`, `this._typeModeDTCGFiles`, `this._geomModeDTCGFiles` (defined in sections/typography.js/geometry.js), plus `this._exportUnit`, `this._proExportLocked`, `this.figmaBundle`, `this.flagOf`, `this.segmented`, `this.copy`, `this.downloadBytes`, `this.toast` (core app.js), plus `this.requestApplyToFigma`, `this._applyBusy`, `this.downloadFigmaPlugin` (ApplyGateMixin/core). One render method (`renderDrawer`) touches all six source files' worth of state with zero declared contract.
- `overlays/apply-gate.js` reads `this.exportSystems`, `this.doc`, `this._typeScaleFor` (typography), and writes `this._applyBusy`, `this.applyGateOpen`, `this.sweepBusy`, `this.sweepResults`, `this.sweepSelected`, `this._liveFloatVars` — none declared anywhere near apply-gate.js itself except the shared app.js constructor (`app.js:79-130`).
- `overlays/settings.js` (`:328-360`) reads `this.sweepResults`/`this.sweepBusy` (owned by ApplyGateMixin) and calls `this.scanForLegacyStyles()`/`this.deleteSelectedSweep()` (also ApplyGateMixin) directly — a Settings panel driving another mixin's state machine with no boundary.
- `sections/typography.js` reads `this.inFigma`, `this.fontMode` (core) and is the sole owner of `_figmaFonts`/`_figmaFontsRequested`/`_faceCache`/`_fontsReadyHooked`, which drawer.js and apply-gate.js depend on transitively through `_typeScaleFor`.

Net effect: the module boundary (`src/ui/sections/*`, `src/ui/overlays/*`) is a **file-organization** boundary, not an **encapsulation** boundary — explicitly documented that way in the `app.js:2530-2534` comment. A deliberate, acknowledged trade-off (TKT-0023), not an accident, but there is no way to know from reading `drawer.js` alone which of its ~15 `this.*` dependencies are guaranteed to exist without also reading typography.js, geometry.js, and app.js in full.

## D — Cleanup / leak findings

Only ONE `disconnectedCallback` exists in the codebase (`app.js:167-170`), cleaning exactly two of the many registrations:
- ✅ `_onKeyDown` (document keydown listener, installed `app.js:384`)
- ✅ `_mqlScheme` change listener (installed `app.js:159-162`)

Not cleaned up:
- `_bindRangeDrag` (`app.js:2087-2123`): a `pointerdown` listener on `this` (dies with the element) that, on drag-start, adds `pointermove`/`pointerup`/`pointercancel` on `window` — cleaned by its own `end()` on pointerup/cancel (`:2115-2117`), **but not if the element disconnects mid-drag**: those three window-level listeners, and the closure holding the whole app instance, live on indefinitely.
- `_liveRaf` (`app.js:246-251`): never cancelled; a post-disconnect rAF still runs `_liveRefreshNow` against a detached subtree (harmless, wasted work, unguarded).
- `_dragTimer` (`app.js:151,325`): a settled-drag commit up to 250ms after disconnect still mutates `this.history`/`this.future` on a dead instance.
- `_toastT` (`app.js:2511-2512`): same shape, ≤1800ms tail.
- The blob-download revoke timer (`app.js:2215`, 1500ms) and the code.js-download timer (`app.js:2415`, 150ms): both harmless, also uncleaned.

None exploitable today because `<ultimate-tokens>` is a true page-lifetime singleton — `disconnectedCallback` in practice never fires outside tests. That's exactly why it's worth flagging: the two things that DO get cleaned up were fixed reactively; the rest were never audited as a set. Nothing in `test/ui/headless-boot.mjs` exercises disconnect/reconnect at all.

## E — Verdict

**The bridge itself (A) is a real, designed protocol**: one dispatcher file, one message per concern, versioned by ticket (TKT-0020's `float-variables-read`, TKT-0012's rename plumbing), and — with the one sweep exception — symmetric request/reply pairs. It reads like something someone sat down and specified.

**Everything built on top of it is accumulated, not designed**: the five busy-flags were added independently over several tickets with no shared "every flag has a guaranteed reset path" rule (four out of five happen to be fine; `sweepBusy` isn't, because the rule was never written down to check against). The mixin-flattened `this` is an explicit, acknowledged trade-off for file organization (not a mistake), but it means "context providing" across sections/overlays has no contract at all beyond "hope the method exists on the prototype at render time." Cleanup is the clearest tell: two listeners got fixed because someone hit them; the other six registrations were never inventoried as a set.

Two concrete fixes worth ticketing: (1) make `sweep-scan`/`sweep-delete` failures in `code.js` post a reply from the catch block, mirroring the existing `apply` carve-out (`figma/plugin/code.js:203-211`) — closes the one real wedge; (2) either extend `disconnectedCallback` to cancel `_liveRaf`/`_dragTimer`/`_toastT`/the window-level drag listeners, or add a code comment at the constructor explaining why it's safe not to (singleton-for-page-lifetime) — right now the omission looks unexamined rather than deliberate, unlike the `_figmaProbed`/`_figmaFontsRequested` one-shots, which ARE clearly documented as intentional.
