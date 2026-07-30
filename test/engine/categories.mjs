// categories.mjs — per-palette TYPOGRAPHY pipeline: the generated gallery PRESETS carry a `type` config
// (scripts/gen-categories.mjs registersToTypeConfig, from each spec palette's `type.registers` — ADR-022),
// and it survives the APPLY path (openConfigAsSet → hydrate → clampType → typeScale) so opening a palette
// dresses the doc in its designed fonts. Guards the seam the "every palette still shows Inter" bug lived in.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { typeScale, DEFAULT_TYPE, siblingWeightDefaults, bodyClassSiblingDefaults, BODY_CLASS_VOICES, resolvedFontFor } from "../../src/engine/type.mjs";
import { hydrate } from "../../src/ui/persist.js";

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
    if (sd) for (const [reg, r] of Object.entries(sd)) {
      const def = REGISTERS[reg];
      if (!def) { FAIL("schema", `${slug}[${i}] unknown register "${reg}"`); continue; }
      for (const k of Object.keys(r || {})) if (!REG_FIELDS.has(k)) FAIL("schema", `${slug}[${i}] ${reg}: unknown field "${k}"`);
      badUnit(r, reg); badWeights(r, reg);
      if (r?.styleName && !EXPRESSIVE.has(def.voice)) FAIL("schema", `${slug}[${i}] ${reg}: styleName targets body-class ${def.voice} — named cuts are expressive-tier only`);
      for (const [v, e] of Object.entries(r?.voices || {})) {
        if (!def.own.includes(v)) FAIL("schema", `${slug}[${i}] ${reg}.voices["${v}"]: not this register's secondary (own: ${def.own.join(", ") || "none"})`);
        const uiOnly = v === "UI-control" || v === "UI-widget";
        for (const k of Object.keys(e || {})) {
          if (!ENTRY_FIELDS.has(k)) FAIL("schema", `${slug}[${i}] ${reg}.voices["${v}"]: unknown field "${k}"`);
          else if (uiOnly && k !== "font") FAIL("schema", `${slug}[${i}] ${reg}.voices["${v}"]: may set font only (the ladders-only law)`);
        }
        badUnit(e, `${reg}.voices["${v}"]`); badWeights(e, `${reg}.voices["${v}"]`);
        if (e?.styleName && !EXPRESSIVE.has(v)) FAIL("schema", `${slug}[${i}] ${reg}.voices["${v}"]: styleName targets a body-class voice`);
      }
    }
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
    // (d2) INTERACTIVE-VOICE LADDERS (TKT-0005 sibling change, the BZZR shape): a designed
    //      actionable register keys UI-control + UI-widget weight ladders off ITS core weight —
    //      ladders ONLY, never character overrides (the interactive voices keep the engine's
    //      control-text character).
    if (sd && Number.isFinite(sd.actionable?.weight)) {
      const want = bodyClassSiblingDefaults(Math.min(sd.actionable.weight, 450)); // actionable core clamps like its Label voice
      for (const uv of ["UI-control", "UI-widget"]) {
        const e = t.voices?.[uv];
        if (!e) { FAIL("uiladder", `${slug}[${i}] designed actionable register but no ${uv} ladder`); continue; }
        if (!eq(e.weights || [], want)) FAIL("uiladder", `${slug}[${i}] ${uv} ladder ${JSON.stringify(e.weights)} != bodyClassSiblingDefaults(${sd.actionable.weight})`);
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
  });
}

// (g) NEGATIVE control: an un-typed palette still yields the global product default (fallback intact)
const noType = hydrate({ palettes: [{ name: "x", hue: 200, chroma: 60, on: true }] });
if (typeScale(noType.type || DEFAULT_TYPE).fonts.display !== "Inter Tight") FAIL("fallback", "un-typed palette lost the product default");

// ── REPORT ──
for (const g of ["count", "hastype", "schema", "fonts", "base", "voices", "kicker", "faithful", "uiladder", "faces", "resolve", "cuts", "purpose", "apply", "fallback"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
}
console.log(`  (${totalTyped}/${totalPresets} presets carry a per-palette type across ${CATS.length} categories)`);
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: per-palette typography flows spec → preset → apply → scale");
process.exit(0);
