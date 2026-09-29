#!/usr/bin/env node
// voice-parity.mjs, the DRIFT GATE between typography-tokens and the product's type engine. Every
// --type-* / --font-* token and .type-* class named in the skill must be a REAL voice·step·prop the
// engine emits, and the claimed voice count must match. Runs in the product repo's npm test; outside
// the repo it exits 0 (a maintainer gate, not a consumer tool). Sibling of color-tokens' role-parity.
// VOICE_PARITY_SKILL_DIR points the gate at a fixture skill dir so a test can prove each failure path.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = process.env.VOICE_PARITY_SKILL_DIR || join(HERE, "..");
const ENGINE = join(HERE, "../../../../../src/engine/type.mjs");
if (!existsSync(ENGINE)) { console.log("voice-parity: type engine not found (outside the product repo), skipping"); process.exit(0); }

const { typeScale } = await import(ENGINE);
const scale = typeScale({ treatment: "product" });
const kebab = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const VOICES = new Set(Object.keys(scale.categories).map(kebab)); // display, headline, title, kicker, …
const STEPS = new Set(Object.values(scale.categories).flatMap((c) => Object.keys(c).map(kebab))); // 3xs..2xl
// each voice's OWN steps: a token's step is checked against its voice, not the union (the two
// interactive voices carry xs..2xl, so `--type-body-xl-size` would pass a union check).
const VOICE_STEPS = new Map(Object.entries(scale.categories).map(([v, c]) => [kebab(v), Object.keys(c).map(kebab)]));
const FONT_ROLES = new Set(Object.keys(scale.fonts)); // display heading body ui mono
const PROPS = new Set(["size", "line", "tracking", "weight", "para", "line-single"]);
const VOICE_COUNT = Object.keys(scale.categories).length;

const README = join(SKILL_DIR, "../../README.md"); // the plugin README states the voice count too
const files = ["SKILL.md", ...readdirSync(join(SKILL_DIR, "references")).filter((f) => f.endsWith(".md")).map((f) => "references/" + f), ...(existsSync(README) ? ["../../README.md"] : [])];
let failed = false;
const err = (f, tok, why) => { console.error(`✗ ${f}: ${tok}, ${why}`); failed = true; };

// parseNumWord, in role-parity's shape: one..ninety-nine (hyphenated tens), a magnitude word returns the
// OUT_OF_RANGE sentinel so the caller fails loudly, anything else (an adjective) is null and skipped.
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

// a voice ref may be one or two segments; try longest match against VOICES.
const matchVoice = (rest) => {
  for (const v of [...VOICES].sort((a, b) => b.length - a.length)) if (rest === v || rest.startsWith(v + "-")) return v;
  return null;
};

for (const f of files) {
  const text = readFileSync(join(SKILL_DIR, f), "utf8");
  // --font-<role>
  for (const m of text.matchAll(/--font-([a-z]+)\b/g))
    if (!FONT_ROLES.has(m[1])) err(f, m[0], `unknown font role (engine roles: ${[...FONT_ROLES].join("/")})`);
  // --type-<voice>-<step>-<prop>  and the {voice}/{step} placeholder forms. End the match on an
  // alphanumeric or a closing brace so "…-{prop}" captures whole (a trailing \b would stop at "}").
  for (const m of text.matchAll(/--type-[a-z0-9{}-]*[a-z0-9}]/g)) {
    let rest = m[0].slice("--type-".length);
    if (rest === "{voice}-{step}-{prop}") continue; // the grammar-explanation form in SKILL.md §3
    if (rest.startsWith("{voice}-{step}-")) { const p = rest.slice("{voice}-{step}-".length); if (!PROPS.has(p)) err(f, m[0], `unknown prop "${p}"`); continue; }
    const v = matchVoice(rest);
    if (!v) { err(f, m[0], "unknown voice"); continue; }
    let tail = rest.slice(v.length + 1); // step-prop  (or "{step}-prop")
    if (tail.startsWith("{step}-")) { const p = tail.slice("{step}-".length); if (!PROPS.has(p)) err(f, m[0], `unknown prop "${p}"`); continue; }
    const parts = tail.split("-");
    const prop = parts.slice(1).join("-") || parts[0];
    const step = parts[0];
    if (!STEPS.has(step)) err(f, m[0], `unknown step "${step}"`);
    else if (!VOICE_STEPS.get(v).includes(step)) err(f, m[0], `step "${step}" is not a step of voice "${v}" (its steps: ${VOICE_STEPS.get(v).join("/")})`);
    if (parts.length > 1 && !PROPS.has(prop)) err(f, m[0], `unknown prop "${prop}"`);
  }
  // .type-<voice>-<step> utility classes
  for (const m of text.matchAll(/\.type-([a-z0-9-]+)\b/g)) {
    const v = matchVoice(m[1]);
    if (!v) { err(f, m[0], "unknown voice in class"); continue; }
    const step = m[1].slice(v.length + 1);
    if (step && !STEPS.has(step)) err(f, m[0], `unknown step "${step}" in class`);
    else if (step && !VOICE_STEPS.get(v).includes(step)) err(f, m[0], `step "${step}" is not a step of voice "${v}" in class (its steps: ${VOICE_STEPS.get(v).join("/")})`);
  }
  // the voice count claim: "<number word> voices", "<number word>-voice", "<number word>-role(s)" (the
  // "fifteen-role scale" heading), with one optional qualifier between ("fourteen named voices"; a subset like "two interactive voices" is not a count claim),
  // one..ninety-nine; a magnitude word ("hundred voices") fails loudly.
  for (const m of text.matchAll(/\b([a-z]+(?:-[a-z]+)?)[-\s]+(?:(?:named|distinct|separate|different|total|typographic|type)[-\s]+)?\*{0,2}(?:voices?|roles?)\b/gi)) {
    const n = parseNumWord(m[1]);
    if (n === null) continue;
    if (n === OUT_OF_RANGE) { err(f, m[0], `count word "${m[1]}" is outside the range voice-parity's parser can resolve (one..ninety-nine), extend parseNumWord instead of letting this pass unchecked`); continue; }
    if (n !== VOICE_COUNT) err(f, m[0], `voice count drift, engine has ${VOICE_COUNT}`);
  }
}

// the voice table's Steps column, row by row: every row whose first cell is **<voice>** in a table headed
// "Steps" must equal the engine's steps for that voice (lower-cased, "/"-joined), and every engine voice
// must have such a row (a missing row is a FAIL, so deleting the column or a row cannot pass).
{
  const seen = new Set();
  for (const f of files) {
    const lines = readFileSync(join(SKILL_DIR, f), "utf8").split("\n");
    let stepsCol = -1;
    lines.forEach((line, i) => {
      if (!line.startsWith("|")) { stepsCol = -1; return; }
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (lines[i + 1] && /^\|[\s:|-]+\|$/.test(lines[i + 1])) { stepsCol = cells.findIndex((c) => c.toLowerCase() === "steps"); return; }
      const first = /^\*\*(.+)\*\*$/.exec(cells[0] || "");
      if (stepsCol < 0 || !first || !VOICE_STEPS.has(kebab(first[1]))) return;
      const v = kebab(first[1]);
      seen.add(v);
      const want = VOICE_STEPS.get(v).join("/");
      if ((cells[stepsCol] || "").toLowerCase() !== want) err(f, `**${first[1]}** Steps "${cells[stepsCol]}"`, `steps drift, the engine's steps for "${v}" are ${want}`);
    });
  }
  for (const v of VOICE_STEPS.keys()) if (!seen.has(v)) err("(steps)", v, `engine voice "${v}" has no row with a Steps cell in the voice table`);
}

// SEMANTIC parity (not just token existence): the set of voices the skill says carry -line-single
// must EQUAL the set the engine actually emits it for. Token-existence checks can't catch a false
// NEGATIVE ("line-single exists only on ui/code"), this closes that drift class. The engine emits
// singleLineHeight for the BOX voices only (the box flag on the voice, not its font role: Label and
// Body-mono ride the ui/mono roles and have none), so the skill's own box-voice statements are read
// and compared to the engine set below; a voice flipped to or from box then reds the gate.
{
  const engineSingleLine = new Set(Object.entries(scale.categories)
    .filter(([, steps]) => Object.values(steps).some((s) => s.singleLineHeight != null))
    .map(([v]) => kebab(v)));
  const blob = files.map((f) => readFileSync(join(SKILL_DIR, f), "utf8")).join("\n");
  // The skill states the box set in fixed shapes: SKILL.md "`line-single` on the box voices, A/B/C, only"
  // and "box-text voices, **A, B, and C**", responsive.md "BOX voices, **A, B, and C**". Every statement
  // in each file must list exactly the engine set (all matches, not the first), and a file with no
  // statement in a shape is a FAIL (the needle went away, so the pin would go vacuous).
  const flat = (f) => (existsSync(join(SKILL_DIR, f)) ? readFileSync(join(SKILL_DIR, f), "utf8") : "").replace(/\s+/g, " ");
  const listed = (str) => new Set(str.split(/\s*(?:,|\/|\band\b)\s*/).filter(Boolean).map(kebab));
  const BOLD = /box(?:-text)? voices, \*\*([^*]+)\*\*/gi;
  for (const [f, re] of [["SKILL.md", /`line-single` on the box voices, ([A-Za-z/ -]+?),? only/g], ["SKILL.md", BOLD], ["references/responsive.md", BOLD]]) {
    const ms = [...flat(f).matchAll(re)];
    if (!ms.length) { err(f, "(box voices)", "no box-voice statement in the fixed shape, so the box set cannot be pinned to the engine"); continue; }
    for (const m of ms) {
      const doc = listed(m[1]);
      const same = doc.size === engineSingleLine.size && [...doc].every((v) => engineSingleLine.has(v));
      if (!same) err(f, m[0], `box-voice set drift, the skill names ${[...doc].sort().join("/")} but the engine emits -line-single for ${[...engineSingleLine].sort().join("/")}`);
    }
  }
  // Every engine single-line voice must be POSITIVELY ASSOCIATED with -line-single: its name must
  // appear within ~240 chars of a "line-single" mention at least once. This catches the exact
  // false-negative class the reviewer found (a single-line voice, Kicker, that the skill
  // omits from every single-line statement), which a plain name-anywhere check would miss (the
  // voice's name also shows up in class tables for unrelated reasons).
  const near = (voice) => {
    const vre = voice.replace(/-/g, "[- ]");
    return new RegExp(`${vre}[\\s\\S]{0,240}line-single|line-single[\\s\\S]{0,240}${vre}`, "i").test(blob);
  };
  for (const v of engineSingleLine) if (!near(v)) err("(semantic)", v, `engine emits -line-single for "${v}" but the skill never associates it with -line-single (a single-line voice must be named where -line-single is described)`);
  // the reading voices must NOT be told they have -line-single: flag a "<reading-voice>-<step>-line-single" token.
  const reading = [...VOICES].filter((v) => !engineSingleLine.has(v));
  for (const v of reading) {
    if (new RegExp(`--type-${v}-[a-z0-9]+-line-single`).test(blob) || new RegExp(`\\.type-${v}[^\\n]*line-single`).test(blob))
      err("(semantic)", v, `"${v}" is a reading voice with NO -line-single, but the skill references it`);
  }
}

console.log(failed ? "voice-parity FAIL" : `voice-parity PASS, every type token/class in ${files.length} files matches the engine (${VOICE_COUNT} voices; -line-single voices verified)`);
process.exit(failed ? 1 : 0);
