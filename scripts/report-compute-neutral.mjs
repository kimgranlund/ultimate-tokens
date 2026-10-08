#!/usr/bin/env node
// report-compute-neutral.mjs, the byte-neutrality report for the compute-layers refactor (#788, ADR-033).
//
//   node scripts/report-compute-neutral.mjs --base <rev> [--only <category>|default-kit] [--perturb]
//
// Why: report-preset-fidelity.mjs --identity-control renders each palette through `rampChromaOf` and
// `paletteStops` alone, so it never reaches compute(), projectView() or derivedAll() and cannot see a
// change in how the canvas and the exports are assembled. This report renders whole documents through
// the surfaces a user downloads, on the base tree and on this working tree, and diffs every leaf.
//
// The base tree is `git archive <rev> src`, extracted into a mkdtemp scratch directory that is removed on
// exit (never a worktree), the same way --identity-control loads it. The subjects are the base tree's
// default kit and every base preset (`src/ui/categories/*.js`, index.js excluded), each hydrated ONCE by
// the base `persist.hydrate`; that one hydrated document is what both trees render, so a change to how
// hydrate folds a document never shows here. `--only` narrows the subjects to one category or the
// default kit.
//
// Each subject renders, on each tree, through: `projectView(doc)` (the canvas and its exports),
// `figmaBundle(doc)`, `brandKit(doc, all three systems)`, and the three design-system bundles, called
// the way src/ui/overlays/drawer.js calls them (`dsDocOf(doc)`, the base type and geometry scales, one
// fixed `date` on both trees). Every leaf is compared; a string is compared line by line, one cell per
// line. `--perturb` flips one hex digit in one head cell before the compare (the first subject's first
// canvas ramp stop), as --identity-control's --perturb does, so a run can show the compare bites.
//
// Output: `subjects <n>`, one `<surface>: <d> of <t> cells differ` line per surface (with up to three
// witnesses), and last `<n> differing cells`. Exit 0 only at 0, 1 on any difference or a render that
// throws, 2 on a usage error. Rendering runs in worker threads (one pool per tree), because a full
// run renders every preset through every surface twice.
import { mkdtempSync, rmSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir, availableParallelism } from "node:os";
import { join as pathJoin, dirname } from "node:path";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";

const DS_DATE = "2000-01-01";
const SURFACES = ["projectView", "figmaBundle", "brandKit", "dsBundle", "dsStitch", "dsMake"];

if (!isMainThread) {
  // worker: render the assigned subjects on one tree, one message per subject
  const M = await import(workerData.modelUrl);
  for (const { idx, doc } of workerData.subjects) {
    const out = {};
    const errors = [];
    const render = (name, fn) => {
      try { out[name] = fn(); } catch (e) { errors.push(`${name}: ${e && e.message}`); }
    };
    render("projectView", () => M.projectView(doc));
    render("figmaBundle", () => M.figmaBundle(doc));
    render("brandKit", () => M.brandKit(doc, { color: true, type: true, geometry: true }));
    const dsDoc = M.dsDocOf(doc);
    const typeSc = M.typeScaleFor(doc, "base");
    const geomSc = M.geomScaleFor(doc, "base");
    render("dsBundle", () => M.exportDesignSystemBundle(dsDoc, typeSc, geomSc, { date: DS_DATE }));
    render("dsStitch", () => M.exportDesignSystemStitchBundle(dsDoc, typeSc, geomSc, { date: DS_DATE }));
    render("dsMake", () => M.exportDesignSystemMakeBundle(dsDoc, typeSc, geomSc, { date: DS_DATE }));
    parentPort.postMessage({ idx, out, errors });
  }
} else {
  await main();
}

async function main() {
  const HERE = dirname(fileURLToPath(import.meta.url));
  const REPO_ROOT = pathJoin(HERE, "..");
  const USAGE = "usage: node scripts/report-compute-neutral.mjs --base <rev> [--only <category>|default-kit] [--perturb]";
  const args = process.argv.slice(2);
  const known = new Set(["--base", "--only", "--perturb"]);
  const baseIdx = args.indexOf("--base");
  const onlyIdx = args.indexOf("--only");
  const perturb = args.includes("--perturb");
  const rev = baseIdx >= 0 ? args[baseIdx + 1] : null;
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
  const stray = args.filter((a, i) => a.startsWith("--") ? !known.has(a) : !(i > 0 && (args[i - 1] === "--base" || args[i - 1] === "--only")));
  if (!rev || rev.startsWith("--") || (onlyIdx >= 0 && (!only || only.startsWith("--"))) || stray.length) {
    console.error(USAGE);
    process.exit(2);
  }

  const scratch = mkdtempSync(pathJoin(tmpdir(), "compute-neutral-"));
  // removed on every exit path: this process-exit hook runs for each process.exit() below
  process.on("exit", () => { try { rmSync(scratch, { recursive: true, force: true }); } catch { /* best effort */ } });
  try {
    const archive = execFileSync("git", ["archive", rev, "src"], { cwd: REPO_ROOT, maxBuffer: 1024 * 1024 * 256 });
    execFileSync("tar", ["-x", "-C", scratch], { input: archive });
  } catch (e) {
    console.error(`usage: --base ${rev} could not be archived: ${e.message}`);
    process.exit(2);
  }
  const baseModelPath = pathJoin(scratch, "src/ui/model.mjs");
  const basePersistPath = pathJoin(scratch, "src/ui/persist.js");
  const baseCatDir = pathJoin(scratch, "src/ui/categories");
  for (const p of [baseModelPath, basePersistPath, baseCatDir]) {
    if (!existsSync(p)) { console.error(`usage: base tree at ${rev} is missing ${p.slice(scratch.length + 1)}`); process.exit(2); }
  }
  let basePersist, baseModel;
  try {
    [basePersist, baseModel] = await Promise.all([import(pathToFileURL(basePersistPath).href), import(pathToFileURL(baseModelPath).href)]);
  } catch (e) {
    console.error(`usage: base tree at ${rev} failed to load: ${e.message}`);
    process.exit(2);
  }
  const NEED = ["defaultDocument", "projectView", "figmaBundle", "brandKit", "dsDocOf", "typeScaleFor", "geomScaleFor", "exportDesignSystemBundle", "exportDesignSystemStitchBundle", "exportDesignSystemMakeBundle"];
  for (const name of NEED) {
    if (!(name in baseModel)) { console.error(`usage: base tree at ${rev} is missing the model export ${name}`); process.exit(2); }
  }
  if (!("hydrate" in basePersist)) { console.error(`usage: base tree at ${rev} is missing the persist export hydrate`); process.exit(2); }

  const cats = readdirSync(baseCatDir).filter((f) => f.endsWith(".js") && f !== "index.js").map((f) => f.slice(0, -3)).sort();
  if (only !== null && only !== "default-kit" && !cats.includes(only)) {
    console.error(`usage: --only must be one of ${cats.join(", ")} or default-kit, got "${only}"`);
    process.exit(2);
  }

  // the subjects: the base default kit and every base preset, each hydrated once by the base hydrate
  const subjects = [];
  if (only === null || only === "default-kit") subjects.push({ label: "default-kit", doc: basePersist.hydrate(baseModel.defaultDocument()) });
  for (const slug of only === null ? cats : (only === "default-kit" ? [] : [only])) {
    const { PRESETS } = await import(pathToFileURL(pathJoin(baseCatDir, `${slug}.js`)).href);
    for (const preset of PRESETS) subjects.push({ label: `${slug}/${preset.name}`, doc: basePersist.hydrate({ ...preset }) });
  }
  console.log(`report-compute-neutral --base ${rev}${only ? ` --only ${only}` : ""}${perturb ? " --perturb" : ""}`);
  console.log(`subjects ${subjects.length}`);
  if (subjects.length === 0) { console.log("FAIL: vacuity, no subjects loaded"); process.exit(1); }

  // one worker pool per tree; subject i goes to worker i % jobs on both trees, so the two sides advance together
  const jobs = Math.max(1, Math.min(3, Math.floor(availableParallelism() / 4), subjects.length));
  const trees = { base: pathToFileURL(baseModelPath).href, head: pathToFileURL(pathJoin(REPO_ROOT, "src/ui/model.mjs")).href };
  const pending = new Map(); // idx -> { base?, head? }
  const agg = Object.fromEntries(SURFACES.map((s) => [s, { total: 0, diff: 0, witnesses: [] }]));
  const renderErrors = [];
  let compared = 0;

  const compareSubject = (idx, base, head) => {
    const label = subjects[idx].label;
    for (const [side, r] of [["base", base], ["head", head]]) for (const e of r.errors) renderErrors.push(`${label} (${side}) ${e}`);
    if (perturb && idx === 0 && head.out.projectView) {
      const cell = head.out.projectView.palettes[0].ramp[0];
      const last = cell.hex.slice(-1);
      const flipped = last === "0" ? "1" : (last === "F" ? "E" : (parseInt(last, 16) ^ 1).toString(16).toUpperCase());
      cell.hex = cell.hex.slice(0, -1) + flipped;
    }
    for (const s of SURFACES) {
      if (!(s in base.out) || !(s in head.out)) continue; // a render error, already recorded
      walk(base.out[s], head.out[s], s, agg[s], label);
    }
    compared++;
  };

  await Promise.all(Object.entries(trees).flatMap(([side, modelUrl]) => Array.from({ length: jobs }, (_, w) => new Promise((resolve, reject) => {
    const mine = subjects.map((s, idx) => ({ idx, doc: s.doc })).filter(({ idx }) => idx % jobs === w);
    const worker = new Worker(fileURLToPath(import.meta.url), { workerData: { modelUrl, subjects: mine } });
    worker.on("message", ({ idx, out, errors }) => {
      const slot = pending.get(idx) ?? {};
      slot[side] = { out, errors };
      if (slot.base && slot.head) { pending.delete(idx); compareSubject(idx, slot.base, slot.head); }
      else pending.set(idx, slot);
    });
    worker.on("error", reject);
    worker.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${side} worker ${w} exited ${code}`))));
  })))).catch((e) => { console.log(`FAIL: ${e.message}`); process.exit(1); });

  let totalDiff = 0;
  for (const s of SURFACES) {
    const a = agg[s];
    totalDiff += a.diff;
    console.log(`${s}: ${a.diff} of ${a.total} cells differ${a.witnesses.length ? ` (e.g. ${a.witnesses.join("; ")})` : ""}`);
  }
  if (renderErrors.length || compared !== subjects.length) {
    for (const e of renderErrors.slice(0, 10)) console.log(`  render error: ${e}`);
    // the FAIL line prints last and the total is skipped, so `^0 differing cells$` can never read this as green
    console.log(`FAIL: compared ${compared} of ${subjects.length} subjects, ${renderErrors.length} render error(s)`);
    process.exit(1);
  }
  console.log(`${totalDiff} differing cells`);
  process.exit(totalDiff > 0 ? 1 : 0);
}

// walk(a, b, path, acc, label), add every leaf under a and b to acc.total and every differing one to
// acc.diff: a string is one cell per line, a key or index present on one side only is one differing cell.
function walk(a, b, path, acc, label) {
  if (typeof a === "string" && typeof b === "string") {
    const la = a.split("\n"), lb = b.split("\n");
    const n = Math.max(la.length, lb.length);
    for (let i = 0; i < n; i++) {
      acc.total++;
      if (la[i] !== lb[i]) note(acc, label, `${path} line ${i + 1}`);
    }
    return;
  }
  const kind = (v) => (Array.isArray(v) ? "array" : v instanceof Map ? "map" : v !== null && typeof v === "object" ? "object" : "leaf");
  const ka = kind(a), kb = kind(b);
  if (ka !== kb) { acc.total++; note(acc, label, `${path} (${ka} vs ${kb})`); return; }
  if (ka === "leaf") {
    acc.total++;
    if (!Object.is(a, b)) note(acc, label, path);
    return;
  }
  const A = ka === "map" ? Object.fromEntries(a) : a;
  const B = kb === "map" ? Object.fromEntries(b) : b;
  if (ka === "array") {
    const n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i++) {
      if (i >= A.length || i >= B.length) { acc.total++; note(acc, label, `${path}[${i}] (one side only)`); continue; }
      walk(A[i], B[i], `${path}[${i}]`, acc, label);
    }
    return;
  }
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
    if (!(k in A) || !(k in B)) { acc.total++; note(acc, label, `${path}.${k} (one side only)`); continue; }
    walk(A[k], B[k], `${path}.${k}`, acc, label);
  }
}

function note(acc, label, where) {
  acc.diff++;
  if (acc.witnesses.length < 3) acc.witnesses.push(`${label} ${where}`);
}
