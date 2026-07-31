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

  // Grilli Type (GT America/GT America Mono are already Google-servable-adjacent bundled faces —
  // no entry needed; these are the ones that aren't)
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

// googleSafeFontFor(family) — the pure lookup. A mapped substitute if one's been curated; the
// family itself unchanged otherwise (already a Google Font, or not yet classified — identical to
// current behavior in both those cases).
export function googleSafeFontFor(family) {
  return FONT_FALLBACKS[family] ?? family;
}
