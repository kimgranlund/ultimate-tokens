// categories.mjs — per-palette CONFIG pass-through pipelines: the generated gallery PRESETS carry a
// `type` config (scripts/gen-categories.mjs registersToTypeConfig, from each spec palette's
// `type.registers` — ADR-022) and it survives the APPLY path (openConfigAsSet → hydrate → clampType →
// typeScale) so opening a palette dresses the doc in its designed fonts — guards the seam the "every
// palette still shows Inter" bug lived in. The (geometry) block near the end of the main loop pins the
// smaller, verbatim `geometry` pass-through (#485, currently only Adia's `{ramp:"linear4"}`) the same way,
// and the (groups) block pins the `paletteGroups` pass-through (#617) the same way again, plus a
// standalone (groups-discriminate) synthetic-fixture check proving the opt-in actually changes the
// derived ramp-chroma target, not just that it round-trips inertly.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { typeScale, DEFAULT_TYPE, siblingWeightDefaults, bodyClassSiblingDefaults, BODY_CLASS_VOICES, resolvedFontFor } from "../../src/engine/type.mjs";
import { hydrate, DOMAINS } from "../../src/ui/persist.js";
import { paletteGroup, resolvePaletteGroups, projectView } from "../../src/ui/model.mjs";
import { rampChromaOf } from "../../src/engine/resolve.mjs";
import { paletteStops, STOPS, toneAt, DEFAULT_CONTROLS } from "../../src/engine/tonal.js";
import { lstarFromRgb } from "../../src/engine/hct.js";
import { oklchToRgb } from "../../src/engine/okhsl.js";
import { buildCategory } from "../../scripts/gen-categories.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SPECDIR = join(HERE, "..", "..", "docs", "reference", "colors", "categories");
// slug → expected preset count. The original 7 are uniformly "12 volumes × 4" (sourced/decorative
// content, curated to a fixed gallery scale); "brands" is a small, real-identity set with no reason
// to hit that same count — one volume of exactly the researched brands, not padded to 48.
const CAT_COUNTS = { architecture: 48, cuisine: 48, film: 48, literature: 48, music: 48, nature: 48, travel: 48, brands: 7 };
const CATS = Object.keys(CAT_COUNTS);
// register → font role + primary voice + the secondaries its `voices` sub-map may opt in. Kept in
// lockstep with REGISTERS in scripts/gen-categories.mjs — the fidelity + schema gates lean on it.
const REGISTERS = {
  anthemic:   { role: "display", voice: "Display",  own: [] },
  contextual: { role: "heading", voice: "Headline", own: ["Sub-heading"] },
  functional: { role: "body",    voice: "Body",     own: ["Lead", "Title", "Sub-title"] },
  actionable: { role: "ui",      voice: "Label",    own: ["UI-control", "UI-widget"] },
  data:       { role: "mono",    voice: "Kicker",   own: ["Body-mono", "Label-mono", "Tiny-mono"] },
};
// styleName may only target an EXPRESSIVE-tier voice (intended-use.md Layer 2 — body-class voices
// take the fixed Regular/Medium/Semi-bold faces, never a named cut).
const EXPRESSIVE = new Set(["Display", "Headline", "Sub-heading", "Title", "Sub-title", "Kicker"]);
const REG_FIELDS = new Set(["font", "weight", "tracking", "leading", "styleName", "weights", "voices"]);
const ENTRY_FIELDS = new Set(["font", "weight", "tracking", "leading", "styleName", "weights"]);
// the makeVoices / clampType voice allowlist — a voice NOT here is SILENTLY DROPPED by clampType on
// hydrate, so the mapper emitting an off-list name (e.g. "Mono") would lose that voice with no error. Keep in lockstep.
const VOICES = ["Display", "Headline", "Sub-heading", "Title", "Sub-title", "Lead", "Body", "Body-mono", "Label", "Label-mono", "Kicker", "Tiny", "Tiny-mono", "UI-control", "UI-widget"];

// FACE-EXISTENCE + PURPOSE gate (docs/reference/typography/intended-use.md Layer 2; extends #402):
// every styleName must name a REAL cut of its resolved family, every configured weight must resolve
// to a DISTINCT real face, and body-class/UI cores stay ≤450 (the Regular-face snap). Families not in
// the inventory are unresolvable → skipped by design (the inventory is hand-curated, not parsed).
const CUTS = JSON.parse(readFileSync(join(HERE, "..", "..", "docs", "reference", "data", "font-cuts.json"), "utf8"));
const cutNamesFor = (fam) => {
  const f = CUTS[fam]; if (!f || f.variable) return null;
  const out = new Set();
  for (const w of f.widths) for (const wt of Object.keys(f.weights)) {
    const base = [w, wt].filter(Boolean).join(" ");
    out.add(base);
    if (f.italics) { out.add(base + " Italic"); if (wt === "Regular") out.add(w ? `${w} Italic` : "Italic"); }
  }
  return out;
};
// nearest available face for a numeric weight — ties resolve DOWN, mirroring weightNameFor's snap.
const nearestFace = (fam, weight) => {
  const f = CUTS[fam]; if (!f) return null;
  if (f.variable) { const [lo, hi] = f.variable; return String(Math.min(hi, Math.max(lo, weight))); }
  let best = null;
  for (const [name, w] of Object.entries(f.weights)) {
    if (!best || Math.abs(w - weight) < Math.abs(best[1] - weight) || (Math.abs(w - weight) === Math.abs(best[1] - weight) && w < best[1])) best = [name, w];
  }
  return best[0];
};

const fails = [];
const FAIL = (g, m) => { if (!fails.some((f) => f.startsWith(g + ":"))) fails.push(`${g}: ${m}`); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// order-INSENSITIVE deep equality (clampType re-emits fonts/voices in its own allowlist order — same
// values, different key order — so a stringify compare would false-fail; compare key SETS + field values).
const sameKeys = (a, b) => { const ka = Object.keys(a || {}).sort(), kb = Object.keys(b || {}).sort(); return eq(ka, kb); };
// per-field compare via `eq` (not `===`) — `weights` is an ARRAY (the sibling-weight variants), and
// clampType/the mapper each construct a fresh array of fresh objects, so `===` would always be false
// even when the contents match; `eq`'s JSON.stringify compare handles both the primitive fields and
// the array field uniformly (both sides build `{name, weight}` in the same key order).
const sameVoices = (a, b) => sameKeys(a, b) && Object.keys(a || {}).every((v) => sameKeys(a[v], b[v]) && Object.keys(a[v]).every((k) => eq(a[v][k], b[v][k])));

let totalPresets = 0, totalTyped = 0;
for (const slug of CATS) {
  const { PRESETS } = await import(`../../src/ui/categories/${slug}.js`);
  const spec = JSON.parse(readFileSync(join(SPECDIR, `${slug}.json`), "utf8"));
  const specPals = spec.volumes.flatMap((v) => v.palettes); // volume/palette order == preset order

  if (PRESETS.length !== CAT_COUNTS[slug]) FAIL("count", `${slug} has ${PRESETS.length} presets, want ${CAT_COUNTS[slug]}`);
  if (specPals.length !== PRESETS.length) FAIL("count", `${slug}: ${specPals.length} spec palettes vs ${PRESETS.length} presets`);
  totalPresets += PRESETS.length;

  PRESETS.forEach((p, i) => {
    const st = specPals[i]?.type;
    const sd = st?.registers;
    // (s) SCHEMA — the register declaration itself is well-formed. Runs on the SPEC side, before the
    //     sd-guarded value checks; the retired-shape check is defense in depth (the mapper also
    //     throws on it at generation, but this file must catch a spec edited after a stale regen).
    //     Top-level `type` keys are deliberately NOT allowlisted here — the pass-through shape owns
    //     several, and `type.note` (the revision program's in-spec rationale, type-rubric.md Layer B)
    //     is valid and mapper-ignored; only the registers SHAPE is validated.
    if (st && (st.slots || st.faces)) FAIL("schema", `${slug}[${i}] carries the RETIRED type.slots/type.faces shape — run scripts/migrate-type-registers.mjs`);
    const isPct = (x) => typeof x === "string" && /^\s*-?\d+(?:\.\d+)?\s*%\s*$/.test(x);
    const badUnit = (o, where) => {
      if (typeof o?.tracking === "number" || typeof o?.leading === "number" || typeof o?.trackingEm === "number") FAIL("schema", `${slug}[${i}] ${where} carries the RETIRED numeric leading/tracking — use %-strings (tracking: "-2%", leading: "96%")`);
      if (o?.tracking != null && !isPct(o.tracking)) FAIL("schema", `${slug}[${i}] ${where} tracking "${o.tracking}" is not a %-string`);
      if (o?.leading != null && !isPct(o.leading)) FAIL("schema", `${slug}[${i}] ${where} leading "${o.leading}" is not a %-string`);
    };
    const badWeights = (o, where) => {
      if (o?.weights != null && (!Array.isArray(o.weights) || o.weights.some((w) => typeof w?.name !== "string" || !Number.isFinite(w?.weight))))
        FAIL("schema", `${slug}[${i}] ${where} weights must be an array of {name, weight} entries`);
    };
    // declaredCeiling — a BODY-CLASS primary/secondary declaring weight > 450 in the SPEC is a
    // mis-declaration even though the mapper silently clamps it to 450 at generation (the nature
    // ruling, #414/#425: 27 palettes shipped a spec that lied about what actually rendered). The
    // spec must state the number that ships, not a number the mapper will quietly correct.
    const declaredCeiling = (o, where) => {
      if (BODY_CLASS_VOICES.has(where.voice) && Number.isFinite(o?.weight) && o.weight > 450)
        FAIL("schema", `${slug}[${i}] ${where.label} declares weight ${o.weight} > 450 — the mapper clamps body-class cores to 450; state what ships`);
    };
    if (sd) for (const [reg, r] of Object.entries(sd)) {
      const def = REGISTERS[reg];
      if (!def) { FAIL("schema", `${slug}[${i}] unknown register "${reg}"`); continue; }
      for (const k of Object.keys(r || {})) if (!REG_FIELDS.has(k)) FAIL("schema", `${slug}[${i}] ${reg}: unknown field "${k}"`);
      badUnit(r, reg); badWeights(r, reg);
      if (r?.styleName && !EXPRESSIVE.has(def.voice)) FAIL("schema", `${slug}[${i}] ${reg}: styleName targets body-class ${def.voice} — named cuts are expressive-tier only`);
      declaredCeiling(r, { voice: def.voice, label: reg });
      for (const [v, e] of Object.entries(r?.voices || {})) {
        if (!def.own.includes(v)) FAIL("schema", `${slug}[${i}] ${reg}.voices["${v}"]: not this register's secondary (own: ${def.own.join(", ") || "none"})`);
        const uiOnly = v === "UI-control" || v === "UI-widget";
        for (const k of Object.keys(e || {})) {
          if (!ENTRY_FIELDS.has(k)) FAIL("schema", `${slug}[${i}] ${reg}.voices["${v}"]: unknown field "${k}"`);
          else if (uiOnly && k !== "font") FAIL("schema", `${slug}[${i}] ${reg}.voices["${v}"]: may set font only (the ladders-only law)`);
        }
        badUnit(e, `${reg}.voices["${v}"]`); badWeights(e, `${reg}.voices["${v}"]`);
        if (e?.styleName && !EXPRESSIVE.has(v)) FAIL("schema", `${slug}[${i}] ${reg}.voices["${v}"]: styleName targets a body-class voice`);
        declaredCeiling(e, { voice: v, label: `${reg}.voices["${v}"]` });
      }
    }
    // A raw contextual-core > anthemic-core check was tried here and REVERTED (#418): it fired 51
    // times against already-reviewed, checker-approved presets — a single-cut anthemic opted out
    // to `weights: []` is optically loud at a low numeric core (the ceiling ruling above), and a
    // shared-family anthemic/contextual pair legitimately lets the anthemic's LADDER (not core)
    // outreach contextual's core (film's Tree of Life: EB Garamond 400+[500,600] vs contextual
    // 500). "Must not out-shout" needs an optical-weight model this schema doesn't carry — it
    // stays a reviewer judgment call (font-choice-checker), not a mechanical gate.
    // a spec palette is "designed" iff its type carries ≥1 font — exactly when the mapper yields a config
    // (gen-categories returns null otherwise). Gate on the IFF, not on "100% seeded", so a future
    // un-designed palette doesn't redden this suite for a non-bug. A spec can ALSO carry an already-
    // resolved `type.fonts` directly (the "brands" category's real-doc pass-through, e.g. a config
    // exported from the app itself, not the register design shape) — designed either way; the per-field
    // "faithful" checks below are registers-shaped and simply skip (guarded on `sd`) for this case.
    const specDesigned = !!(sd && Object.values(sd).some((r) => typeof r?.font === "string" && r.font.trim())) || !!st?.fonts;
    const t = p.type;
    if (specDesigned && !t) { FAIL("hastype", `${slug}[${i}] spec is designed but preset dropped its type`); return; }
    if (!specDesigned && t) { FAIL("hastype", `${slug}[${i}] preset has type but the spec palette isn't designed`); return; }
    if (!t) return; // legitimately un-designed → falls back to the global default (covered by the negative control)
    totalTyped++;
    // (a) 5 non-empty font roles
    for (const r of ["display", "heading", "body", "ui", "mono"]) if (typeof t.fonts?.[r] !== "string" || !t.fonts[r].trim()) FAIL("fonts", `${slug}[${i}] missing font role ${r}`);
    // (b) treatment is a known base
    if (!["product", "luxury", "editorial", "technical", "statement"].includes(t.treatment)) FAIL("base", `${slug}[${i}] bad base ${t.treatment}`);
    // (c) voices present, every name on the allowlist, mono routed to Kicker (NOT Code)
    const vk = Object.keys(t.voices || {});
    if (!vk.length) FAIL("voices", `${slug}[${i}] no voices`);
    for (const v of vk) if (!VOICES.includes(v)) FAIL("voices", `${slug}[${i}] off-allowlist voice "${v}" (clampType would drop it)`);
    if (!vk.includes("Kicker")) FAIL("kicker", `${slug}[${i}] data register did not map to Kicker`);
    // (d) generator FAITHFUL to the spec: preset fonts AND each register core's tracking/leading/
    //     weight/styleName land on its PRIMARY voice at the spec's VALUES (not just fonts) — so an
    //     in-range-but-wrong param, or a dropped voice at generation, can't ship green.
    // %-strings parsed the mapper's way ("96%" → 0.96; the 2026-07-10 unit transition — shape
    // violations are the schema group's job above).
    const pct = (x) => { if (typeof x !== "string") return NaN; const m = /^\s*(-?\d+(?:\.\d+)?)\s*%\s*$/.exec(x); return m ? Number(m[1]) / 100 : NaN; };
    // body-class cores clamp to ≤450 at generation (intended-use.md Layer 2 law #1 — the
    // Regular-face snap); the faithful expectation is the CLAMPED value, mirroring the mapper.
    const clampCore = (voice, w) => (BODY_CLASS_VOICES.has(voice) ? Math.min(w, 450) : w);
    // one voice-shaped fidelity check, shared by register cores and `voices` opt-in entries:
    // explicit `weights` expected verbatim ([] = the opt-out), else the class ladder derived from
    // the clamped core (mirroring the mapper + typeScale's auto-populate split, 2026-07-14).
    const checkVoice = (s, voice, where) => {
      const vv = t.voices?.[voice] || {};
      if (Number.isFinite(pct(s.tracking)) && vv.tracking !== pct(s.tracking)) FAIL("faithful", `${slug}[${i}] ${where} tracking: preset ${vv.tracking} != spec ${s.tracking}`);
      if (Number.isFinite(pct(s.leading)) && vv.leading !== pct(s.leading)) FAIL("faithful", `${slug}[${i}] ${where} leading: preset ${vv.leading} != spec ${s.leading}`);
      const expWeight = clampCore(voice, s.weight);
      if (Number.isFinite(s.weight) && vv.weight !== expWeight) FAIL("faithful", `${slug}[${i}] ${where} weight: preset ${vv.weight} != expected ${expWeight} (spec ${s.weight})`);
      if (typeof s.styleName === "string" && s.styleName.trim() && vv.styleName !== s.styleName.trim()) FAIL("faithful", `${slug}[${i}] ${where} styleName: preset ${vv.styleName} != spec ${s.styleName}`);
      if (Array.isArray(s.weights)) {
        if (!eq(vv.weights ?? null, s.weights)) FAIL("faithful", `${slug}[${i}] ${where} explicit weights: preset ${JSON.stringify(vv.weights)} != spec ${JSON.stringify(s.weights)}`);
      } else if (Number.isFinite(s.weight)) {
        const want = (BODY_CLASS_VOICES.has(voice) ? bodyClassSiblingDefaults : siblingWeightDefaults)(expWeight);
        if (!eq(vv.weights || [], want)) FAIL("faithful", `${slug}[${i}] ${where} weights: preset ${JSON.stringify(vv.weights)} != derived ${JSON.stringify(want)}`);
      }
    };
    if (sd) for (const [reg, def] of Object.entries(REGISTERS)) {
      const s = sd[reg]; if (!s) continue;
      if (s.font && s.font !== t.fonts[def.role]) FAIL("faithful", `${slug}[${i}] ${reg} font: preset ${t.fonts[def.role]} != spec ${s.font}`);
      checkVoice(s, def.voice, reg);
      // pass-2 fidelity: every `voices` opt-in entry landed on its voice (font here; the
      // resolvedFontFor assertion stays the faces group's job below).
      for (const [v, e] of Object.entries(s.voices || {})) {
        if (!e || typeof e !== "object") continue;
        if (v === "UI-control" || v === "UI-widget") continue; // font-only entries — faces group covers the font
        checkVoice(e, v, `${reg}.voices["${v}"]`);
      }
    }
    // (d2) INTERACTIVE-VOICE LADDERS (TKT-0005 sibling change, the BZZR shape; explicit-array
    //      flow-through 2026-07-31 per #418): a designed actionable register keys UI-control +
    //      UI-widget weight ladders — ladders ONLY, never character overrides (the interactive
    //      voices keep the engine's control-text character). An EXPLICIT `weights` array wins
    //      outright (core or not — it's the more authoritative signal for a no-mid-weight family
    //      like Trade Gothic/Helvetica Neue); otherwise derive from a finite, clamped core.
    if (sd && (Number.isFinite(sd.actionable?.weight) || Array.isArray(sd.actionable?.weights))) {
      const want = Array.isArray(sd.actionable.weights) ? sd.actionable.weights
        : bodyClassSiblingDefaults(Math.min(sd.actionable.weight, 450)); // actionable core clamps like its Label voice
      for (const uv of ["UI-control", "UI-widget"]) {
        const e = t.voices?.[uv];
        if (!want.length) { if (e) FAIL("uiladder", `${slug}[${i}] actionable weights:[] opts out but ${uv} carries a ladder`); continue; }
        if (!e) { FAIL("uiladder", `${slug}[${i}] designed actionable register but no ${uv} ladder`); continue; }
        if (!eq(e.weights || [], want)) FAIL("uiladder", `${slug}[${i}] ${uv} ladder ${JSON.stringify(e.weights)} != expected ${JSON.stringify(want)}`);
        const extra = Object.keys(e).filter((k) => k !== "weights" && k !== "font");
        if (extra.length) FAIL("uiladder", `${slug}[${i}] ${uv} carries character overrides ${JSON.stringify(extra)} (ladders only)`);
      }
    }
    // (d3) AUTHORED FACES (TKT-0005): a register `voices` entry's font flows to voices[voice].font
    //      and resolves via the TKT-0002 voiceFonts escape hatch (resolvedFontFor) — the
    //      differentiated face is REAL in the resolved scale, not just carried config.
    if (sd) for (const r of Object.values(sd)) for (const [fv, e] of Object.entries(r?.voices || {})) {
      const fam = typeof e?.font === "string" && e.font.trim();
      if (!fam) continue;
      if (t.voices?.[fv]?.font !== fam) FAIL("faces", `${slug}[${i}] ${fv} face: preset ${t.voices?.[fv]?.font} != spec ${fam}`);
      else if (resolvedFontFor(typeScale(t), fv) !== fam) FAIL("faces", `${slug}[${i}] ${fv} face does not resolve via voiceFonts`);
    }
    // (e) typeScale RESOLVES the design fonts (the picker reads scale.fonts[role])
    const sc = typeScale(t);
    if (!eq(sc.fonts, t.fonts)) FAIL("resolve", `${slug}[${i}] typeScale.fonts != type.fonts`);
    // (e2) FACE EXISTENCE + DISTINCTNESS (intended-use.md Layer 2 law #2, #402): for inventory-known
    //      families, a styleName must be a real cut, and the core + sibling weights must land on
    //      DISTINCT real faces (a missing cut falls back to the nearest face, so two "different"
    //      configured weights would render identically — the GT America no-Semi-bold defect shape).
    // (e3) PURPOSE: body-class + interactive cores stay ≤450 (Layer 2 law #1 — the Regular-face snap).
    for (const [v, vv] of Object.entries(t.voices || {})) {
      if ((BODY_CLASS_VOICES.has(v) || v === "UI-control" || v === "UI-widget") && Number.isFinite(vv.weight) && vv.weight > 450)
        FAIL("purpose", `${slug}[${i}] ${v} core ${vv.weight} > 450 — the style labeled "regular" would render the Medium face`);
      const fam = resolvedFontFor(sc, v);
      if (!CUTS[fam]) continue; // family not in the inventory — unresolvable, skipped by design
      if (vv.styleName) {
        const names = cutNamesFor(fam);
        if (names && !names.has(vv.styleName)) FAIL("cuts", `${slug}[${i}] ${v} styleName "${vv.styleName}" is not a real ${fam} cut`);
      }
      const resolved = [];
      if (vv.styleName) resolved.push(vv.styleName);
      else if (Number.isFinite(vv.weight)) resolved.push(nearestFace(fam, vv.weight));
      for (const s of vv.weights || []) if (Number.isFinite(s.weight)) resolved.push(nearestFace(fam, s.weight));
      const dupe = resolved.find((x, k) => resolved.indexOf(x) !== k);
      if (dupe) FAIL("cuts", `${slug}[${i}] ${v}: two configured weights resolve to the same ${fam} face "${dupe}"`);
    }
    // (f) APPLY path: hydrate(preset) == openConfigAsSet → clampType keeps fonts AND voices (no silent drop),
    //     and in-range params are IDENTITY-preserved (not clamped/mutated)
    const doc = hydrate(p);
    if (!sameKeys(doc.type.fonts, t.fonts) || !["display", "heading", "body", "ui", "mono"].every((r) => doc.type.fonts[r] === t.fonts[r])) FAIL("apply", `${slug}[${i}] hydrate dropped/changed fonts`);
    if (Object.keys(doc.type.voices || {}).length !== vk.length) FAIL("apply", `${slug}[${i}] hydrate dropped a voice`);
    if (!sameVoices(doc.type.voices, t.voices)) FAIL("apply", `${slug}[${i}] hydrate mutated in-range voice params`);

    // (geometry) per-preset GEOMETRY pass-through (#485) — the same opt-in, verbatim shape as `type`
    // above, but with no register-mapping layer: a spec palette's `geometry` object (currently only
    // Adia's `{ ramp: "linear4" }`) must survive generate → hydrate unmodified, and a palette with NO
    // `geometry` key must carry no `geometry` field on its generated preset at all (the byte-identity
    // every other preset in every other category still gets).
    const sg = specPals[i]?.geometry;
    if (sg) {
      if (!eq(p.geometry, sg)) FAIL("geometry", `${slug}[${i}] the generated preset's geometry ${JSON.stringify(p.geometry)} != the spec's ${JSON.stringify(sg)}`);
      if (!eq(doc.geometry.ramp, sg.ramp)) FAIL("geometry", `${slug}[${i}] hydrate lost/changed geometry.ramp (spec ${sg.ramp}, doc ${doc.geometry.ramp})`);
    } else if ("geometry" in p) {
      FAIL("geometry", `${slug}[${i}] carries a generated "geometry" field with no matching spec key — the opt-in must be byte-identical-absent by default`);
    }

    // (groups) per-preset PALETTE GROUPS pass-through (#617) — same opt-in, verbatim shape as
    // `geometry` above: a spec palette's `paletteGroups` object (none of the 7 sourced/decorative
    // categories or "brands" carries one yet — Adia's fitted values land separately, #618) must
    // survive generate → hydrate unmodified, and a palette with NO `paletteGroups` key must carry
    // no `paletteGroups` field on its generated preset at all (byte-identical-absent by default,
    // asserted here across every real category so this stays true as #618 lands real values).
    const sgp = specPals[i]?.paletteGroups;
    if (sgp) {
      if (!eq(p.paletteGroups, sgp)) FAIL("groups", `${slug}[${i}] the generated preset's paletteGroups ${JSON.stringify(p.paletteGroups)} != the spec's ${JSON.stringify(sgp)}`);
      for (const g of Object.keys(sgp)) {
        if (!eq(doc.paletteGroups[g].baseChroma, sgp[g].baseChroma ?? doc.paletteGroups[g].baseChroma))
          FAIL("groups", `${slug}[${i}] hydrate lost/changed paletteGroups.${g}.baseChroma`);
      }
    } else if ("paletteGroups" in p) {
      FAIL("groups", `${slug}[${i}] carries a generated "paletteGroups" field with no matching spec key — the opt-in must be byte-identical-absent by default`);
    }

    // (curve) per-preset CURVE OVERRIDE pass-through (#479, extended #625 for lmin/lmax) — unlike
    // `geometry`/`paletteGroups` (optional keys, absent by default), lmin/lmax are CORE
    // DEFAULT_CONTROLS fields present on every preset — so the byte-identity contract here is "an
    // un-overridden preset carries the DEFAULT_CONTROLS value (5/100)", not "the field is absent".
    // None of the 7 sourced/decorative categories or "brands" carries an lmin/lmax override yet
    // (Adia's fitted lmin:3 lands separately, #618), so every real preset today must resolve to the
    // engine default — asserted here across every real category so this stays true as #618 lands
    // real values.
    const CURVE_DEFAULTS = { lmin: 5, lmax: 100 };
    for (const k of ["lmin", "lmax"]) {
      const want = k in specPals[i] ? specPals[i][k] : CURVE_DEFAULTS[k];
      if (p[k] !== want) FAIL("curve", `${slug}[${i}] the generated preset's ${k} ${p[k]} != expected ${want} (spec ${k in specPals[i] ? specPals[i][k] : "absent, engine default"})`);
    }
  });
}

// (groups-discriminate) #617's DISCRIMINATING control: a category preset carrying an explicit
// `paletteGroups` override must actually resolve to a DIFFERENT ramp-chroma target than the same
// preset without one — proving the schema slot is real plumbing, not inert JSON that generate/hydrate
// silently ignore. Runs buildCategory() (the REAL generator function, not a reimplementation) against
// a synthetic doc — NOT a real curated category — so this stays independent of whatever real values
// #618 eventually fits for Adia. Uses the `brands`-style `palettes` direct pass-through (no swatch/hier
// derivation needed) so the fixture only has to carry the one thing under test.
{
  const groupOverride = { brand: { baseChroma: 40, primeChroma: 40 } };
  const makeDoc = (withOverride) => ({
    slug: "synthetic-groups-fixture",
    volumes: [{
      roman: "I",
      h1: "Synthetic",
      preface: [],
      palettes: [{
        kicker: "Synthetic",
        title: "Synthetic",
        source: "",
        refuses: "",
        hierarchy: {},
        dominantHex: "#335577",
        palettes: [{ name: "Primary", hue: 250, chroma: 60, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true, group: "brand" }],
        ...(withOverride ? { paletteGroups: groupOverride } : {}),
      }],
    }],
  });

  const withPG = buildCategory(makeDoc(true)).presets[0];
  const withoutPG = buildCategory(makeDoc(false)).presets[0];

  if (!("paletteGroups" in withPG) || !eq(withPG.paletteGroups, groupOverride))
    FAIL("groups", `synthetic fixture: buildCategory did not pass paletteGroups through verbatim (got ${JSON.stringify(withPG.paletteGroups)})`);
  if ("paletteGroups" in withoutPG)
    FAIL("groups", `synthetic fixture: buildCategory emitted a paletteGroups field with no spec key present`);

  const rampChromaFor = (preset) => {
    const doc = hydrate(preset);
    const p = { ...doc.palettes[0], group: paletteGroup(doc.palettes[0]) };
    return rampChromaOf(p, resolvePaletteGroups(doc), { baseChroma: doc.baseIntensity, primeChroma: doc.primeChroma });
  };
  const cWith = rampChromaFor(withPG);
  const cWithout = rampChromaFor(withoutPG);

  if (cWithout !== 100) FAIL("groups", `synthetic fixture without an override resolved brand baseChroma to ${cWithout}, want the GROUP_DEFAULTS brand default (100)`);
  if (cWith !== 40) FAIL("groups", `synthetic fixture WITH a paletteGroups override resolved brand baseChroma to ${cWith}, want the overridden 40`);
  if (cWith === cWithout) FAIL("groups", "the paletteGroups schema slot does not discriminate — with/without overrides resolved to the same ramp chroma");
}

// (groups-validate) #617 review follow-up: the GENERATOR itself must fail loudly on an authoring
// mistake in a curated category JSON's `paletteGroups` block — an unrecognized group key, or a
// non-numeric baseChroma/primeChroma — rather than letting it through to be silently dropped/clamped
// by persist.js's clampPaletteGroups at OPEN time (a live doc's clamp-and-move-on is a distinct,
// legitimate use case; a curated category JSON baked into committed src/ui/categories/*.js is not).
// Reuses the same synthetic-fixture shape as (groups-discriminate) above.
{
  const makeGroupsDoc = (paletteGroups) => ({
    slug: "synthetic-groups-validate-fixture",
    volumes: [{
      roman: "I",
      h1: "Synthetic",
      preface: [],
      palettes: [{
        kicker: "Synthetic",
        title: "Synthetic",
        source: "",
        refuses: "",
        hierarchy: {},
        dominantHex: "#335577",
        palettes: [{ name: "Primary", hue: 250, chroma: 60, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true, group: "brand" }],
        paletteGroups,
      }],
    }],
  });
  const mustThrow = (paletteGroups, wantSubstr, label) => {
    try {
      buildCategory(makeGroupsDoc(paletteGroups));
      FAIL("groups-validate", `${label}: buildCategory did not throw for ${JSON.stringify(paletteGroups)}`);
    } catch (e) {
      if (!(e instanceof Error) || !e.message.includes(wantSubstr))
        FAIL("groups-validate", `${label}: threw, but message ${JSON.stringify(e && e.message)} did not name ${JSON.stringify(wantSubstr)}`);
    }
  };
  // unrecognized group key (a misspelled group name) must fail loudly, naming the doc + bad key.
  mustThrow({ brnad: { baseChroma: 40, primeChroma: 40 } }, "brnad", "bad-key");
  mustThrow({ brnad: { baseChroma: 40, primeChroma: 40 } }, "synthetic-groups-validate-fixture", "bad-key-names-doc");
  // non-numeric baseChroma (a string typo'd where a number belongs) must fail loudly, naming the field.
  mustThrow({ brand: { baseChroma: "forty", primeChroma: 40 } }, "brand.baseChroma", "bad-basechroma");
  // non-numeric primeChroma, same contract.
  mustThrow({ brand: { baseChroma: 40, primeChroma: "forty" } }, "brand.primeChroma", "bad-primechroma");
  // out-of-range baseChroma (above the documented max) must fail loudly, naming the value + range —
  // typeof-only checking would silently accept this and let hydrate() floor/ceil it later (#617/#619/#620
  // review follow-up: same silent-typo-becomes-wrong-value hazard, moved from "wrong type" to "out of range").
  mustThrow({ brand: { baseChroma: 500, primeChroma: 40 } }, "brand.baseChroma", "bad-basechroma-above-max");
  mustThrow({ brand: { baseChroma: 500, primeChroma: 40 } }, "out of range", "bad-basechroma-above-max-range");
  // out-of-range baseChroma (below the documented min) must fail loudly the same way.
  mustThrow({ brand: { baseChroma: -1, primeChroma: 40 } }, "brand.baseChroma", "bad-basechroma-below-min");
  mustThrow({ brand: { baseChroma: -1, primeChroma: 40 } }, "out of range", "bad-basechroma-below-min-range");
  // a non-object group value (a string/array where an object belongs) must fail loudly rather than
  // silently falling through to the group's plain defaults.
  mustThrow({ brand: "not-an-object" }, "brand", "bad-group-shape-string");
  mustThrow({ brand: [40, 40] }, "brand", "bad-group-shape-array");
  // a VALID override across all four groups must still pass through fine — no regression.
  const okDoc = makeGroupsDoc({
    material: { baseChroma: 20, primeChroma: 30 },
    brand: { baseChroma: 40, primeChroma: 50 },
    system: { baseChroma: 60, primeChroma: 70 },
    data: { baseChroma: 80, primeChroma: 90 },
  });
  let okResult;
  try { okResult = buildCategory(okDoc); }
  catch (e) { FAIL("groups-validate", `a valid paletteGroups override should not throw, but got: ${e && e.message}`); }
  if (okResult && !eq(okResult.presets[0].paletteGroups, okDoc.volumes[0].palettes[0].paletteGroups))
    FAIL("groups-validate", "a valid paletteGroups override was not passed through verbatim");
}

// (curve-discriminate) #625's DISCRIMINATING control: a category preset carrying an explicit
// lmin override must actually resolve to a DIFFERENT ramp tone at the dark end than the same preset
// without one — proving the schema slot is real plumbing, not inert JSON that generate/hydrate
// silently ignore (same shape as (groups-discriminate) above). Runs buildCategory() (the REAL
// generator function) against a synthetic doc — NOT a real curated category — so this stays
// independent of whatever real value #618 eventually fits for Adia.
{
  const makeCurveDoc = (withOverride) => ({
    slug: "synthetic-curve-fixture",
    volumes: [{
      roman: "I",
      h1: "Synthetic",
      preface: [],
      palettes: [{
        kicker: "Synthetic",
        title: "Synthetic",
        source: "",
        refuses: "",
        hierarchy: {},
        dominantHex: "#335577",
        palettes: [{ name: "Primary", hue: 250, chroma: 60, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true, group: "brand" }],
        ...(withOverride ? { lmin: 30 } : {}),
      }],
    }],
  });

  const withLmin = buildCategory(makeCurveDoc(true)).presets[0];
  const withoutLmin = buildCategory(makeCurveDoc(false)).presets[0];

  if (withLmin.lmin !== 30) FAIL("curve", `synthetic fixture: buildCategory did not pass lmin through verbatim (got ${withLmin.lmin})`);
  if (withoutLmin.lmin !== 5) FAIL("curve", `synthetic fixture: buildCategory did not fall back to the DEFAULT_CONTROLS lmin (5) with no override (got ${withoutLmin.lmin})`);

  // the ramp's darkest stop is the tone MOST sensitive to lmin (the ramp's dark floor) — resolve
  // each fixture's own palette through the REAL generator pipeline (hydrate → paletteStops), reading
  // this preset's OWN lmin/lmax/toneMode (not DEFAULT_CONTROLS), so the comparison exercises exactly
  // what a real document would render.
  const darkestToneFor = (preset) => {
    const doc = hydrate(preset);
    const stops = paletteStops(doc.palettes[0], doc, STOPS);
    return stops[stops.length - 1].tone;
  };
  const darkWith = darkestToneFor(withLmin);
  const darkWithout = darkestToneFor(withoutLmin);
  if (darkWith === darkWithout) FAIL("curve", "the lmin schema slot does not discriminate — with/without overrides resolved to the same darkest-stop tone");
  if (darkWith <= darkWithout) FAIL("curve", `an lmin:30 override (raising the dark floor above the default 5) should resolve a LIGHTER darkest-stop tone than the default, got ${darkWith} vs default ${darkWithout}`);
}

// (curve-validate) #625, same rigor as (groups-validate): the GENERATOR itself must fail loudly on
// an authoring mistake in a curated category JSON's lmin/lmax fields — a non-numeric value, or one
// outside DOMAINS.lmin/lmax's documented range — rather than letting it through to be silently
// floored/ceiled by persist.js's clampNumber at OPEN time.
{
  const makeCurveValidateDoc = (fields) => ({
    slug: "synthetic-curve-validate-fixture",
    volumes: [{
      roman: "I",
      h1: "Synthetic",
      preface: [],
      palettes: [{
        kicker: "Synthetic",
        title: "Synthetic",
        source: "",
        refuses: "",
        hierarchy: {},
        dominantHex: "#335577",
        palettes: [{ name: "Primary", hue: 250, chroma: 60, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true, group: "brand" }],
        ...fields,
      }],
    }],
  });
  const mustThrow = (fields, wantSubstr, label) => {
    try {
      buildCategory(makeCurveValidateDoc(fields));
      FAIL("curve-validate", `${label}: buildCategory did not throw for ${JSON.stringify(fields)}`);
    } catch (e) {
      if (!(e instanceof Error) || !e.message.includes(wantSubstr))
        FAIL("curve-validate", `${label}: threw, but message ${JSON.stringify(e && e.message)} did not name ${JSON.stringify(wantSubstr)}`);
    }
  };
  // non-numeric lmin (a string typo'd where a number belongs) must fail loudly, naming the field.
  mustThrow({ lmin: "three" }, "lmin", "bad-lmin-type");
  mustThrow({ lmin: "three" }, "synthetic-curve-validate-fixture", "bad-lmin-type-names-doc");
  // non-numeric lmax, same contract.
  mustThrow({ lmax: "ninety" }, "lmax", "bad-lmax-type");
  // out-of-range lmin (above DOMAINS.lmin.max=40) must fail loudly, naming the value + range.
  mustThrow({ lmin: 41 }, "lmin", "bad-lmin-above-max");
  mustThrow({ lmin: 41 }, "out of range", "bad-lmin-above-max-range");
  // out-of-range lmin (below DOMAINS.lmin.min=0) must fail loudly the same way.
  mustThrow({ lmin: -1 }, "out of range", "bad-lmin-below-min-range");
  // out-of-range lmax (below DOMAINS.lmax.min=60, above DOMAINS.lmax.max=100) must fail loudly too.
  mustThrow({ lmax: 59 }, "out of range", "bad-lmax-below-min-range");
  mustThrow({ lmax: 101 }, "out of range", "bad-lmax-above-max-range");
  // a VALID override must still pass through fine — no regression.
  const okDoc = makeCurveValidateDoc({ lmin: 3, lmax: 95 });
  let okResult;
  try { okResult = buildCategory(okDoc); }
  catch (e) { FAIL("curve-validate", `a valid lmin/lmax override should not throw, but got: ${e && e.message}`); }
  if (okResult && (okResult.presets[0].lmin !== 3 || okResult.presets[0].lmax !== 95))
    FAIL("curve-validate", "a valid lmin/lmax override was not passed through verbatim");
}

// (g) NEGATIVE control: an un-typed palette still yields the global product default (fallback intact)
const noType = hydrate({ palettes: [{ name: "x", hue: 200, chroma: 60, on: true }] });
if (typeScale(noType.type || DEFAULT_TYPE).fonts.display !== "Inter Tight") FAIL("fallback", "un-typed palette lost the product default");

// ── lift-anchor (#648): the prime-anchor INVERSE in scripts/gen-categories.mjs must actually hit its
//    target. A preset anchors its prime (stop 550) on the sampled source color by storing a `lift`.
//    That inverse used to be the algebra of the RETIRED additive bump, `sourceL* - toneAt(550,0,0)`,
//    which is simply wrong now that lift DISPLACES the stop (#648) — it missed by ~9 L* at lift +40
//    and ~12 at -40. The generator now SOLVES the inverse, and this gate is what keeps it solved: it
//    re-derives each built palette's target from the spec and checks the stored integer reproduces it.
//    Joined on the palette's stored colorName + key-color OKLCH back to the spec's HEX, because the
//    HEX is what the generator fits against. OKLCH alone is NOT a unique key — a curated colour gets
//    reused across places, so 49 travel swatches share an oklch string with another swatch. Since #656
//    repaired travel, every such duplicate carries the SAME hex in every spec, so an oklch-only join
//    would land the right target today; the composite key is what stops a future divergence from
//    silently picking the wrong one. Name + oklch still collides in architecture/cuisine/music (5, 5
//    and 7 keys shared by two swatches each), but never onto a DIFFERENT hex, so the join is
//    deterministic there too.
{
  const TOL = 1.5;                                   // L* the review fixed as "anchored"
  const LIFT_MIN = DOMAINS.palette.lift.min, LIFT_MAX = DOMAINS.palette.lift.max; // persist.js's own domain, imported
  const pt = (lift) => toneAt(550, 0, lift, DEFAULT_CONTROLS);
  const BAND_LO = pt(LIFT_MIN), BAND_HI = pt(LIFT_MAX);
  const r4 = (v) => Number(Number(v).toFixed(4));
  const hexToRgb = (h) => { const x = String(h).replace("#", ""); return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); };
  const clean = (t) => String(t == null ? "" : t).replace(/\s+/g, " ").trim();   // the generator's own normalisation
  const SAMPLED = new Set(["primary", "primary-muted", "secondary", "secondary-muted", "tertiary", "tertiary-muted"]);
  let checked = 0, outOfBand = 0;
  // A spec whose swatch `hex` and `oklch` describe DIFFERENT colors is a pre-existing data defect,
  // not a lift defect: the generator fits the hex while the preset stores the oklch, so the two
  // disagree downstream. The expectation is PER SPEC and BY NAME, not a bare total, and it counts
  // ANY drift above float noise rather than only drift past this gate's own 1.5 L* tolerance. A bare
  // total had two holes: sub-tolerance drift in a clean spec went unseen, and "travel repaired while
  // another spec drifts" still summed to one. Named per-spec counts fail in BOTH directions — a new
  // drifted spec raises its own entry, a repaired travel lowers travel's — and each says which spec.
  // travel WAS the drifted spec (#656): 287 of its 288 swatches disagreed, worst 7.42 L*, because its
  // `hex` column was authored independently of its `oklch` instead of being oklchToRgb()'s render of it.
  // #656 re-rendered every travel hex from its authoritative oklch, so travel now sits at 0 like the
  // six other sourced specs — a rise off 0 here is a fresh data regression, not the old carve-out.
  const DRIFT_EPS = 0.01;        // below this is 8-bit/rounding noise, not authored disagreement
  const EXPECTED_DRIFT = {
    architecture: { count: 0, max: 0 },
    cuisine:      { count: 0, max: 0 },
    film:         { count: 0, max: 0 },
    literature:   { count: 0, max: 0 },
    music:        { count: 0, max: 0 },
    nature:       { count: 0, max: 0 },
    // authored 2-decimal oklch; immaterial to the fit (worst 0.88 L*, well inside TOL) but real
    brands:       { count: 7, max: 1.0 },
    // repaired at #656: every hex is now the exact oklchToRgb() render of its oklch
    travel:       { count: 0, max: 0 },
  };
  for (const slug of CATS) if (!EXPECTED_DRIFT[slug]) FAIL("lift-anchor", `spec "${slug}" has no EXPECTED_DRIFT entry — a new category must declare whether its hex and oklch agree`);
  for (const slug of CATS) {
    const doc = JSON.parse(readFileSync(join(SPECDIR, `${slug}.json`), "utf8"));
    // spec swatch: r4(oklch) -> hex, the exact key `palette()` stores on the built palette.
    const byKey = new Map();
    let specDrift = 0, specSwatches = 0, driftMax = 0;
    JSON.stringify(doc, (k, v) => {
      if (v && typeof v === "object" && v.hex && v.oklch) {
        const ok = String(v.oklch).trim().split(/\s+/).map(Number);
        byKey.set(clean(v.name) + "|" + ok.map(r4).join(","), String(v.hex).toUpperCase());
        specSwatches++;
        const dd = Math.abs(lstarFromRgb(hexToRgb(v.hex)) - lstarFromRgb(oklchToRgb(ok[0], ok[1], ok[2])));
        if (dd > DRIFT_EPS) specDrift++;
        if (dd > driftMax) driftMax = dd;
      }
      return v;
    });
    const exp = EXPECTED_DRIFT[slug];
    if (exp) {
      if (specDrift !== exp.count)
        FAIL("lift-anchor", `spec "${slug}": ${specDrift} of ${specSwatches} swatches have hex/oklch disagreeing by more than ${DRIFT_EPS} L*, expected ${exp.count}. ${specDrift > exp.count ? "New drift is a data regression" : "Repaired drift should lower this expectation in the same change"} (travel is #656).`);
      if (driftMax > exp.max)
        FAIL("lift-anchor", `spec "${slug}": worst hex/oklch disagreement is ${driftMax.toFixed(2)} L*, above the ${exp.max} L* this spec is allowed — the drift got worse even if the count did not.`);
    }
    // The `direct` pass-through (a real product's own authored settings — 5 of the 7 brands presets)
    // never goes through the generator's palette(), so its lift is authored, not fitted, and this gate
    // has no claim on it. buildCategory passes those objects through VERBATIM, so identity is an exact
    // test — no name matching, and no risk of silently skipping a palette that SHOULD have been fitted.
    const directPalettes = new Set();
    for (const v of doc.volumes || []) for (const sp of v.palettes || [])
      if (Array.isArray(sp.palettes) && sp.palettes.length) for (const dp of sp.palettes) directPalettes.add(dp);
    for (const preset of buildCategory(doc).presets) {
      for (const q of preset.palettes) {
        if (directPalettes.has(q)) continue;
        if (!SAMPLED.has(q.name) || !q.keyColors || !q.keyColors[0]) continue;
        const hex = byKey.get(q.colorName + "|" + q.keyColors[0].oklch.join(","));
        if (!hex) { FAIL("lift-anchor", `${slug} "${preset.name}" ${q.name}: key color ${q.colorName} ${q.keyColors[0].oklch} matches no spec swatch — the join broke`); continue; }
        const target = lstarFromRgb(hexToRgb(hex));
        if (!(q.lift >= LIFT_MIN && q.lift <= LIFT_MAX && Number.isInteger(q.lift)))
          FAIL("lift-anchor", `${slug} "${preset.name}" ${q.name}: lift ${q.lift} is not an integer in [${LIFT_MIN}, ${LIFT_MAX}]`);
        if (target < BAND_LO || target > BAND_HI) {
          // Unreachable: the source is lighter or darker than lift can carry stop 550. The only
          // correct answer is the domain edge on the right side — assert THAT, don't excuse it.
          outOfBand++;
          const want = target < BAND_LO ? LIFT_MIN : LIFT_MAX;
          if (q.lift !== want) FAIL("lift-anchor", `${slug} "${preset.name}" ${q.name}: source L* ${target.toFixed(2)} is outside the reachable band ${BAND_LO.toFixed(2)}..${BAND_HI.toFixed(2)}, so lift must clamp to ${want}, got ${q.lift}`);
          continue;
        }
        checked++;
        const err = Math.abs(pt(q.lift) - target);
        if (err > TOL) FAIL("lift-anchor", `${slug} "${preset.name}" ${q.name}: prime lands at ${pt(q.lift).toFixed(2)} L* but the source is ${target.toFixed(2)} (off by ${err.toFixed(2)}, tol ${TOL}) — stored lift ${q.lift}`);
        // and it must be the BEST integer, not merely a close one: a systematically biased inverse
        // (the additive-algebra one was biased) can sit inside 1.5 L* and still be wrong everywhere.
        let best = q.lift, bestErr = err;
        for (let k = LIFT_MIN; k <= LIFT_MAX; k++) { const e = Math.abs(pt(k) - target); if (e < bestErr - 1e-9) { best = k; bestErr = e; } }
        if (best !== q.lift) FAIL("lift-anchor", `${slug} "${preset.name}" ${q.name}: stored lift ${q.lift} (err ${err.toFixed(3)}) is not the best integer — ${best} gives ${bestErr.toFixed(3)}`);
      }
    }
  }
  if (checked < 1500) FAIL("lift-anchor", `only ${checked} in-band sampled palettes compared — the join or the corpus shrank`);
  if (!fails.some((f) => f.startsWith("lift-anchor:")))
    console.log(`  (lift-anchor: ${checked} in-band sampled primes anchored within ${TOL} L*, ${outOfBand} clamped to the lift domain edge)`);
}

// ── (ramp-monotone) #668: the curated presets that carried the measured-L* UPTICK must not carry it any
// more. A perceptual ramp reports `tone` as the CIELAB L* of the 8-bit pixel it emits, and L* moves with
// CHROMA as well as lightness. The damping used to be positioned on the RAW stop while the lightness was
// read at the LIFTED one, so on a strongly lifted palette a step whose lightness had been compressed to
// near nothing still took a full damping step, fell off the OKHSL s=1 clipping cliff, and MEASURED UP.
// Eleven curated palettes did this at stop 800, worst +0.5105 L*, every one at lift <= -34 (the ticket
// named nine; #648's re-fit and #656's travel repair moved the set to these eleven). tonal.mjs (iii c)
// gates the synthetic grid; this gates the shipped data those eleven are drawn from, exactly and with no
// tolerance, because the corpus is what the defect was reported against.
//
// Two guards keep it from going vacuous. Every named cell must still RESOLVE (a renamed preset or palette
// would otherwise silently check nothing), and every named cell's stored lift must still be <= -34  -  the
// condition the mechanism needs. If a re-fit lifts one of these out of that band the cell stops being a
// witness, and the gate says so instead of passing on a palette that could no longer fail.
{
  const WITNESSES = [
    ["travel", "San Telmo", "secondary-muted"],
    ["travel", "Lake Baikal corridor", "primary-muted"],
    ["travel", "Rovaniemi", "tertiary-muted"],
    ["travel", "Yamanote line", "tertiary-muted"],
    ["travel", "Bogyoke Aung San Market", "secondary"],
    ["film", "Touch of Evil", "secondary"],
    ["film", "2001: A Space Odyssey", "tertiary-muted"],
    ["film", "Arrival", "primary-muted"],
    ["film", "Blade Runner · 1982", "secondary"],
    ["film", "John Wick", "tertiary-muted"],
    ["music", "Black metal", "secondary"],
  ];
  const LIFT_BAND = -34;                       // the band the uptick lived in; a witness must still be in it
  let witnessed = 0;
  const rose = [];
  for (const [slug, needle, palName] of WITNESSES) {
    const { PRESETS } = await import(`../../src/ui/categories/${slug}.js`);
    const hits = PRESETS.filter((x) => x.name.includes(needle));
    if (hits.length !== 1) { FAIL("ramp-monotone", `${slug} "${needle}": ${hits.length} presets match that name  -  the #668 witness cannot be resolved, repoint it`); continue; }
    const doc = hydrate({ ...hits[0] });
    const view = projectView(doc);
    const idx = view.palettes.findIndex((q) => q.name === palName);
    if (idx < 0) { FAIL("ramp-monotone", `${slug} "${needle}": no palette named "${palName}"  -  the #668 witness cannot be resolved, repoint it`); continue; }
    const lift = doc.palettes[idx]?.lift ?? 0;
    if (lift > LIFT_BAND) { FAIL("ramp-monotone", `${slug} "${needle}" ${palName}: lift is now ${lift}, outside the <= ${LIFT_BAND} band the uptick needs  -  this cell no longer witnesses #668, pick one that does`); continue; }
    if ((doc.toneMode || "perceptual") !== "perceptual") { FAIL("ramp-monotone", `${slug} "${needle}": toneMode is "${doc.toneMode}", not perceptual  -  the witness no longer exercises the OKHSL path`); continue; }
    witnessed++;
    const ramp = view.palettes[idx].fullRamp || view.palettes[idx].ramp;
    for (let i = 1; i < ramp.length; i++) if (ramp[i].tone > ramp[i - 1].tone) {
      rose.push(`${slug} "${needle}" ${palName} (lift ${lift}) +${(ramp[i].tone - ramp[i - 1].tone).toFixed(4)} L* at ${ramp[i - 1].stop}->${ramp[i].stop}`);
      break;
    }
  }
  if (rose.length)
    FAIL("ramp-monotone", `measured L* ROSE on ${rose.length} of ${WITNESSES.length} #668 witnesses  -  the damping is travelling where the lightness is not: ${rose.join("; ")}`);
  if (witnessed !== WITNESSES.length) FAIL("ramp-monotone", `only ${witnessed} of ${WITNESSES.length} #668 witnesses resolved into the band  -  the gate is no longer proving what it claims`);
  if (!fails.some((f) => f.startsWith("ramp-monotone:")))
    console.log(`  (ramp-monotone: ${witnessed} lift <= ${LIFT_BAND} curated witnesses hold measured L* non-increasing across all ${25} export stops)`);
}

// ── REPORT ──
for (const g of ["count", "hastype", "schema", "fonts", "base", "voices", "kicker", "faithful", "uiladder", "faces", "resolve", "cuts", "purpose", "apply", "geometry", "groups", "groups-validate", "curve", "curve-validate", "fallback", "lift-anchor", "ramp-monotone"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
}
console.log(`  (${totalTyped}/${totalPresets} presets carry a per-palette type across ${CATS.length} categories)`);
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: per-palette typography flows spec → preset → apply → scale");
process.exit(0);
