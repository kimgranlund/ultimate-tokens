// plugin/color-tokens.mjs, the ultimate-tokens PLUGIN skill gate: the color-tokens consumption
// skill must stay in parity with the product's canonical role table (every --c- token it names is a
// real role; the role count it claims matches). The check itself lives WITH the skill
// (plugin/.../scripts/role-parity.mjs) so the shipped plugin carries its own gate; this wrapper
// runs it inside npm test so a role change reddens the suite until the skill is serviced.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT = join(ROOT, "plugin/ultimate-tokens/skills/color-tokens/scripts/role-parity.mjs");
if (!existsSync(SCRIPT)) { console.error("plugin FAIL: role-parity.mjs missing"); process.exit(1); }

const r = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
if (r.status !== 0) { console.error("plugin FAIL: color-tokens skill drifted from the role table"); process.exit(1); }

// Negative controls: a happy-path pass alone does not prove a loud-failure branch fires. Each leg copies
// the real plugin (README + this skill) into a throwaway dir, applies ONE drift, points role-parity at
// it through the ROLE_PARITY_SKILL_DIR test hook, and asserts exit 1 with a NAMED error on stderr. The
// unmodified copy must pass first, so a leg cannot go red for an unrelated reason.
// The first leg is TKT #527: a count word the parser cannot resolve ("hundred") must fail loudly, never no-op.
const PLUGIN = join(ROOT, "plugin/ultimate-tokens");
const fixtureRoot = mkdtempSync(join(tmpdir(), "role-parity-fixture-"));
const run = (dir) => spawnSync(process.execPath, [SCRIPT], { encoding: "utf8", env: { ...process.env, ROLE_PARITY_SKILL_DIR: dir } });
const skillCopy = (name, mutate) => {
  const root = join(fixtureRoot, name);
  mkdirSync(join(root, "skills"), { recursive: true });
  cpSync(join(PLUGIN, "README.md"), join(root, "README.md"));
  cpSync(join(PLUGIN, "skills/color-tokens"), join(root, "skills/color-tokens"), { recursive: true });
  mutate(join(root, "skills/color-tokens"), root);
  return join(root, "skills/color-tokens");
};
const editFile = (path, from, to) => {
  const text = readFileSync(path, "utf8");
  if (from !== null && !text.includes(from)) { console.error(`plugin FAIL: fixture needle missing from ${path}: ${from}`); process.exit(1); }
  writeFileSync(path, from === null ? text + to : text.replace(from, to));
};
try {
  const base = run(skillCopy("base", () => {}));
  if (base.status !== 0) { console.error("plugin FAIL: the unmodified fixture copy did not pass role-parity:"); process.stderr.write(base.stderr || ""); process.exit(1); }
  const legs = [
    ["an unresolvable count word (hundred palettes)", (d) => editFile(join(d, "SKILL.md"), null, "\nThe default kit ships hundred palettes.\n"), [/hundred/, /outside the range/]],
    ["a wrong on-colour default (default, onColorMode: fixed)", (d) => editFile(join(d, "SKILL.md"), "default, `onColorMode: contrast`", "default, `onColorMode: fixed`"), [/onColorMode/, /default drift/]],
    ["no on-colour default statement", (d) => editFile(join(d, "SKILL.md"), "default, `onColorMode: contrast`", "default"), [/onColorMode/, /exactly one/]],
    ["a README role count (the 59-role semantic layer)", (d, root) => editFile(join(root, "README.md"), null, "\nThe 59-role semantic layer.\n"), [/59-role/, /role count drift/]],
    ["an illegal on-colour value (onColorMode: auto)", (d) => editFile(join(d, "SKILL.md"), null, "\nOr `onColorMode: auto`.\n"), [/auto/, /DOMAINS/]],
  ];
  for (const [name, mutate, needles] of legs) {
    const neg = run(skillCopy(name.replace(/\W+/g, "-"), mutate));
    if (neg.status !== 1) { console.error(`plugin FAIL: role-parity did not exit 1 on ${name} (exit ${neg.status})`); process.exit(1); }
    const missing = needles.filter((n) => !n.test(neg.stderr));
    if (missing.length) { console.error(`plugin FAIL: role-parity failed on ${name} without the named error ${missing.join(" ")}:`); process.stderr.write(neg.stderr || ""); process.exit(1); }
    console.log(`control ok: role-parity reds on ${name}`);
  }
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("plugin PASS, color-tokens skill in parity with the canonical role table (incl. fixture controls)");
process.exit(0);
