#!/usr/bin/env node
// migrations.mjs — verifier for figma/binder/migrations.mjs's FROZEN pre-wave rename maps. Gates the
// class of bug found live in the BZZR migration (2026-07-17): SCRIM_STEPS_FROZEN listed only 7 of the
// engine's 11 canonical scrim steps, so kebabWaveColorRenames silently left 32 raw scrim variables
// (700/800/900/950 × 8 palettes) unrenamed in a real user file. Every frozen constant here is checked
// against the CURRENT engine source it claims to freeze a snapshot of — not because frozen maps should
// track live canon (they must NOT — see migrations.mjs's own header), but because a frozen map that
// already disagrees with the shape it was frozen FROM was never a correct snapshot to begin with.
import * as M from "../../figma/binder/migrations.mjs";
import * as T from "../../src/engine/type.mjs";
import * as G from "../../src/engine/geometry.mjs";
import * as A from "../../figma/binder/mode-apply-plan.mjs";
import { SCRIM_STEPS } from "../../src/engine/exports.js";
import { semanticRoles } from "../../src/engine/semantic.js";

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

// ── kebabWaveColorRenames: every CURRENT scrim step must be covered, for every palette ──
{
  const palettes = ["neutral", "primary", "secondary", "tertiary", "info", "success", "danger", "warning"];
  const { semantic, raw } = M.kebabWaveColorRenames(palettes);
  const wantRaw = palettes.length * SCRIM_STEPS.length;
  ok(Object.keys(raw).length === wantRaw, `kebabWaveColorRenames: raw scrim renames = ${Object.keys(raw).length}, want ${wantRaw} (${palettes.length} palettes × ${SCRIM_STEPS.length} SCRIM_STEPS) — a frozen step list narrower than the engine's leaves real user variables unrenamed`);
  const pad3 = (s) => String(s).padStart(3, "0");
  for (const step of SCRIM_STEPS) {
    const old = `neutral/500-${pad3(step)}`;
    ok(raw[old] === `neutral/scrim/${pad3(step)}`, `kebabWaveColorRenames: missing/wrong mapping for scrim step ${step} (${old})`);
  }
  // semantic role renames: every non-identity {key,suffix} pair for a real palette must appear.
  let wantSemantic = 0;
  for (const r of semanticRoles("neutral")) if (r.key !== (r.suffix ? r.suffix.slice(1) : "neutral")) wantSemantic++;
  const gotSemantic = Object.keys(semantic).filter((k) => k.startsWith("neutral/")).length;
  ok(gotSemantic === wantSemantic, `kebabWaveColorRenames: neutral semantic renames = ${gotSemantic}, want ${wantSemantic} (every non-identity role key)`);
}

// ── kebabWaveVarRenames: every CURRENT Breakpoints variable a real plan emits must resolve to SOME
//    pre-wave name (this is a coverage check on the reverse tables, not a byte-for-byte one — the
//    tables are frozen history, so this only proves the CURRENT grammar's shape is still reachable) ──
{
  const ix = A.mergeModeInterchanges(
    T.typeTokensFigmaModes(T.typeScale({ treatment: "product", bodyBase: 16 }), []),
    G.geomTokensFigmaModes(G.geomScale({ treatment: "comfortable" }), []),
  );
  const plan = A.modeApplyPlan(ix)[0];
  const names = plan.variables.map((v) => v.name);
  const renames = M.kebabWaveVarRenames(names);
  // every type/ and size/ variable must resolve (space/radius/border/focus/inset/gap were already
  // kebab pre-wave and correctly resolve to null — not counted as coverage gaps).
  const shouldCover = names.filter((n) => n.startsWith("type/") || n.startsWith("size/"));
  const covered = shouldCover.filter((n) => Object.values(renames).includes(n));
  ok(covered.length === shouldCover.length, `kebabWaveVarRenames: ${covered.length}/${shouldCover.length} type/size variables resolve to a pre-wave name (uncovered: ${shouldCover.filter((n) => !covered.includes(n)).slice(0, 5).join(", ")})`);
  ok(Object.keys(renames).length === covered.length, "kebabWaveVarRenames: one pre-wave name per covered current name (no collisions)");
}

// ── FIGMA_MIGRATIONS: the static collection-rename maps name the right old collections ──
{
  const f = M.FIGMA_MIGRATIONS;
  ok(Array.isArray(f.floats.collections.Breakpoints?.renameFrom) && f.floats.collections.Breakpoints.renameFrom.includes("Geometry"), "FIGMA_MIGRATIONS.floats: Breakpoints renames from Geometry");
  ok(Array.isArray(f.color.collections["Color Semantic"]) && f.color.collections["Color Semantic"].includes("Color Modes"), "FIGMA_MIGRATIONS.color: Color Semantic renames from Color Modes");
}

if (fails.length) { console.error(`migrations FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("migrations PASS — kebabWaveColorRenames covers every SCRIM_STEPS entry + every non-identity role, kebabWaveVarRenames covers every live type/size variable, FIGMA_MIGRATIONS names the right old collections");
process.exit(0);
