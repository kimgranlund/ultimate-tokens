// plugin/typography-tokens.mjs, the ultimate-tokens PLUGIN gate for the typography-tokens
// consumption skill: every --type-*/--font-* token and .type-* class it names must match the type
// engine (voices·steps·props·fonts·count). The check lives WITH the skill
// (plugin/.../scripts/voice-parity.mjs) so the shipped plugin carries its own gate; this wrapper
// runs it in npm test so a voice/step change reddens the suite until the skill is serviced.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, appendFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT = join(ROOT, "plugin/ultimate-tokens/skills/typography-tokens/scripts/voice-parity.mjs");
if (!existsSync(SCRIPT)) { console.error("plugin FAIL: voice-parity.mjs missing"); process.exit(1); }

const r = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
if (r.status !== 0) { console.error("plugin FAIL: typography-tokens skill drifted from the type engine"); process.exit(1); }
// Negative controls: a passing run alone does not prove the gate bites. Each leg copies the real plugin
// (README + this skill) into a throwaway dir, applies ONE drift, points voice-parity at it through
// VOICE_PARITY_SKILL_DIR, and asserts exit 1 with a NAMED error on stderr. The unmodified copy must
// pass first, so a leg cannot go red for an unrelated reason.
const PLUGIN = join(ROOT, "plugin/ultimate-tokens");
const fixtureRoot = mkdtempSync(join(tmpdir(), "voice-parity-fixture-"));
const run = (dir) => spawnSync(process.execPath, [SCRIPT], { encoding: "utf8", env: { ...process.env, VOICE_PARITY_SKILL_DIR: dir } });
const skillCopy = (name, mutate) => {
  const root = join(fixtureRoot, name);
  mkdirSync(join(root, "skills"), { recursive: true });
  cpSync(join(PLUGIN, "README.md"), join(root, "README.md"));
  cpSync(join(PLUGIN, "skills/typography-tokens"), join(root, "skills/typography-tokens"), { recursive: true });
  mutate(join(root, "skills/typography-tokens"));
  return join(root, "skills/typography-tokens");
};
const edit = (file, from, to) => (dir) => {
  const path = join(dir, file);
  const text = readFileSync(path, "utf8");
  if (!text.includes(from)) { console.error(`plugin FAIL: fixture needle missing from ${file}: ${from}`); process.exit(1); }
  writeFileSync(path, text.replace(from, to));
};
try {
  const base = run(skillCopy("base", () => {}));
  if (base.status !== 0) { console.error("plugin FAIL: the unmodified fixture copy did not pass voice-parity:"); process.stderr.write(base.stderr || ""); process.exit(1); }
  const legs = [
    ["a stale count word (thirteen voices)", (d) => appendFileSync(join(d, "SKILL.md"), "\nThe scale has thirteen voices.\n"), [/thirteen/, /voice count drift/]],
    ["a magnitude count word (hundred voices)", (d) => appendFileSync(join(d, "SKILL.md"), "\nThe scale has hundred voices.\n"), [/hundred/, /outside the range/]],
    ["a step outside its own voice (--type-body-xl-size)", (d) => appendFileSync(join(d, "SKILL.md"), "\n`--type-body-xl-size`\n"), [/--type-body-xl-size/, /not a step of voice "body"/]],
    ["a wrong Steps cell (ui-control saying sm/md/lg)", edit("SKILL.md", "| **UI-control** | ui | xs/sm/md/lg/xl/2xl |", "| **UI-control** | ui | sm/md/lg |"), [/UI-control/, /steps drift/]],
    ["a voice table missing the kicker row", (d) => { const p = join(d, "SKILL.md"); writeFileSync(p, readFileSync(p, "utf8").split("\n").filter((l) => !l.startsWith("| **kicker** |")).join("\n")); }, [/kicker/, /no row with a Steps cell/]],
  ];
  for (const [name, mutate, needles] of legs) {
    const neg = run(skillCopy(name.replace(/\W+/g, "-"), mutate));
    if (neg.status !== 1) { console.error(`plugin FAIL: voice-parity did not exit 1 on ${name} (exit ${neg.status})`); process.exit(1); }
    const missing = needles.filter((n) => !n.test(neg.stderr));
    if (missing.length) { console.error(`plugin FAIL: voice-parity failed on ${name} without the named error ${missing.join(" ")}:`); process.stderr.write(neg.stderr || ""); process.exit(1); }
    console.log(`control ok: voice-parity reds on ${name}`);
  }
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("plugin PASS, typography-tokens skill in parity with the type engine (incl. fixture controls)");
process.exit(0);
