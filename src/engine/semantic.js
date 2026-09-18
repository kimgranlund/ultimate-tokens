// semantic-mapping — the 53 semantic token roles per palette.
//
// Two-layer model: raw primitives are mode-independent; the light/dark FLIP
// lives only here in the semantic layer. Each role declares a `light` ref and a
// `dark` ref (a solid stop like "550" or a scrim like "500-200"). Token names and
// CSS var() references use refKey() to normalise those refs.
//
// `paletteName` is lowercase (e.g. "primary", "success"). Two substitutions:
//   {n} = paletteName              -> accent / on-accent KEYS are name-prefixed
//   {N} = Capitalized paletteName  -> e.g. on{N} => "onSuccess"
// Shared roles (surface*, scrim*, outline*, container*, inverse*, onSurface*,
// background) are identical for every palette — they are NOT name-prefixed.
//
// The canonical answer key for paletteName="primary" is data/role-table.json's
// `roleTable`; semanticRoles("primary") must deep-equal it (key, suffix, light,
// dark, same order). No dependencies.

// Scrim ramp: the palette's 500 color at alpha% = step/10 — a translucency sub-variant of
// the palette (so it tracks the 500 stop as hue/chroma/skew/lift change). A scrim ref is
// "500-{step}" (e.g. "500-200" = 500 @ 20%).
//
// The 7 semantic scrim STRENGTHS map onto a 7-step subset of the emitted ramp, weakest ->
// strongest: a sequential 5%..60% ladder (50/100/200/300/400/500/600). This is distinct from the
// full set of raw scrim primitives EMITTED (exports.js SCRIM_STEPS = 11 steps) — the export ramp
// carries more steps than the 7 strengths bind to (700-950 are emitted but carry no strength role).
// outline + containers also resolve onto the 500 ramp (below).
const SCRIM_STRENGTH_STEPS = [50, 100, 200, 300, 400, 500, 600];

// Suffix per scrim level, weakest (index 0) -> strongest (index 6).
const SCRIM_SUFFIXES = [
  '-scrim-weakest',
  '-scrim-weaker',
  '-scrim-weak',
  '-scrim',
  '-scrim-strong',
  '-scrim-stronger',
  '-scrim-strongest',
];

// Key per scrim level, weakest -> strongest. `scrim` (index 3) is the plain mid.
const SCRIM_KEYS = [
  'scrimWeakest',
  'scrimWeaker',
  'scrimWeak',
  'scrim',
  'scrimStrong',
  'scrimStronger',
  'scrimStrongest',
];

/**
 * Normalise a ref for use in token names / CSS var() references.
 * - Solid stops are zero-padded to 3 digits: "50" -> "050", "550" -> "550".
 * - Scrim refs pad BOTH the base stop and the "-{step}" alpha to 3 digits (ADR-006, so every naming
 *   surface matches the raw ramp): "500-200" -> "500-200", "500-50" -> "500-050", "50-2" -> "050-002".
 * @param {string} ref e.g. "50", "550", "500-050"
 * @returns {string}
 */
// ── ADR-016 (kebab wave) emitted-name helpers ─────────────────────────────────────────────────
// roleLeaf — the kebab LEAF a semantic role emits on slash-path surfaces (Figma variables, UI3,
// DTCG keys, JSON): suffix-derived, so every format shares CSS's own vocabulary ("-on-surface" →
// "on-surface"); the prime accent role (empty suffix) keeps the palette name as its leaf
// ("primary/primary" — structural, predates the wave). Internal `key` stays camelCase JS.
export function roleLeaf(paletteName, role) {
  return role.suffix ? role.suffix.slice(1) : paletteName;
}
// refPath / refSlug — the emitted form of a raw ref under ADR-016's scrim NESTING rule
// ("{n}/scrim/{step}" — two segments, never a numeral-compound leaf; the 500 base is omitted while
// SCRIM_BASES is the single canonical 500 — re-add "scrim/{base}/{step}" only if a second base ever
// ships). refPath = slash surfaces (Figma/UI3/DTCG/JSON trees); refSlug = hyphen surfaces (CSS
// custom properties). Solid stops stay the 3-digit padded literal on both.
export function refPath(ref) {
  const s = String(ref);
  const dash = s.indexOf('-');
  if (dash === -1) return s.padStart(3, '0');
  const base = s.slice(0, dash), step = s.slice(dash + 1).padStart(3, '0');
  return (base === '500' ? 'scrim/' : 'scrim/' + base.padStart(3, '0') + '/') + step;
}
export function refSlug(ref) {
  return refPath(ref).replace(/\//g, '-');
}

export function refKey(ref) {
  const s = String(ref);
  const dash = s.indexOf('-');
  if (dash === -1) {
    // Solid stop: pad the whole thing to 3 digits.
    return s.padStart(3, '0');
  }
  // Scrim: pad the base stop AND the "-step" alpha to 3 digits.
  const base = s.slice(0, dash);
  const step = s.slice(dash + 1);
  return base.padStart(3, '0') + '-' + step.padStart(3, '0');
}

// DEFAULT_THEMES — the THEME axis's default (TKT-0021). A role is a two-ended model (a `light` ref
// and a `dark` ref, per the header note above); a "theme" is a NAMED Figma mode bound to one of those
// two already-resolved ends via `side`. This generalizes the AXIS — how many named modes exist and
// what they're called — the same way the breakpoint axis is already just a `modes[]` list (see
// type.mjs/geometry.mjs's typeTokensFigmaModes/geomTokensFigmaModes); it does NOT add a third ref per
// role — that would be a much larger, separate change to the role table itself. Every export/bind/apply
// surface that used to hardcode exactly "Light"/"Dark" now takes an optional `themes` list and falls
// back to this exact pair, so existing output is byte-identical by construction, not by convention.
export const DEFAULT_THEMES = [
  { name: 'Light', side: 'light' },
  { name: 'Dark', side: 'dark' },
];

/**
 * Build the canonical 53-role semantic table for a palette.
 * @param {string} paletteName lowercase palette name (e.g. "primary")
 * @returns {{ key: string, suffix: string, light: string, dark: string }[]}
 */
export function semanticRoles(paletteName) {
  const n = paletteName;
  const N = paletteName.charAt(0).toUpperCase() + paletteName.slice(1);

  const roles = [];
  const role = (key, suffix, light, dark) =>
    roles.push({ key, suffix, light, dark });

  // 1. ACCENT — name-prefixed keys; suffix builds --c-{n}{suffix}.
  //    Prime role has empty suffix => --c-{n}. Refs are raw solid stops.
  role(`${n}`, '', '550', '450'); // prime: 550 light / 450 dark
  role(`${n}Dim`, '-dim', '650', '700');
  role(`${n}Bright`, '-bright', '350', '400');
  role(`${n}Low`, '-low', '350', '700');
  role(`${n}High`, '-high', '650', '400');

  // 1b. ACCENT INTERACTION STATES — tonal offsets along the palette's own ramp, so they stay in-gamut
  //     and consistent across every palette for free. Emphasis grows by DARKENING on light surfaces and
  //     LIGHTENING on dark (mode-mirrored): hover = prime ±1 step, active = prime ±2 (same direction, so
  //     pressed reads "more" than hover). DISABLED is NOT a tonal sibling — there is no neutral/desaturate
  //     primitive in the per-palette ref model, so it is a translucent wash of the palette's own 500 at 60%
  //     (a mid-alpha scrim reads clearly inert without vanishing on any surface; light === dark, like outline/container).
  role(`${n}Hover`, '-hover', '650', '350'); // prime +1 step toward emphasis (darker light / lighter dark)
  role(`${n}Active`, '-active', '750', '250'); // prime +2 steps — pressed is "more" than hover
  role(`${n}Disabled`, '-disabled', '500-600', '500-600'); // 60% wash — inert but legible, mode-independent

  // 2. ON-ACCENT — name-prefixed; fixed to the light end in BOTH modes (OD-001).
  role(`on${N}`, `-on-${n}`, '50', '50');
  role(`on${N}Variant`, `-on-${n}-variant`, '200', '200');

  // 2b. ON-ACCENT INTERACTION STATES — the label color on each state fill. Hover/Active TRACK the base
  //     on-color (the same fixed light end by default; applyOnColorContrast re-points them against their
  //     OWN state fill — 650/350 hover, 750/250 active — in "contrast" mode). DISABLED deliberately opts
  //     OUT of the contrast guarantee: a translucent label over the faint fill, intentionally sub-4.5:1
  //     so the control reads inert.
  role(`on${N}Hover`, `-on-${n}-hover`, '50', '50');
  role(`on${N}Active`, `-on-${n}-active`, '50', '50');
  role(`on${N}Disabled`, `-on-${n}-disabled`, '500-400', '500-400'); // translucent inert label

  // 3. ON-SURFACE — shared keys (NOT name-prefixed).
  role('onSurface', '-on-surface', '950', '50');
  role('onSurfaceVariant', '-on-surface-variant', '750', '250');

  // 3b. ON-SURFACE INTERACTION STATES — shared. onSurface sits at the contrast CEILING at rest (950/50),
  //     so hover/active HOLD there (no stronger solid stop exists; the emphasis is carried by the surface/
  //     container behind the text, like on-accent hover/active). DISABLED is a translucent inert label on
  //     the 500 ramp (opts out of the contrast guarantee). onSurfaceVariant (the secondary-text tier)
  //     carries NO interaction states — a per-state secondary-text role earns little, so its emphasis is a
  //     `hover:`/`active:` opacity modifier on the base role, not a distinct token.
  role('onSurfaceHover', '-on-surface-hover', '950', '50');
  role('onSurfaceActive', '-on-surface-active', '950', '50');
  role('onSurfaceDisabled', '-on-surface-disabled', '500-400', '500-400'); // translucent inert label

  // placeholder — input/field placeholder text: one mirrored step MORE muted than onSurfaceVariant
  // (650/350 vs 750/250), so it reads as a secondary hint yet still clears a legibility floor against the
  // field surface. A SOLID stop, NOT a translucent wash — translucent placeholder text is the classic a11y
  // failure. Like the other on-surface text it is fixed per mode (it is not contrast-repointed).
  role('placeholder', '-placeholder', '650', '350');

  // 4. OUTLINE — shared; on the 500 scrim ramp (light === dark).
  role('outline', '-outline', '500-600', '500-600');
  role('outlineVariant', '-outline-variant', '500-300', '500-300'); // the weaker divider — NO interaction states (see 4b)

  // 4b. OUTLINE INTERACTION STATES — shared; one strength stronger per state (hover +1, active +2 on the
  //     500 ramp), disabled a faint border. Mode-independent like the base outline. outlineVariant (the
  //     weaker divider) carries NONE — a divider rarely needs per-state role tokens; when it does, a
  //     `hover:`/`active:` opacity modifier on the base outlineVariant covers it.
  role('outlineHover', '-outline-hover', '500-700', '500-700');
  role('outlineActive', '-outline-active', '500-800', '500-800');
  role('outlineDisabled', '-outline-disabled', '500-400', '500-400'); // 40% — the disabled content tier (matches on-surface/label), still receding below the 60% resting outline

  // 5. CONTAINER — shared; on the 500 scrim ramp (light === dark).
  role('container', '-container', '500-200', '500-200');
  role('containerLow', '-container-low', '500-100', '500-100');
  role('containerHigh', '-container-high', '500-300', '500-300');

  // 5b. CONTAINER INTERACTION STATES — shared; one strength stronger per state (hover +1, active +2),
  //     disabled the faintest. Mode-independent like the base container.
  role('containerHover', '-container-hover', '500-300', '500-300');
  role('containerActive', '-container-active', '500-400', '500-400');
  role('containerDisabled', '-container-disabled', '500-100', '500-100');

  // 6. INVERSE — shared.
  role('inverseSurface', '-inverse-surface', '900', '100');
  role('inverseOnSurface', '-inverse-on-surface', '50', '950');

  // 7. SURFACE — shared base surfaces.
  role('background', '-background', '100', '900');
  role('surface', '-surface', '125', '875');

  // 8. SURFACE DIM/BRIGHT — shared; non-mirror (light+dark do NOT sum to 1000).
  //    Same direction in both modes: a "dim" surface is a darker stop in both.
  role('surfaceDimmest', '-surface-dimmest', '200', '950');
  role('surfaceDimmer', '-surface-dimmer', '175', '925');
  role('surfaceDim', '-surface-dim', '150', '900');
  role('surfaceBright', '-surface-bright', '100', '850');
  role('surfaceBrighter', '-surface-brighter', '75', '825');
  role('surfaceBrightest', '-surface-brightest', '50', '800');

  // 9. SURFACE LOW/HIGH — shared; mirror (light+dark sum toward 1000) so
  //     "lower" reads recessed and "higher" raised regardless of mode.
  role('surfaceLowest', '-surface-lowest', '50', '950');
  role('surfaceLower', '-surface-lower', '75', '925');
  role('surfaceLow', '-surface-low', '100', '900');
  role('surfaceHigh', '-surface-high', '150', '850');
  role('surfaceHigher', '-surface-higher', '175', '825');
  role('surfaceHighest', '-surface-highest', '200', '800');

  // 10. SCRIM — shared; 7 strengths, all on the 500 ramp at alpha% = step/10. Mode-independent
  //     (light === dark === `500-${pad3(step)}`, e.g. `500-050`). Listed LAST so the emitted token order
  //     groups as regular colors → containers → surfaces → scrims — a cleaner Figma variable / CSS list.
  for (let i = 0; i < SCRIM_STRENGTH_STEPS.length; i++) {
    const ref = `500-${String(SCRIM_STRENGTH_STEPS[i]).padStart(3, '0')}`; // ADR-006 3-digit alpha: 50 -> "050"
    role(SCRIM_KEYS[i], SCRIM_SUFFIXES[i], ref, ref);
  }

  return roles;
}

/**
 * Apply per-doc overrides on top of the canonical role table. Each override re-points a role's
 * light/dark raw ref (absent fields keep the canonical). The canonical table is UNCHANGED — this
 * is an editor-layer customization (the document carries the overrides), NOT part of semanticRoles,
 * so the spec's canonical-equality criterion still holds for semanticRoles itself.
 * @param {{key:string,suffix:string,light:string,dark:string}[]} roles canonical roles
 * @param {Object} [overrides] { [roleKey]: { light?:string, dark?:string } }
 * @returns {{key,suffix,light,dark}[]}
 */
export function applyRoleOverrides(roles, overrides) {
  if (!overrides || typeof overrides !== 'object') return roles;
  return roles.map((r) => {
    const o = overrides[r.key];
    if (!o) return r;
    return { ...r, light: o.light ?? r.light, dark: o.dark ?? r.dark };
  });
}

// ACHROMATIC_REFS — the two non-ramp refs an on-color may resolve to under the "contrast" policy
// (#662). They are NOT stops: they name the document-level `white`/`black` constants every color
// format already emits once per document (`--{pfx}-white`, JSON `constants.white`, DTCG/UI3
// `raw/constants/white`), so aliasing to them keeps ADR-005's "every semantic var references a raw
// var that is itself emitted" invariant intact without inventing a new primitive. Every consumer
// that turns a ref into a name or a color routes these to the constants namespace instead of the
// palette's own (`exports.js` resolveRef/cssFrom/uiThreeVars/semanticTree, `model.mjs`
// resolveRoleHex + the raw-token names).
export const ACHROMATIC_REFS = { white: 1, black: 0 };
export const isAchromaticRef = (ref) => Object.prototype.hasOwnProperty.call(ACHROMATIC_REFS, String(ref));

// AA_FLOOR — WCAG AA for normal text. The floor the "contrast" policy is required to clear for the
// prime accent/on-color pair of every family, in both schemes (#662 ruling 3).
export const AA_FLOOR = 4.5;

/**
 * WCAG-safe on-colors (OD-001, the DEFAULT policy since #662). `on{N}` re-points to whichever end
 * reads best against the accent fill it sits on (`550` light / `450` dark), per mode:
 * `on{N}` → 050|950, `on{N}Variant` → 200|800 (a softer tint of the SAME end the prime chose).
 *
 * ACHROMATIC FALL-THROUGH (#662). A ramp end is preferred while it clears AA_FLOOR, because it
 * carries the palette's own hue. When NEITHER end clears 4.5:1 against the fill — which happens
 * wherever the accent sits mid-lightness, and which the ramp cannot fix because #662 ruling 1
 * forbids moving a stop — `on{N}` falls through to the pure achromatic extreme (`white`/`black`)
 * with the better contrast. That is always at least as good as the ramp end on the same side, so
 * the floor is reachable without touching a single stop. The fall-through applies to the three
 * roles whose ends ARE the ramp extremes (prime, hover, active); `on{N}Variant` is a deliberately
 * softer tint and follows the prime's SIDE rather than running its own pick, so the pair can never
 * straddle (a light tint label beside a black one on the same fill).
 *
 * All other roles are untouched and the canonical `semanticRoles` table is unchanged — this stays a
 * resolution-layer adjustment, selected by `onColorMode` ("contrast" default, "fixed" opt-out).
 *
 * `lumOf(ref)` must return the WCAG relative luminance (0..1) of a solid-stop ref's resolved color;
 * the caller supplies it (it has the resolved ramp). It is never called with an achromatic ref —
 * those luminances are exact constants. A no-op unless onColorMode === "contrast".
 * @param {{key,suffix,light,dark}[]} roles
 * @param {string} n palette slug (for the `-on-${n}` suffixes)
 * @param {(ref:string)=>number} lumOf relative luminance of a solid stop ref
 * @param {string} [onColorMode] "contrast" (default) | "fixed"
 */
export function applyOnColorContrast(roles, n, lumOf, onColorMode) {
  if (onColorMode !== 'contrast') return roles;
  const wcag = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const lum = (ref) => (isAchromaticRef(ref) ? ACHROMATIC_REFS[ref] : lumOf(ref));
  // pick — the better-contrasting ramp end against this fill, or, when that end still misses
  // AA_FLOOR, the better-contrasting achromatic extreme.
  const pick = (fillRef, ends) => {
    const f = lum(fillRef);
    const end = wcag(lum(ends[0]), f) >= wcag(lum(ends[1]), f) ? ends[0] : ends[1];
    if (wcag(lum(end), f) >= AA_FLOOR) return end;
    return wcag(1, f) >= wcag(0, f) ? 'white' : 'black';
  };
  // The prime on-color rides the base accent (550/450); the interaction-state on-colors ride their
  // OWN state fills (hover 650/350, active 750/250) so each label is measured against what it
  // actually sits on. `-on-{n}-disabled` is deliberately ABSENT — disabled opts out of the contrast
  // guarantee (it stays the inert translucent label).
  const primeLight = pick('550', ['050', '950']);
  const primeDark = pick('450', ['050', '950']);
  // the variant tracks the prime's side: light end (050 or white) -> 200, dark end (950 or black) -> 800.
  const variantOf = (primeRef) => (primeRef === '050' || primeRef === 'white' ? '200' : '800');
  const M = {
    [`-on-${n}`]: { light: primeLight, dark: primeDark },
    [`-on-${n}-variant`]: { light: variantOf(primeLight), dark: variantOf(primeDark) },
    [`-on-${n}-hover`]: { light: pick('650', ['050', '950']), dark: pick('350', ['050', '950']) },
    [`-on-${n}-active`]: { light: pick('750', ['050', '950']), dark: pick('250', ['050', '950']) },
  };
  return roles.map((r) => {
    const m = M[r.suffix];
    if (!m) return r;
    return { ...r, light: m.light, dark: m.dark };
  });
}

/**
 * applyAccentRef — RESOLUTION-LAYER: re-point the PRIME accent role (the one with an empty suffix) to a
 * single mode-agnostic stop. "mode" (default) keeps 550 (light) / 450 (dark); "single" maps BOTH modes to
 * 500. Only the prime accent (suffix === '') changes — its variants (Dim/Bright/Low/High) and every other
 * role are untouched, and the canonical `semanticRoles` table is unchanged (so the refs-canonical gate
 * holds), exactly like `applyOnColorContrast`.
 * @param {{key,suffix,light,dark}[]} roles
 * @param {string} [accentRef] "mode" (default) | "single"
 */
export function applyAccentRef(roles, accentRef) {
  if (accentRef !== 'single') return roles;
  return roles.map((r) => (r.suffix === '' ? { ...r, light: '500', dark: '500' } : r));
}

// The five IDENTITY roles: the prime accent and its Dim/Bright/Low/High variants (suffixes below). Their
// solid refs are the stops that read as "the brand color". tonal.js no longer consumes this set — the
// ramp-level chroma lift it used to drive under the old prime-chroma control's retired field name was
// removed (#536) — kept here for a possible future standalone prime-swatch system.
const IDENTITY_SUFFIXES = new Set(['', '-dim', '-bright', '-low', '-high']);

/**
 * identityStops — the sorted set of solid stop numbers the five identity roles resolve to, across light AND
 * dark. Computed from the ALREADY-RESOLVED role list (call it AFTER applyAccentRef; REPLACE semantics, never a
 * union with a static set): under accentRef "mode" that is {350,400,450,550,650,700}; under "single" the prime
 * resolves to 500 only, so 450/550 drop out and the set is {350,400,500,650,700} (EX-3). Scrim-shaped refs
 * ("500-200") are ignored. Not part of `semanticRoles`; the role-table answer key is untouched. No longer
 * threaded into the ramp (tonal.js's `paletteStops` dropped its identity-stop parameter — #536); currently
 * unconsumed outside this file, kept exported for a possible future standalone prime-swatch system.
 * @param {{key,suffix,light,dark}[]} roles resolved roles
 * @returns {Set<number>}
 */
export function identityStops(roles) {
  const stops = new Set();
  for (const r of roles) {
    if (!IDENTITY_SUFFIXES.has(r.suffix)) continue;
    for (const ref of [r.light, r.dark]) if (/^\d+$/.test(ref)) stops.add(parseInt(ref, 10));
  }
  return new Set([...stops].sort((a, b) => a - b));
}
