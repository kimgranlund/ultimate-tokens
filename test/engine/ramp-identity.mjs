// ramp-identity.mjs -- the thin gate that keeps scripts/report-preset-fidelity.mjs's own
// --identity-control mode from rotting unseen (#715 U2). Nothing else in `npm test` or CI runs that
// script, so without a registered test the mode could stop running -- or stop comparing -- and no
// gate would notice.
//
// This is NOT an engine-identity gate: every run below compares the working tree with itself
// (`--base-dir .`), so it proves the MODE runs and its compare is LIVE, never that a ramp actually
// held still against some other tree. That proof is the adapter's own `ramp-identity` row, run
// against a real base by the builder and verifier of a unit that touches the ramp path.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..");

function run(args) {
  try {
    const stdout = execFileSync("node", ["scripts/report-preset-fidelity.mjs", ...args], { cwd: REPO_ROOT, encoding: "utf8" });
    return { status: 0, stdout };
  } catch (e) {
    return { status: e.status ?? 1, stdout: (e.stdout || "") + (e.stderr || "") };
  }
}

const plain = run(["--identity-control", "--base-dir", ".", "--only", "default-kit"]);
const perturbed = run(["--identity-control", "--base-dir", ".", "--only", "default-kit", "--perturb"]);
const noBase = run(["--identity-control", "--only", "default-kit"]);

const misses = [];
if (plain.status !== 0 || !/^0 differing cells$/m.test(plain.stdout)) misses.push(`plain (exit ${plain.status})`);
if (perturbed.status !== 1 || !/^1 differing cells$/m.test(perturbed.stdout)) misses.push(`--perturb (exit ${perturbed.status})`);
if (noBase.status !== 2) misses.push(`no-base usage (exit ${noBase.status})`);

if (misses.length) {
  console.log(`FAIL: the identity-control mode missed on: ${misses.join(", ")}`);
  process.exit(1);
}
console.log("PASS: the identity-control mode runs and its compare is live (working-tree-vs-itself only, not an engine-identity gate)");
