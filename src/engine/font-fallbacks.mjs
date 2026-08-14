// font-fallbacks.mjs — the Google-Fonts-safe substitute table. Pure, no DOM. A "premium" family
// (a licensed/commercial release, or any face not servable from the Google Fonts CDN) maps to a
// real Google Fonts family chosen to preserve its character (serif→serif, mono→mono, condensed→
// condensed-ish) — the safety net under Figma's networkAccess:"none" (a premium font can never
// load there) and the web app's silent Google-Fonts-CDN 404 (ensureWebFonts, app-helpers.mjs).
//
// Hand-maintained, not generated — this is a content/curation table like font-cuts.json, not
// derived data. Seeded with the corpus's highest-recurrence premium families first (the revision
// program's own most-used foundry picks); grows incrementally (Phase C of the font-mode plan).
// An unlisted family is NOT an error — googleSafeFontFor returns it unchanged, so an unclassified
// premium font falls through to genericFor's CSS-generic safety net exactly as it does today.
// Never worse than current behavior; only ever an improvement as entries are added.
export const FONT_FALLBACKS = {
  // Klim Type Foundry
  "Söhne": "Inter Tight",
  "Söhne Mono": "JetBrains Mono",
  "Tiempos Text": "Source Serif 4",
  "Signifier": "Source Serif 4",
  "Founders Grotesk": "Inter Tight",
  "National 2": "Inter",

  // Lineto
  "Akkurat": "Inter",

  // Pangram Pangram
  "PP Neue Montreal": "Inter Tight",
  "PP Monument Extended": "Archivo",
  "PP Editorial New": "Playfair Display",

  // Grilli Type
  "GT America": "Inter",
  "GT America Mono": "JetBrains Mono",
  "GT Pressura Mono": "JetBrains Mono",
  "GT Sectra": "Source Serif 4",
  "GT Sectra Display": "Playfair Display",

  // ITC/Linotype/Monotype revivals already in the preset corpus
  "ITC Franklin Gothic": "Archivo",
  "ITC Souvenir": "Playfair Display",
  "ITC American Typewriter": "Courier Prime",
  "Linotype Clarendon": "Clarendon URW",
  "Trade Gothic": "Oswald",
  "Trajan Pro": "Cinzel",
};

// FONT_FALLBACKS_BY_ROLE — role-aware refinements over the family-keyed table (2026-08-14, at
// request): when a family serves several roles, the fallback can differ per role — GT America's
// display slot degrades better to Inter Tight (the tighter display cut) while body/ui/mono-adjacent
// text reads better in plain Inter. Sparse: only list the roles that differ from FONT_FALLBACKS.
export const FONT_FALLBACKS_BY_ROLE = {
  "GT America": { display: "Inter Tight" },
};

// googleSafeFontFor(family, role?) — the pure lookup. The role-aware refinement wins when one is
// curated for (family, role); else the family-keyed substitute; else the family itself unchanged
// (already a Google Font, or not yet classified — identical to prior behavior in those cases).
// role is optional — omitted, the lookup is family-keyed exactly as before.
export function googleSafeFontFor(family, role) {
  const byRole = FONT_FALLBACKS_BY_ROLE[family];
  return (byRole && role && byRole[role]) ?? FONT_FALLBACKS[family] ?? family;
}
