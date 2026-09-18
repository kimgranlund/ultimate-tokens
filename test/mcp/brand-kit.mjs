#!/usr/bin/env node
// brand-kit.mjs — verifier for the downloadable Brand-Kit MCP server. Generates a kit from the default
// doc, spawns the (zero-dep) server, drives the MCP protocol over stdio, and asserts tools/resources/
// prompts. Proves the engine's tokens are servable to an agent end-to-end.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { brandKit, defaultDocument, paletteGroup } from "../../src/ui/model.mjs";
import { SERVER } from "../../mcp/brand-kit-core.mjs";
import { MCP_BRAND_KIT_VERSION } from "../../src/ui/mcp-assets.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

// 1. generate a real brand kit from the default doc (no systems arg → all three, the back-compat default)
const kit = brandKit(defaultDocument());
// $schema/2 (RP-8, ticket #577, plan PR #571 step E6): EXPORT_SCHEMA_VERSION stamped verbatim.
ok(kit.$schema === "ultimate-tokens-brand-kit/3" && kit.palettes.length === 16, `brandKit shape: $schema=${kit.$schema}, ${kit.palettes.length} palettes (want ultimate-tokens-brand-kit/3, 16)`);
// ZIP PACKAGE VERSION (#638 review F1): the downloaded Brand-Kit MCP zip declares a package.json
// version, and it must be the version the server it packages reports over MCP. app.js used to carry
// a hand-kept copy of that string, which the EXPORT_SCHEMA_VERSION 2 -> 3 bump left at 0.2.0 while
// SERVER.version moved to 0.3.0. The constant is now GENERATED from SERVER.version, and this pins
// the pair so a future bump cannot silently split them again.
ok(MCP_BRAND_KIT_VERSION === SERVER.version, `the downloaded package.json version (${MCP_BRAND_KIT_VERSION}) must equal the server's own SERVER.version (${SERVER.version}); regenerate with npm run gen:mcp-assets`);
// ICONS — the kit ALWAYS names an icon library (an agent must never pick its own).
ok(kit.icons && kit.icons.family === "Phosphor" && kit.icons.variant === "regular", `brandKit serves the default icon system: ${JSON.stringify(kit.icons)}`);
{
  const k2 = brandKit({ ...defaultDocument(), icons: { id: "lucide" } });
  ok(k2.icons && k2.icons.family === "Lucide" && !k2.icons.variant, "a variant-less library (Lucide) serves no variant");
}
// MOTION — system constants, always served (an agent binds curves, never types a raw ms).
ok(kit.motion && kit.motion.easing && kit.motion.easing.standard && kit.motion.duration.short2 === 100 && kit.motion.animatable.join() === "transform,opacity",
  `brandKit serves the motion facet: ${JSON.stringify(kit.motion && kit.motion.animatable)}`);
// CONSTANTS — fixed, non-palette tokens (dialog-backdrop, white, black), always served like motion
// (no sys.color gate: none of these are a brand color).
ok(kit.constants && kit.constants.dialogBackdrop && kit.constants.dialogBackdrop.hex === "#000000CC" && kit.constants.dialogBackdrop.oklch === "oklch(0 0 0 / 80%)",
  `brandKit serves the constants facet: ${JSON.stringify(kit.constants)}`);
ok(kit.constants && kit.constants.white && kit.constants.white.hex === "#FFFFFF" && kit.constants.white.oklch === "oklch(1 0 0)",
  `brandKit serves constants.white: ${JSON.stringify(kit.constants && kit.constants.white)}`);
ok(kit.constants && kit.constants.black && kit.constants.black.hex === "#000000" && kit.constants.black.oklch === "oklch(0 0 0)",
  `brandKit serves constants.black: ${JSON.stringify(kit.constants && kit.constants.black)}`);
{
  const k3 = brandKit(defaultDocument(), { type: true }); // even with color OFF, constants still ride
  ok(k3.constants && k3.constants.dialogBackdrop && k3.constants.white && k3.constants.black, "constants survive with sys.color off (not gated by any system toggle)");
}
ok(kit.roles.primary && typeof kit.roles.primary.primary.light === "string" && typeof kit.roles.primary.primary.dark === "string", "brandKit resolves the prime accent for light + dark");
ok(kit.type && kit.geometry, "brandKit() (no arg) includes all three systems (color + type + geometry)");

// opt-in gating: brandKit(doc, systems) includes ONLY the selected systems (the export opt-in contract)
const colorOnly = brandKit(defaultDocument(), { color: true });
ok(colorOnly.palettes && !colorOnly.type && !colorOnly.geometry, "brandKit({color}) omits type + geometry");
const typeOnly = brandKit(defaultDocument(), { type: true });
ok(!typeOnly.palettes && !typeOnly.roles && typeOnly.type && !typeOnly.geometry, "brandKit({type}) omits colour + geometry");
const geomOnly = brandKit(defaultDocument(), { geometry: true });
ok(!geomOnly.palettes && !geomOnly.type && geomOnly.geometry, "brandKit({geometry}) omits colour + type");

// BASE per-cell overrides reach the kit (Phase 3 — the MCP zip + get_type/get_geometry are override-aware,
// like every other export). A "<...>|base"-keyed tokenOverride must surface on kit.type / kit.geometry.
{
  const baseDoc = defaultDocument();
  const ovDoc = {
    ...baseDoc,
    type: { ...baseDoc.type, tokenOverrides: { "Body|MD|base": 99, "Label|MD|base": 33 } },
    geometry: { ...baseDoc.geometry, tokenOverrides: { "MD|base": 50 } },
  };
  const ovKit = brandKit(ovDoc);
  const plainKit = brandKit(baseDoc);
  ok(ovKit.type.categories.Body.MD.size === 99, `a BASE type override reaches kit.type (got ${ovKit.type.categories.Body.MD.size}, want 99)`);
  ok(ovKit.type.categories.Body.MD.size !== plainKit.type.categories.Body.MD.size, "the type override actually moves kit.type off the un-overridden kit");
  ok(ovKit.geometry.sizes.MD.height === 50, `a BASE geom override reaches kit.geometry (got ${ovKit.geometry.sizes.MD.height}, want 50)`);
  ok(ovKit.geometry.sizes.MD.height !== plainKit.geometry.sizes.MD.height, "the geom override actually moves kit.geometry off the un-overridden kit");
  // the per-step `font` is DECOUPLED from the type scale (2026-07-16) — a type override must NOT move it,
  // and a height override doesn't either (the control-text ramp is per-STEP, not per-height)
  ok(ovKit.geometry.sizes.MD.font === plainKit.geometry.sizes.MD.font, `the control font is decoupled — type/height overrides don't move it (got ${ovKit.geometry.sizes.MD.font})`);
  // a NON-base ("|md")-keyed override must NOT touch the BASE kit (the base slice is mode-local)
  const nonBaseDoc = { ...baseDoc, type: { ...baseDoc.type, tokenOverrides: { "Body|MD|md": 99 } } };
  ok(brandKit(nonBaseDoc).type.categories.Body.MD.size === plainKit.type.categories.Body.MD.size, "a non-base (|md) override does NOT leak into the BASE kit");
}

// controls (SPEC 0.3.0 RP-2, ticket #573, plan PR #571 step E2): the brand-kit states the chroma
// policy it was generated under — the SAME shape exportJSON's `meta.controls` carries. Proven with a
// document whose controls are NON-default (every group differs from GROUP_DEFAULTS, both global
// fallbacks differ from 100/100) so the check exercises real resolution, not a default-vs-default
// match that would pass even if brandKit ignored the document's controls entirely.
{
  const customDoc = {
    ...defaultDocument(),
    baseIntensity: 42,
    primeChroma: 77,
    paletteGroups: {
      material: { baseChroma: 12, primeChroma: 34 },
      brand: { baseChroma: 56, primeChroma: 78 },
      system: { baseChroma: 90, primeChroma: 11 },
      data: { baseChroma: 100, primeChroma: 100 }, // data stays locked to its own default (REQ-002)
    },
  };
  const customKit = brandKit(customDoc);
  ok(customKit.controls && customKit.controls.baseChroma === 42 && customKit.controls.primeChroma === 77,
    `brandKit(doc).controls resolves the doc's own global fallbacks (got ${JSON.stringify(customKit.controls)})`);
  ok(customKit.controls && customKit.controls.paletteGroups && customKit.controls.paletteGroups.brand.baseChroma === 56 && customKit.controls.paletteGroups.brand.primeChroma === 78,
    `brandKit(doc).controls.paletteGroups resolves the doc's own per-group override (got ${JSON.stringify(customKit.controls && customKit.controls.paletteGroups.brand)})`);
  ok(kit.controls && customKit.controls.baseChroma !== kit.controls.baseChroma,
    "the default doc's kit.controls differs from the custom doc's — proves controls isn't a hardcoded constant");
}

const dir = mkdtempSync(join(tmpdir(), "ultimate-tokens-mcp-"));
const kitPath = join(dir, "brand-kit.json");
writeFileSync(kitPath, JSON.stringify(kit));

// 2. spawn the server + drive newline-delimited JSON-RPC over stdio
const srv = spawn("node", [resolve(ROOT, "mcp/brand-kit-server.mjs"), kitPath], { stdio: ["pipe", "pipe", "inherit"] });
const pending = new Map();
let buf = "";
srv.stdout.setEncoding("utf8");
srv.stdout.on("data", (c) => {
  buf += c; let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
    if (!line) continue;
    const m = JSON.parse(line);
    if (m.id != null && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  }
});
let idc = 0;
const rpc = (method, params) => new Promise((res) => { const id = ++idc; pending.set(id, res); srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"); });
const notify = (method) => srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", method }) + "\n");
const callTool = async (name, args) => { const r = await rpc("tools/call", { name, arguments: args }); return JSON.parse(r.result.content[0].text); };

try {
  const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } });
  ok(init.result && init.result.serverInfo.name === "ultimate-tokens-brand-kit" && !!init.result.capabilities.tools, "initialize → serverInfo + capabilities");
  notify("notifications/initialized");

  const tools = (await rpc("tools/list")).result.tools.map((t) => t.name);
  ok(["list_palettes", "get_ramp", "get_prime", "resolve_token", "get_semantic", "nearest_token"].every((n) => tools.includes(n)), `tools/list has all 6 colour tools (${tools})`);
  ok(tools.includes("get_type") && tools.includes("get_geometry"), `tools/list has get_type + get_geometry (the opted-in systems) (${tools})`);

  const ty = await callTool("get_type", {});
  ok(ty && ty.categories && ty.categories.Body, "get_type → the typography scale (Body voice present)");
  const geo = await callTool("get_geometry", {});
  ok(geo && geo.sizes && geo.sizes.MD && geo.sizes.MD.paddingNarrow === (geo.sizes.MD.height - geo.sizes.MD.icon) / 2, "get_geometry → the dimensional scale (the centering law holds on the served MD size)");
  // decoupled end-to-end (2026-07-16): the served geometry's per-step `font` is the control-text ramp,
  // NOT the Label voice — and the retired composition flag is gone
  ok(!("typed" in geo) && geo.sizes.MD.font === 15, `get_geometry font is the decoupled control-text ramp (got ${geo.sizes.MD.font}, want 15)`);

  const resUris = (await rpc("resources/list")).result.resources.map((r) => r.uri);
  ok(resUris.includes("brand://type") && resUris.includes("brand://geometry"), `resources/list has brand://type + brand://geometry (${resUris})`);
  ok(resUris.includes("brand://palette/primary/prime") && resUris.filter((u) => /^brand:\/\/palette\/.+\/prime$/.test(u)).length === 16, `resources/list has one brand://palette/{slug}/prime per palette (${resUris.length} total)`);

  // brand://kit serves the full kit object verbatim — its `controls` block (RP-2) must round-trip
  // over the MCP protocol matching the local kit.controls exactly (no drift between what the server
  // sends and what brandKit(doc) computed).
  const kitRes = JSON.parse((await rpc("resources/read", { uri: "brand://kit" })).result.contents[0].text);
  ok(kitRes && kitRes.controls && JSON.stringify(kitRes.controls) === JSON.stringify(kit.controls),
    `brand://kit resource's controls round-trips over MCP matching the local kit.controls (got ${JSON.stringify(kitRes && kitRes.controls)})`);

  const pal = await callTool("list_palettes", {});
  ok(Array.isArray(pal) && pal.length === 16 && /^#|^oklch/.test(pal[0].key || ""), "list_palettes → 16 palettes with identity colours");
  // group metadata (SPEC 0.3.0 RP-1, ticket #572): every entry's group is one of the four valid ids
  // and matches model.mjs's own paletteGroup(p) resolution for that palette — no drift between the
  // MCP's served metadata and the single resolver every other surface reads.
  {
    const VALID_GROUPS = ["material", "brand", "system", "data"];
    const dd = defaultDocument();
    const bad = pal.filter((p) => !VALID_GROUPS.includes(p.group));
    ok(bad.length === 0, `list_palettes: every palette's group is one of ${VALID_GROUPS.join("/")} (bad: ${JSON.stringify(bad)})`);
    const drift = pal.filter((p) => {
      const src = dd.palettes.find((d) => d.name === p.name);
      return !src || p.group !== paletteGroup(src);
    });
    ok(drift.length === 0, `list_palettes: every palette's group matches paletteGroup(p)'s own resolution (drift: ${JSON.stringify(drift)})`);
  }

  const tl = await callTool("resolve_token", { role: "primary/primary", scheme: "light" });
  const td = await callTool("resolve_token", { role: "primary/primary", scheme: "dark" });
  ok(tl.hex === kit.roles.primary.primary.light && td.hex === kit.roles.primary.primary.dark, `resolve_token primary/primary matches the kit (light ${tl.hex} / dark ${td.hex})`);

  const ramp = await callTool("get_ramp", { palette: "primary" });
  ok(ramp.ramp && ramp.ramp.length >= 19 && !!ramp.ramp.find((s) => s.stop === 500), "get_ramp → the tonal ramp incl. stop 500");

  // AC-053: get_prime("primary") returns seven entries in step order, with real hex/oklch values
  // taken verbatim from kit.palettes[i].prime (never re-derived here).
  const prime = await callTool("get_prime", { palette: "primary" });
  const wantOrder = ["brightest", "brighter", "bright", "prime", "dim", "dimmer", "dimmest"];
  ok(prime.palette === "Primary" && Array.isArray(prime.steps) && prime.steps.length === 7, `get_prime("primary") → 7 entries (${JSON.stringify(prime)})`);
  ok(prime.steps.map((s) => s.step).join() === wantOrder.join(), `get_prime("primary") → step order (${prime.steps.map((s) => s.step).join()})`);
  const primaryKit = kit.palettes.find((p) => p.slug === "primary");
  ok(prime.steps.every((s) => /^#[0-9A-F]{6}$/.test(s.hex) && /^oklch\(/.test(s.oklch)), `get_prime("primary") steps carry real hex/oklch values (${JSON.stringify(prime.steps[0])})`);
  ok(prime.steps.every((s) => s.hex === primaryKit.prime[s.step].hex && s.oklch === primaryKit.prime[s.step].oklch), "get_prime(\"primary\") matches kit.palettes[i].prime verbatim");

  const primeRes = JSON.parse((await rpc("resources/read", { uri: "brand://palette/primary/prime" })).result.contents[0].text);
  ok(JSON.stringify(primeRes) === JSON.stringify(prime), "brand://palette/primary/prime matches get_prime(\"primary\") verbatim");

  const exact = kit.palettes[1].ramp.find((s) => s.stop === 500).hex;
  const near = await callTool("nearest_token", { hex: exact });
  ok(near.hex === exact && near.distance === 0, `nearest_token of an exact stop hex → distance 0 (got ${near.distance})`);

  const sem = await callTool("get_semantic", { scheme: "dark" });
  ok(typeof sem["primary/surface"] === "string", "get_semantic flattens roles to palette/role hexes");

  const guide = (await rpc("resources/read", { uri: "brand://guide" })).result.contents[0].text;
  ok(typeof guide === "string" && guide.length > 50, "resources/read brand://guide returns the usage guide");

  const prm = await rpc("prompts/get", { name: "apply_brand" });
  ok(prm.result.messages && prm.result.messages[0].content.text.length > 20, "prompts/get apply_brand returns guidance");

  const bad = await rpc("nope/nope", {});
  ok(bad.error && bad.error.code === -32601, "unknown method → JSON-RPC -32601");
} catch (e) {
  fails.push("threw: " + e.message);
} finally {
  try { srv.stdin.end(); srv.kill(); } catch { /* */ }
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* */ }
}

if (fails.length) { console.error("brand-kit MCP FAIL:\n  " + fails.join("\n  ")); process.exit(1); }
console.log("brand-kit MCP PASS — server serves palettes/ramps/semantic/nearest over MCP stdio");
process.exit(0);
