#!/usr/bin/env node
// role-parity.mjs, the DRIFT GATE between this skill and the product's canonical role table.
// Every `--c-…` token mentioned anywhere in the skill's markdown must be a REAL role suffix (or a
// legal raw/scrim pattern, which the skill may name only to forbid). Runs inside the product repo's
// `npm test`; outside the repo (a user's project, the shipped plugin) it exits 0, it is a
// maintainer gate, not a consumer tool. The 53→59 lesson, mechanized for the plugin.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
// ROLE_PARITY_SKILL_DIR lets a test point the gate at a fixture skill dir (e.g. a SKILL.md with a
// deliberately bad count word) to prove the loud-failure path, without touching the real skill.
const SKILL_DIR = process.env.ROLE_PARITY_SKILL_DIR || join(HERE, "..");
const TABLE = join(HERE, "../../../../../docs/reference/data/role-table.json");
if (!existsSync(TABLE)) { console.log("role-parity: canonical role table not found (outside the product repo), skipping"); process.exit(0); }

const rt = JSON.parse(readFileSync(TABLE, "utf8"));
const SUFFIXES = new Set(rt.roleTable.map((r) => r.suffix)); // "" for the bare accent
const PALETTES = new Set(rt.defaults.map((d) => d.name.toLowerCase()));

const files = ["SKILL.md", ...readdirSync(join(SKILL_DIR, "references")).filter((f) => f.endsWith(".md")).map((f) => "references/" + f)];
let failed = false;
const err = (f, tok, why) => { console.error(`✗ ${f}: ${tok}, ${why}`); failed = true; };

// a token is legal iff, after removing the palette part, the remainder is a known role suffix or a
// raw pattern (-NNN solid · -scrim-NNN scrim, ADR-016; the skill names raws only to forbid them).
const META = new Set(["{suffix}", "-scrim-{step}", "-050…950"]); // the grammar-explanation forms in SKILL.md
const legalRest = (rest) => SUFFIXES.has(rest) || META.has(rest) || /^-\d{3}$/.test(rest) || /^-scrim-\d{2,3}$/.test(rest) || /^-\d{3}…\d{3}$/.test(rest);

for (const f of files) {
  const text = readFileSync(join(SKILL_DIR, f), "utf8");
  for (const m of text.matchAll(/--c-[a-zA-Z0-9{}…-]*[a-zA-Z0-9}…]/g)) {
    const tok = m[0];
    let rest = tok.slice(4); // after "--c-"
    if (rest.startsWith("{p}")) rest = rest.slice(3);
    else if (rest.startsWith("{intent}")) rest = rest.slice(8);
    else if (rest.startsWith("{palette}")) rest = rest.slice(9);
    else if (rest === "…") continue; // prose ellipsis form "--c-…"
    else {
      const slug = [...PALETTES].find((p) => rest === p || rest.startsWith(p + "-"));
      if (!slug) { err(f, tok, "unknown palette slug (not in the default kit) and not a {p} placeholder"); continue; }
      rest = rest.slice(slug.length);
    }
    if (rest.endsWith("…")) continue; // ladder ellipsis ("--c-neutral-scrim-weakest …")
    if (!legalRest(rest)) err(f, tok, `"${rest}" is not a role suffix in role-table.json (${SUFFIXES.size} roles)`);
  }
}

// belt-and-braces: the counts the skill claims must match the canon (role count + default-palette
// count, both are derived facts the token grep can't see, so they'd fossilize silently otherwise).
//
// parseNumWord distinguishes three cases for a word sitting in front of "palettes":
//  - a recognized number word in the parser's covered range (one..ninety-nine, including
//    hyphenated compounds like "twenty-one") -> its integer value.
//  - a recognized-but-uncovered number word (a magnitude word like "hundred"/"thousand") ->
//    the sentinel OUT_OF_RANGE, so the caller can FAIL LOUDLY instead of silently no-op'ing.
//  - anything else (an ordinary adjective, "default", "curated", "command", not a number word
//    at all) -> null, so the caller can silently skip it as before.
const ONES = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const MAGNITUDE_WORDS = new Set(["hundred", "thousand", "million", "billion"]);
const OUT_OF_RANGE = Symbol("out-of-range count word");
function parseNumWord(word) {
  const w = word.toLowerCase();
  if (w in ONES) return ONES[w];
  if (w in TENS) return TENS[w];
  if (MAGNITUDE_WORDS.has(w)) return OUT_OF_RANGE;
  const parts = w.split("-");
  if (parts.length === 2) {
    if (parts[0] in TENS && parts[1] in ONES && ONES[parts[1]] < 10) return TENS[parts[0]] + ONES[parts[1]];
    if (MAGNITUDE_WORDS.has(parts[0]) || MAGNITUDE_WORDS.has(parts[1])) return OUT_OF_RANGE;
  }
  return null;
}

for (const f of files) {
  const text = readFileSync(join(SKILL_DIR, f), "utf8");
  for (const m of text.matchAll(/(\d+)[-\s]+(?:semantic[-\s]+)?roles?\b/gi))
    if (m[1] !== String(rt.rolesPerPalette)) err(f, m[0], `role count drift, canon is ${rt.rolesPerPalette}`);
  // "<word> palettes" (e.g. "eight palettes", "twenty-one palettes") must equal the default kit
  // size; a non-number word (an adjective) before "palettes" is not a count claim and is skipped.
  for (const m of text.matchAll(/\b([a-z]+(?:-[a-z]+)?)\s+palettes\b/gi)) {
    const n = parseNumWord(m[1]);
    if (n === null) continue;
    if (n === OUT_OF_RANGE) { err(f, m[0], `count word "${m[1]}" is outside the range role-parity's parser can resolve (one..ninety-nine), extend parseNumWord instead of letting this pass unchecked`); continue; }
    if (n !== PALETTES.size) err(f, m[0], `default-palette count drift, canon is ${PALETTES.size}`);
  }
}

console.log(failed ? "role-parity FAIL" : `role-parity PASS, every role token in ${files.length} files exists in the canonical table`);
process.exit(failed ? 1 : 0);
