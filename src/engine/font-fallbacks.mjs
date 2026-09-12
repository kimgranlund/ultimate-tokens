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

  // TKT-451 — corpus-wide sweep, batch 2. Grouped by lineage/character, not foundry, since most
  // remaining premium names are grotesque/geometric/serif REVIVALS rather than one shop's catalog.

  // Grotesques & signage faces (Berthold/Linotype/Monotype/Font Bureau/ATF lineage)
  "Akzidenz-Grotesk": "Archivo",
  "Univers": "Work Sans",
  "Frutiger": "PT Sans",
  "Neue Haas Grotesk": "Inter",
  "Neue Haas Grotesk Display": "Inter",
  "Neue Haas Grotesk Text": "Inter",
  "Helvetica Now Text": "Inter",
  "News Gothic": "Public Sans",
  "News Gothic Std": "Public Sans",
  "News Gothic Nova": "Public Sans",
  "Interstate": "Archivo",
  "FF DIN": "Oswald",
  "DIN 1451 Mittelschrift": "Big Shoulders Display",
  "Highway Gothic": "Big Shoulders Display",
  "Trade Gothic Bold Condensed": "Archivo Narrow",
  "Trade Gothic Bold Condensed No. 20": "Archivo Narrow",
  "ATF Alternate Gothic Condensed": "Oswald",
  "Compacta": "Bebas Neue",
  "Eurostile Next": "Rajdhani",
  "Eurostile Bold Extended No. 2": "Rajdhani",
  "Copperplate Gothic": "Cinzel",

  // Geometric sans (Futura/Bauhaus lineage)
  "Futura": "Jost",
  "Futura PT": "Jost",
  "Futura PT Condensed": "Oswald",
  "Architype Bayer": "Jost",
  "Verlag": "Poppins",
  "Gotham": "Poppins",
  "ITC Avant Garde Gothic": "Poppins",
  "Neutraface 2 Display": "Jost",
  "Marianne": "Work Sans",

  // Humanist sans & contemporary neutral grotesques
  "Gill Sans Nova": "Public Sans",
  "Optima": "Nunito",
  "Optima nova": "Nunito",
  "FF Meta": "Fira Sans",
  "Cronos": "PT Sans",
  "Untitled Sans": "Inter",
  "Satoshi": "Inter",
  "ITC Officina Sans": "IBM Plex Sans",
  "Forma DJR": "Inter",
  "Forma DJR Text": "Inter",
  "Forma DJR Micro": "Inter",
  "Clash Display": "Space Grotesk",

  // Garamond/old-style-lineage serifs
  "Sabon": "EB Garamond",
  "Adobe Jenson": "EB Garamond",
  "Adobe Caslon Pro": "EB Garamond",
  "Adobe Garamond Pro": "EB Garamond",
  "Adobe Garamond": "EB Garamond",
  "ITC Garamond": "EB Garamond",
  "Bembo Book": "EB Garamond",
  "Fournier": "EB Garamond",
  "Williams Caslon Text": "EB Garamond",
  "Caslon Antique": "EB Garamond",
  "Cochin": "Cormorant",
  "Perpetua": "Cormorant",

  // Transitional / text serifs
  "Miller Text": "Source Serif 4",
  "New Caledonia": "Lora",
  "Charter": "PT Serif",
  "Plantin": "PT Serif",
  "Bell MT": "Libre Baskerville",
  "Iowan Old Style": "Source Serif 4",
  "Freight Text": "Lora",

  // Slab serifs
  "Sentinel": "Roboto Slab",
  "FF Tisa": "Bitter",
  "Century Schoolbook": "Bitter",
  "Bookman Old Style": "Bitter",
  "Rockwell": "Roboto Slab",
  "Serifa": "Zilla Slab",
  "Chaparral": "Bitter",
  "Clarendon": "Roboto Slab",
  "URW Clarendon": "Clarendon URW",
  "Archer": "Zilla Slab",
  "National Park": "Bevan",

  // Didone / high-contrast display serifs
  "Didot": "Playfair Display",
  "Bauer Bodoni": "Bodoni Moda",
  "Kazimir": "Playfair Display",

  // ITC display-serif oddities
  "ITC Serif Gothic": "Cinzel",
  "ITC Cheltenham": "PT Serif",
  "Cheltenham": "PT Serif",
  "ITC Benguiat": "Prata",

  // Script / decorative / wood-type / blackletter / novelty display
  "Kaufmann": "Pacifico",
  "Rosewood Std": "Rye",
  "Arnold Boecklin": "Fascinate",
  "Fette Fraktur": "UnifrakturCook",
  "Goudy Text": "UnifrakturMaguntia",
  "Goudy Text MT Lombardic Capitals": "UnifrakturMaguntia",
  "Windsor": "Yeseva One",
  "Aachen": "Alfa Slab One",
  "Broadway": "Bungee",
  "Broadway Engraved": "Bungee",
  "Broadway Condensed": "Bungee",
  "Cooper Black": "Fraunces",
  "Cooper BT": "Fraunces",
  "Cooper Std": "Fraunces",
  "Data 70": "Orbitron",

  // Druk family (Commercial Type) — ultra-bold condensed display
  "Druk": "Anton",
  "Druk Text": "Anton",
  "Druk Condensed": "Anton",

  // Typewriter / OCR / monospace
  "Courier Std": "Courier Prime",
  "Prestige Elite Std": "Courier Prime",
  "OCR-B Std": "Fragment Mono",
  "OCR-A Std": "Fragment Mono",
  "OCR-B": "Fragment Mono",
  "FF Trixie": "Special Elite",

  // Trajan Pro's newer Adobe revision — same fallback as the base cut already above
  "Trajan Pro 3": "Cinzel",

  // Burger King "Flame" identity — an in-house commissioned brand face, never licensable
  "Flame": "Alfa Slab One",
  "Flame Sans": "Poppins",
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
