import { STANDARD_GEOM_RUNGS, geomEffectiveModes, geomModeScales, geomScaleFor, slug } from "../model.mjs";
import { CELL_FIELDS, DEFAULT_GEOMETRY, RADIUS_MODES, SCALES, TIERS, mdAnchor, orderedSizeNames, geomTokensDTCG } from "../../engine/geometry.mjs";
import { icon } from "../icons.js";
import { btn, ensureTypeFonts, field, h } from "../app-helpers.mjs";

// The Maison ladder's three kit axes (T-0017), labelled for the inspector; ids are the engine's own.
const TIER_LABEL = { content: "Content", product: "Product", micro: "Micro" };
const SCALE_LABEL = { sm: "Small", md: "Medium", lg: "Large" };
const RADIUS_LABEL = { default: "Default", round: "Round", sharp: "Sharp", pill: "Pill" };
const SPACE_BASES = [4, 8];
// a readout number: the radius and ratio fields keep full float precision in the engine, the UI shows 2 places.
const num = (v) => String(Math.round(v * 100) / 100);
// cellRows(scale), the 27 cells grouped into the nine tier × scale rows, each [rowName, [sm, md, lg]], in
// orderedSizeNames order (content, product, micro; then scale sm, md, lg).
const cellRows = (scale) => {
  const rows = [];
  for (const name of orderedSizeNames(scale)) {
    const row = name.slice(0, name.lastIndexOf("-"));
    const last = rows[rows.length - 1];
    if (last && last[0] === row) last[1].push(name); else rows.push([row, [name]]);
  }
  return rows;
};

// Prototype mixin (TKT-0023): a class body used ONLY as a verbatim, comma-free carrier for these
// methods, copied onto HctApp.prototype (see app.js's mixin() call), never instantiated directly.
export class GeomSectionImpl {
  // _geomEffectiveModes / _geomScaleFor / _geomModeScales are PURE `doc -> ...` functions lifted into
  // model.mjs (A1, #456), thin delegates here so the section's many call sites don't churn. See model.mjs
  // for the implementations + rationale.
  _geomEffectiveModes() {
    return geomEffectiveModes(this.doc);
  }

  // _ensureGeomModesMaterialized(d), if d.geometry has no real modes yet AND modeKey is one of the
  // Standard-set rungs, materialize BOTH rungs (same stable ids _geomEffectiveModes already previewed,
  // each at its rung's scale) so a write against modeKey has a real entry to land in. Mutates d.geometry
  // in place; call inside a commit closure BEFORE writing the actual per-mode value. A no-op for "base",
  // a real custom mode id, or when modes already exist.
  _ensureGeomModesMaterialized(d, modeKey) {
    if ((d.geometry.modes || []).length || !STANDARD_GEOM_RUNGS.some((r) => r.id === modeKey)) return;
    d.geometry.baseName = d.geometry.baseName || "Desktop";
    d.geometry.modes = STANDARD_GEOM_RUNGS.map((r) => ({ id: r.id, name: r.name, scale: r.scale, minWidth: r.w }));
  }

  // _geomScaleFor(modeKey), see model.mjs#geomScaleFor for the implementation + rationale.
  _geomScaleFor(modeKey) {
    return geomScaleFor(this.doc, modeKey);
  }

  // _setGeomSpaceBase(v), the container tier's spacing base (4 or 8). Not Pro-gated (the retired
  // treatment select never gated spacing on its own). One commit = one undo step.
  _setGeomSpaceBase(v) {
    const n = Number(v);
    if (!SPACE_BASES.includes(n)) return;
    this.commit((d) => { d.geometry = { ...(d.geometry || DEFAULT_GEOMETRY), spaceBase: n }; });
  }

  // renderGeomTokensTable, the Geometry token TABLE: one row per cell (the 27 cells in orderedSizeNames
  // order, the token NAME --size-{tier}-{scale}-{size} in the sticky first column) × the engine's
  // CELL_FIELDS, the 16 per-cell fields. Read-only: the cells are one fixed ladder, the same in every breakpoint mode (a mode moves
  // the kit along the scale axis instead); the kit default cell is marked.
  renderGeomTokensTable() {
    const scale = this._geomScaleFor("base");
    const names = orderedSizeNames(scale);
    const kit = scale.cell.name;
    const { baseName: bn } = this._geomBaseOpts();
    const modes = [[bn, scale.scale], ...this._geomEffectiveModes().map((m) => [m.name || "Mode", m.scale])];
    const headCells = CELL_FIELDS.map(([f]) => h("th", { class: "tok-col", scope: "col" }, h("span", { class: "tok-col-name" }, f)));
    const rows = [];
    rows.push(h("tr", { class: "tok-group" },
      h("th", { class: "tok-grouphead", colspan: String(CELL_FIELDS.length + 1), scope: "colgroup" },
        h("b", {}, "Cells"), h("small", {}, "tier × scale × size"), h("span", { class: "tok-group-count" }, `${names.length} cells`))));
    for (const name of names) {
      const c = scale.cells[name];
      rows.push(h("tr", { class: "tok-row" + (name === kit ? " is-kit" : ""), "data-cell": name },
        h("th", { class: "tok-name", scope: "row" }, h("code", {}, `--size-${name}`), name === kit ? h("small", { class: "tok-col-bp" }, " kit") : false),
        ...CELL_FIELDS.map(([, key]) => h("td", { class: "tok-cell" }, num(c[key])))));
    }
    return h(
      "div",
      { class: "tok-wrap" },
      h("div", { class: "tok-head" },
        h("b", {}, "Geometry tokens"),
        h("small", {}, `${names.length} cells · ${CELL_FIELDS.length} fields · kit ${kit}`),
        h("small", { class: "tok-hint" }, `The cells are one fixed ladder, the same at every breakpoint; a breakpoint moves the kit along the scale axis (${modes.map(([n, s]) => `${n} ${s}`).join(" · ")}).`)),
      h(
        "table",
        { class: "map-table tok-table" },
        h("thead", {}, h("tr", {}, h("th", { class: "tok-name tok-name-head", scope: "col" }, "Token"), ...headCells)),
        h("tbody", {}, ...rows),
      ),
    );
  }

  // ── Geometry section, the dimensional system as a full editor section (canvas + analysis rail +
  // inspector), the spatial analog of the Color and Typography sections. All geometry comes from
  // geometryScale(doc), COMPOSED with the type scale (each cell's text is Typography's height-indexed UI
  // text). Binds to doc.geometry = { tier, scale, radius, spaceBase, modes? } (T-0017, the Maison ladder). ──
  setGeomSpecMode(v) { this.geomSpecMode = v; this.render(); }


  // ── Geometry breakpoint modes (Phase 5), each a named `scale` over doc.geometry. Mirrors the Typography
  // mode helpers; the ACTIVE mode drives the canvas preview + the inspector. Export stays on Base.
  // _effGeomMode, the mode the ACTIVE resolvers paint in: a Compare column's _geomModeOverride wins (so its
  // scene + scale build at THAT breakpoint while it renders, like the column scheme _inScheme sets), else this.geomMode.
  _effGeomMode() { return this._geomModeOverride != null ? this._geomModeOverride : this.geomMode; }

  _activeGeometry() {
    const g = this.doc.geometry || DEFAULT_GEOMETRY;
    const mode = this._effGeomMode();
    if (mode === "base") return g;
    const m = this._geomEffectiveModes().find((x) => x.id === mode);
    return m ? { ...g, scale: m.scale } : g;
  }

  // the resolved scale at the active mode, composed with the type scale. Routed through _geomScaleFor so
  // the canvas and inspector agree with every export.
  _activeGeomScale() {
    const mode = this._effGeomMode();
    const key = mode === "base" || !this._geomEffectiveModes().some((m) => m.id === mode) ? "base" : mode;
    return this._geomScaleFor(key);
  }

  // see model.mjs#geomModeScales for the implementation + the full rationale (Desktop-anchored
  // synthesis, each synthesized mode a scale on the ladder).
  _geomModeScales() {
    return geomModeScales(this.doc);
  }

  _geomBaseOpts() {
    const g = this.doc.geometry || DEFAULT_GEOMETRY;
    const synthesized = !(g.modes || []).length;
    const n = (g.baseName || (synthesized ? "Desktop" : "Base")).trim() || "Base";
    return { baseName: n, baseLast: n.toLowerCase() === "mobile" };
  }

  _geomModeDTCGFiles(prefix = "geometry", opts = {}) {
    return this._geomModeScales().filter((m) => Number(m.minWidth) > 0)
      .map((m) => ({ name: `${prefix}.${Math.round(m.minWidth)}.tokens.json`, data: JSON.stringify(geomTokensDTCG(m.scale, opts), null, 2) }));
  }

  // Mirrors typeModeControl: a NAMED base (doc.geometry.baseName, e.g. "Mobile") renders LAST, the
  // canonical desktop-first order (Desktop · Tablet · Mobile), matching the Figma mode-column order.
  geomModeControl() {
    const g = this.doc.geometry || DEFAULT_GEOMETRY;
    const modes = this._geomEffectiveModes();
    const { baseName: bn, baseLast } = this._geomBaseOpts();
    // reset an unknown/deleted mode to base, but "compare" (Phase 5.3) is a valid pseudo-mode, allow it.
    if (this.geomMode !== "base" && this.geomMode !== "compare" && !modes.some((m) => m.id === this.geomMode)) this.geomMode = "base";
    const baseItem = { id: "base", label: bn, title: `${bn} · ${g.scale || DEFAULT_GEOMETRY.scale} scale` };
    const modeItems = modes.map((m) => ({ id: m.id, label: m.name || "Mode", title: `${m.name || "Mode"} · ${m.scale} scale` }));
    const items = [
      ...(baseLast ? [...modeItems, baseItem] : [baseItem, ...modeItems]),
      // Compare = all breakpoints side by side (Phase 5.3). `_geomEffectiveModes()` returns the standard Tablet and Mobile
      // rungs when the document has no modes, so this guard never takes its empty branch and All is always offered.
      ...(modes.length ? [{ id: "compare", label: "All", title: "All breakpoints side by side" }] : []),
    ];
    return h(
      "div",
      { class: "mode-control" },
      this.segmented(items, this.geomMode, (id) => { this.geomMode = id; this.render(); },
        { cls: "canvas-seg", ariaLabel: "Geometry breakpoint mode", role: "group", idPrefix: "gmode" }),
      btn(icon("plus"), { cls: "mode-add", ariaLabel: "Add a breakpoint mode", title: "Add a breakpoint: a named mode with its own scale on the ladder", onclick: () => this.addGeomMode() }),
    );
  }

  // addStandardGeomModes, materialize the intrinsic standard set as editable doc modes (the ratified
  // desktop-anchored law): the designed kit IS Desktop (the base, first, Figma's default mode, baseName
  // "Desktop", nothing about it changes); Tablet (992) and Mobile (≤476, marker minWidth 476) each carry
  // the rung's scale (sm), the same values the synthesized (no-modes) shape exports; committing just makes
  // them editable. One commit = one undo step.
  addStandardGeomModes() {
    this.geomMode = "base"; // stay on Desktop (the designed kit, nothing about it changed)
    this.commit((d) => {
      d.geometry = { ...(d.geometry || DEFAULT_GEOMETRY), baseName: "Desktop" };
      const modes = d.geometry.modes ? [...d.geometry.modes] : [];
      STANDARD_GEOM_RUNGS.forEach((r) => modes.push({ id: r.id, name: r.name, scale: r.scale, minWidth: r.w }));
      d.geometry.modes = modes;
    });
  }

  addGeomMode() {
    const id = "gm-" + Date.now().toString(36);
    this.geomMode = id;
    this.commit((d) => {
      d.geometry = { ...(d.geometry || DEFAULT_GEOMETRY) };
      const modes = d.geometry.modes ? [...d.geometry.modes] : [];
      modes.push({ id, name: "Mode " + (modes.length + 1), scale: d.geometry.scale || DEFAULT_GEOMETRY.scale });
      d.geometry.modes = modes;
    });
  }

  deleteGeomMode(id) {
    const remaining = (this.doc.geometry && this.doc.geometry.modes || []).filter((m) => m.id !== id).length;
    if (this.geomMode === id || (this.geomMode === "compare" && remaining === 0)) this.geomMode = "base";
    this.commit((d) => {
      if (!d.geometry || !Array.isArray(d.geometry.modes)) return;
      d.geometry = { ...d.geometry, modes: d.geometry.modes.filter((m) => m.id !== id) };
      if (d.geometry.modes.length === 0) delete d.geometry.modes;
    });
  }

  renameGeomMode(id, name) {
    this.commit((d) => {
      if (!d.geometry || !Array.isArray(d.geometry.modes)) return;
      d.geometry = { ...d.geometry, modes: d.geometry.modes.map((m) => (m.id === id ? { ...m, name: name || m.name } : m)) };
    });
  }

  // _setActiveGeomScaleId(id), the ACTIVE mode's scale. On Base (and Compare, whose inspector shows Base)
  // it is the kit's own scale pick, Pro-gated like tier and radius; on a breakpoint it writes that mode's
  // `scale`, materializing a not-yet-real Standard-set rung first. One commit = one undo step.
  _setActiveGeomScaleId(id) {
    if (!SCALES.includes(id)) return;
    if (this.geomMode === "base" || this.geomMode === "compare") { this._pickGeomAxis("scale", id); return; }
    this.commit((d) => {
      d.geometry = { ...(d.geometry || DEFAULT_GEOMETRY) };
      this._ensureGeomModesMaterialized(d, this.geomMode);
      d.geometry.modes = (d.geometry.modes || []).map((m) => (m.id === this.geomMode ? { ...m, scale: id } : m));
    });
  }

  _geomModeEditor() {
    const g = this.doc.geometry || DEFAULT_GEOMETRY;
    if (this.geomMode === "base" || this.geomMode === "compare") {
      const n = (g.modes || []).length;
      return h("p", { class: "insp-sub tyi-future" }, n
        ? `${n} breakpoint mode${n > 1 ? "s" : ""}, switch them from the canvas header; each moves the kit along the scale axis.`
        : "Add a breakpoint (the + in the canvas header) to give another screen its own scale on the ladder, e.g. sm on mobile.");
    }
    const m = this._geomEffectiveModes().find((x) => x.id === this.geomMode);
    if (!m) return false;
    // one sm/md/lg segmented control per mode: the mode's only lever is where it sits on the scale axis.
    const scaleRow = [
      h("span", { class: "mode-editor-label" }, "Breakpoint scale"),
      this.segmented(SCALES.map((s) => ({ id: s, label: s, title: `${SCALE_LABEL[s]} scale` })), m.scale, (id) => this._setActiveGeomScaleId(id),
        { role: "group", ariaLabel: `${m.name || "Mode"} scale`, idPrefix: "gmode-scale" }),
    ];
    if (!(g.modes || []).some((x) => x.id === m.id)) {
      return h("div", { class: "mode-editor" }, ...scaleRow,
        h("p", { class: "insp-sub tyi-future" }, "A Standard-set breakpoint: picking its scale makes Tablet and Mobile real, editable modes."));
    }
    return h(
      "div",
      { class: "mode-editor" },
      h("label", { class: "mode-editor-label", for: "fld-gmode-name" }, "Breakpoint name"),
      h(
        "div",
        { class: "mode-editor-row" },
        h("input", { id: "fld-gmode-name", type: "text", value: m.name, "data-fk": "gmode-name", "aria-label": "Breakpoint mode name",
          onchange: (e) => this.renameGeomMode(m.id, e.target.value.trim()) }),
        btn(icon("trash"), { ariaLabel: "Delete this breakpoint", title: "Delete this breakpoint mode", onclick: () => this.deleteGeomMode(m.id) }),
      ),
      ...scaleRow,
      h("label", { class: "mode-editor-label", for: "fld-gmode-mw" }, "Breakpoint width: @media min-width"),
      h(
        "div",
        { class: "mode-editor-row" },
        h("input", { id: "fld-gmode-mw", type: "number", min: 0, max: 3840, step: 1, value: m.minWidth || "", placeholder: "e.g. 768", "data-fk": "gmode-mw", "aria-label": "Breakpoint min-width in px",
          onchange: (e) => this.setGeomModeMinWidth(m.id, e.target.value) }),
        h("span", { class: "mode-editor-unit" }, "px"),
      ),
      this._modeWidthPresets(m.minWidth, (w) => this.setGeomModeMinWidth(m.id, w)),
      h("p", { class: "insp-sub tyi-future" }, m.minWidth
        ? `Exports as @media (min-width: ${m.minWidth}px), the scale indicators switch to ${m.scale} above ${m.minWidth}px.`
        : "Set a width to emit a CSS @media breakpoint in the export; blank = preview-only."),
    );
  }

  setGeomModeMinWidth(id, v) {
    const n = Math.round(Number(v));
    this.commit((d) => {
      if (!d.geometry || !Array.isArray(d.geometry.modes)) return;
      d.geometry = { ...d.geometry, modes: d.geometry.modes.map((m) => {
        if (m.id !== id) return m;
        const mm = { ...m };
        if (Number.isFinite(n) && n > 0) mm.minWidth = Math.max(1, Math.min(3840, n)); else delete mm.minWidth;
        return mm;
      }) };
    });
  }

  // renderGeomCanvasHeader, the Geometry section's canvas header: pane toggles + the Controls·Tokens mode
  // segment + the reused fit/scheme/zoom controls (mirrors renderTypeCanvasHeader).
  renderGeomCanvasHeader() {
    return h(
      "div",
      { class: "canvas-header" },
      !this.panesLeft ? this.paneToggle("left") : false,
      this.geomMode === "compare" ? false : this.segmented(
        [
          { id: "controls", label: "Controls", title: "Live mock controls: render each of the 27 cells as a real box" },
          { id: "tokens", label: "Tokens", title: `Token table: every cell × its ${CELL_FIELDS.length} fields` },
        ],
        this.geomSpecMode,
        (id) => this.setGeomSpecMode(id),
        { cls: "canvas-seg", ariaLabel: "Geometry specimen mode", role: "group", idPrefix: "gspec" },
      ),
      this.geomModeControl(),
      h("div", { class: "spacer" }),
      btn(icon("crosshair"), {
        title: "Fit: reset the canvas view to centre at 100%",
        ariaLabel: "Fit: reset the canvas view to centre at 100%",
        onclick: () => { this.fit(); this.render(); },
      }),
      btn(icon("minus"), { ariaLabel: "Zoom out", onclick: () => this.zoomBy(-1) }),
      h("span", { class: "zoom-readout", role: "status", "aria-live": "polite", "aria-label": "Zoom level" }, Math.round(this.viewport.zoom * 100) + "%"),
      btn(icon("plus"), { ariaLabel: "Zoom in", onclick: () => this.zoomBy(1) }),
      !this.panesRight ? this.paneToggle("right") : false,
    );
  }


  // renderGeomCanvas, the Geometry center. Controls mode renders the full dimensional dataset (the 27
  // ladder cells + radius + space) in the pannable/zoomable .canvas-area + .canvas-scene shell. Tokens mode
  // renders the cell token TABLE in the scrolling .is-table shell instead, mirrors renderTypeCanvas /
  // Color's Mapping flip.
  renderGeomCanvas(view) {
    // Breakpoint Compare is a Specimen/Controls view, so it wins over the tokens table (which has no scheme: it
    // sits on the chrome ground, as Color's Mapping table does).
    if (this.geomSpecMode === "tokens" && this.geomMode !== "compare") return this._tokensTableArea("Geometry tokens: the 27 ladder cells", this.renderGeomTokensTable());
    return this.renderGeomCompareArea(view);
  }


  // renderGeomCompareArea, the Geometry canvas: the cell ladder rendered in Light AND Dark, side by side, for every SHOWN
  // breakpoint, inside ONE pannable .canvas-scene (so pan/zoom/fit move all columns together). One column per
  // (scheme, shown breakpoint), light columns first: at one breakpoint that is 2 columns, in breakpoint Compare
  // (mode "compare") 2 x (1 + modes.length), each column forcing its breakpoint via _geomModeOverride while it builds.
  renderGeomCompareArea(view) {
    const modes = this.geomMode === "compare" ? this._geomEffectiveModes() : null;
    const breakpoints = modes ? [["base", "Base"], ...modes.map((m) => [m.id, m.name || "Mode"])] : [[null, null]];
    const area = h(
      "div",
      { class: "canvas-area canvas-compare geom-canvas",
        role: "group", "aria-label": "Geometry specimen, Light and Dark side by side · drag to pan, wheel to zoom" },
      h("div", { class: "canvas-scene compare" },
        ...["light", "dark"].flatMap((scheme) =>
          breakpoints.map(([modeId, name]) => this._geomCompareColumn(view, scheme, modeId, name)))),
    );
    this.wirePanZoom(area);
    requestAnimationFrame(() => this.applyTransform());
    return area;
  }

  // _geomCompareColumn, one (scheme, breakpoint) column. `modeId` null = the active breakpoint (one-breakpoint view);
  // otherwise it forces that breakpoint while the column's scene builds. The label names the scheme, and
  // the breakpoint when Compare shows several.
  _geomCompareColumn(view, scheme, modeId, name) {
    const schemeLabel = scheme === "dark" ? "Dark" : "Light";
    this._geomModeOverride = modeId; // force the active geometry resolvers to THAT breakpoint while this column's scene builds (null = the active one)
    try {
      return this._schemeColumn(scheme, name ? name + " · " + schemeLabel : schemeLabel, () => this.renderGeometryScene(view));
    } finally {
      this._geomModeOverride = null;
    }
  }


  // renderGeometryScene, the canvas "Geometry" view: the FULL dataset. (1) the 27 ladder CELLS as nine
  // tier × scale rows of three sizes (sm · md · lg), each cell a live mock control (leading glyph · label)
  // at its real height / inset / text / icon / control radius with a metrics readout, the kit default cell
  // marked; (2) the RADIUS ladder; (3) the SPACE scale. Each cell's text comes from the type scale's UI
  // text table (the composition), so ensureTypeFonts() makes that font real; paints in its column's scheme.
  renderGeometryScene(view) {
    ensureTypeFonts();
    const scale = this._activeGeomScale(); // composed with the type scale, each cell's `text` is the brand's UI text at its height
    const kit = scale.cell.name;
    // painted in the SELECTED palette's own roles, same resolution geomExampleCard uses, so
    // the canvas ladder isn't a generic-accent mock while the pinned inspector card is palette-real.
    const { pick, main, onMain } = this._geomPaletteColors(view);
    const ctlLine = (name) => {
      const c = scale.cells[name];
      const isKit = name === kit;
      // gap = inset/2 between the glyph box and the label (a mock affordance, not a token)
      const box = h(
        "div",
        {
          class: "geom-ctl",
          style: `background:${pick(main)};color:${pick(onMain)};height:${c.height}px;font-size:${c.text}px;gap:${c.inset / 2}px;padding-inline:${c.inset}px;border-radius:${num(c.radiusControl)}px`,
          title: `${name} · height ${c.height} · inset ${c.inset} · text ${c.text} · icon ${c.icon} · radius ${num(c.radiusControl)}`,
        },
        h("span", { class: "geom-glyph", style: `width:${c.icon}px;height:${c.icon}px` }, icon("calendar-blank", { size: c.icon })),
        h("span", { class: "geom-ctl-label" }, "Button"),
      );
      return h(
        "div",
        { class: "geom-spec-line" + (isKit ? " is-kit" : ""), "data-cell": name, "aria-current": isKit ? "true" : undefined, style: isKit ? "border-color:var(--accent)" : undefined },
        h(
          "div",
          { class: "geom-spec-meta" },
          h("code", { class: "geom-spec-token" }, name),
          isKit ? h("b", { class: "geom-spec-kit" }, "kit") : false,
          h("span", { class: "geom-spec-dims" }, `${c.height}h`),
          h("span", { class: "geom-spec-dims" }, `inset ${c.inset}`),
          h("span", { class: "geom-spec-dims" }, `text ${c.text}`),
          h("span", { class: "geom-spec-dims" }, `icon ${c.icon}`),
          h("span", { class: "geom-spec-dims" }, `r ${num(c.radiusControl)}`),
        ),
        h("div", { class: "geom-spec-render" }, box),
      );
    };
    const rows = cellRows(scale);
    const count = rows.reduce((n, [, names]) => n + names.length, 0);
    const ladderRow = (entries, swatch) =>
      h("div", { class: "geom-scale-row" }, ...entries.map(swatch));
    return h(
      "div",
      { class: "geom-spec" },
      h("div", { class: "geom-spec-head" }, h("b", {}, `${TIER_LABEL[scale.tier]} · ${scale.scale}`), h("small", {}, `kit ${kit} · ${scale.cell.height}px · ${scale.radius} radius · ${count} cells`)),
      h("p", { class: "geom-spec-note" }, "The Maison ladder: 27 cells (tier × scale × size), each one row of a single fixed table. Every glyph centers in a square icon box, so inset = (height − icon)/2; the cells are looked up, not authored."),
      h("p", { class: "geom-shared-note" }, icon("type"), h("span", {}, ["Text size (", h("b", {}, "text"), ") per cell composes from Typography's height-indexed UI text table, one row per control height, so control text per height is one table, never two."])),
      h(
        "div",
        { class: "geom-spec-group" },
        h("div", { class: "geom-spec-grouphead" }, h("b", {}, "Controls"), h("small", {}, "tier × scale rows · size sm · md · lg"), h("span", { class: "geom-spec-count" }, `${count} cells`)),
        // the row grid is inline (three equal columns, one per size) so the section owns its own layout.
        ...rows.map(([row, names]) => h("div", { class: "geom-spec-row", "data-row": row, style: "display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px" }, ...names.map(ctlLine))),
      ),
      h(
        "div",
        { class: "geom-spec-group" },
        h("div", { class: "geom-spec-grouphead" }, h("b", {}, "Radius"), h("small", {}, "the container corner ladder"), h("span", { class: "geom-spec-count" }, `${Object.keys(scale.radii).length} steps`)),
        ladderRow(Object.entries(scale.radii), ([k, v]) =>
          h("span", { class: "geom-chip" }, h("span", { class: "geom-radius-swatch", style: `border-radius:${Math.min(v, 24)}px` }), `${k} ${v === 9999 ? "pill" : v}`)),
      ),
      h(
        "div",
        { class: "geom-spec-group" },
        h("div", { class: "geom-spec-grouphead" }, h("b", {}, "Space"), h("small", {}, `${scale.spaceBase}px base`), h("span", { class: "geom-spec-count" }, `${Object.keys(scale.space).length} steps`)),
        ladderRow(Object.entries(scale.space), ([k, v]) =>
          h("span", { class: "geom-chip", title: `--space-${k}: ${v}px` }, h("span", { class: "geom-space-bar", style: `width:${Math.max(1, v)}px` }), `${v}`)),
      ),
    );
  }


  // ── Geometry analysis (left rail, READ-ONLY) ──────────────────────────────────────────
  // The geometry analog of analysisCards(): diagrams of the resolved dimensional system, pure functions
  // of geometryScale(doc), no inputs. Reuses .an-card / .an-svg / legend(). `view` is accepted for dispatch
  // parity but unused (geometry is doc-driven, not palette-view-driven).
  geomAnalysisCards(view) {
    const scale = this._activeGeomScale();
    const card = (label, body) => h("div", { class: "an-card" }, h("div", { class: "an-label" }, label), body);
    return [
      card("Centering law: inset = ½(height − icon)", this.graphGeomCentering(scale)),
      card("Ladder: icon & text vs height", this.graphGeomPower(scale)),
      card("Tier ladders: height per scale × size", this.graphGeomBands(scale)),
      card("Text ← Typography UI text table", this.graphGeomComposition(scale)),
    ];
  }


  // the centering law, drawn: a square CELL (side = control height) with the glyph centred in it; the equal
  // gaps either side ARE the cell's inset ½(height − icon). Numbers are the kit default cell's real px.
  graphGeomCentering(scale) {
    const { name, size: s } = mdAnchor(scale);
    if (!s) return h("div", { class: "an-empty" }, "n/a");
    const W = 244, H = 116, side = 80;
    const x0 = (W - side) / 2, y0 = (H - side) / 2;
    const g = side * (s.icon / s.height); // glyph drawn proportional to icon/height
    const gx = x0 + (side - g) / 2, gy = y0 + (side - g) / 2;
    const svg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <rect class="gc-cell" x="${x0}" y="${y0}" width="${side}" height="${side}" rx="2"/>
        <rect class="gc-glyph" x="${gx.toFixed(1)}" y="${gy.toFixed(1)}" width="${g.toFixed(1)}" height="${g.toFixed(1)}" rx="2"/>
        <line class="gc-pad" x1="${x0}" y1="${gy.toFixed(1)}" x2="${gx.toFixed(1)}" y2="${gy.toFixed(1)}"/>
        <line class="gc-pad" x1="${(gx + g).toFixed(1)}" y1="${(gy + g).toFixed(1)}" x2="${(x0 + side).toFixed(1)}" y2="${(gy + g).toFixed(1)}"/>
      </svg>`;
    // the caption reads the cell's own inset (the ladder row's), which equals ½(height − icon) on every row.
    return h(
      "div",
      {},
      h("div", { class: "an-svg", html: svg }),
      h("div", { class: "geom-an-cap" }, `${name} · cell ${s.height} · icon ${s.icon} · inset ½(${s.height}−${s.icon}) = ${s.inset}`),
    );
  }


  // icon & text vs control height across the ladder's distinct cell heights (15 of them over the 27 cells),
  // ascending, against the faint height diagonal. fill:none on the lines. The empty check runs before any
  // cell read, so a scale with no cells renders "n/a".
  graphGeomPower(scale) {
    const names = orderedSizeNames(scale);
    if (!names.length) return h("div", { class: "an-empty" }, "n/a");
    const byHeight = new Map();
    for (const n of names) byHeight.set(scale.cells[n].height, scale.cells[n]);
    const rows = [...byHeight.values()].sort((a, b) => a.height - b.height);
    const W = 244, H = 132, pad = 26;
    const maxH = Math.max(...rows.map((s) => s.height)) * 1.05;
    const maxV = Math.max(...rows.map((s) => Math.max(s.icon, s.text, s.height))) * 1.05;
    const X = (hh) => pad + (hh / maxH) * (W - pad - 8);
    const Y = (v) => (H - pad + 8) - (v / maxV) * (H - pad - 8);
    const path = (key) => "M" + rows.map((s) => `${X(s.height).toFixed(1)},${Y(s[key]).toFixed(1)}`).join(" L");
    const dots = (key, cls) => rows.map((s) => `<circle class="${cls}" cx="${X(s.height).toFixed(1)}" cy="${Y(s[key]).toFixed(1)}" r="1.8"/>`).join("");
    const svg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <line class="lc-axis" x1="${pad}" y1="8" x2="${pad}" y2="${H - pad + 8}"/>
        <line class="lc-axis" x1="${pad}" y1="${H - pad + 8}" x2="${W - 6}" y2="${H - pad + 8}"/>
        <path class="gp-ref" d="${path("height")}"/>
        <path class="gp-icon" d="${path("icon")}"/>${dots("icon", "gp-dot gp-dot-icon")}
        <path class="gp-font" d="${path("text")}"/>${dots("text", "gp-dot gp-dot-font")}
        <text x="2" y="14">px</text>
        <text x="${W - 44}" y="${H - pad + 18}">height→</text>
      </svg>`;
    return h(
      "div",
      {},
      h("div", { class: "an-svg", html: svg }),
      this.legend([{ mark: "gp ref", label: "height" }, { mark: "gp icon", label: "icon (ladder row)" }, { mark: "gp font", label: "text (UI text table)" }]),
    );
  }


  // control height per cell for each tier: the nine (scale, size) cells sm-sm … lg-lg on the x axis, one
  // line per tier (the kit's tier solid with dots, the other two dashed), so the three tier ladders and
  // where the kit sits on them read at a glance. fill:none on the lines.
  graphGeomBands(scale) {
    const names = orderedSizeNames(scale);
    const tiers = Object.keys(TIERS).map((t) => [t, names.filter((n) => n.startsWith(t + "-"))]).filter(([, ns]) => ns.length > 1);
    if (!tiers.length) return h("div", { class: "an-empty" }, "n/a");
    const W = 244, H = 124, pad = 26;
    const maxH = Math.max(...names.map((n) => scale.cells[n].height)) * 1.05;
    const X = (i, len) => pad + (i / (len - 1)) * (W - pad - 8);
    const Y = (hh) => (H - pad + 8) - (hh / maxH) * (H - pad - 8);
    const line = ([t, ns]) => {
      const d = "M" + ns.map((n, i) => `${X(i, ns.length).toFixed(1)},${Y(scale.cells[n].height).toFixed(1)}`).join(" L");
      if (t !== scale.tier) return `<path class="gp-ref" d="${d}"/>`;
      const dots = ns.map((n, i) => `<circle class="gp-dot gp-dot-font" cx="${X(i, ns.length).toFixed(1)}" cy="${Y(scale.cells[n].height).toFixed(1)}" r="1.9"/>`).join("");
      return `<path class="gp-font" d="${d}"/>${dots}`;
    };
    const svg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <line class="lc-axis" x1="${pad}" y1="8" x2="${pad}" y2="${H - pad + 8}"/>
        <line class="lc-axis" x1="${pad}" y1="${H - pad + 8}" x2="${W - 6}" y2="${H - pad + 8}"/>
        ${tiers.map(line).join("")}
        <text x="2" y="14">px</text>
        <text x="${W - 62}" y="${H - pad + 18}">sm-sm→lg-lg</text>
      </svg>`;
    return h("div", { class: "an-svg", html: svg });
  }


  // the composition link: each cell's text IS Typography's UI text at the cell's height. Lists the kit
  // tier's nine cells with their text and chip text.
  graphGeomComposition(scale) {
    const names = orderedSizeNames(scale).filter((n) => n.startsWith(scale.tier + "-"));
    return h(
      "div",
      { class: "geom-comp" },
      h("p", { class: "geom-comp-note" }, "Each cell's text composes from Typography's height-indexed UI text table (the UI-control voice reads the same table at 32px); the chip text is the compact row's."),
      h(
        "div",
        { class: "geom-comp-rows" },
        ...names.map((n) => {
          const s = scale.cells[n];
          return h("div", { class: "geom-comp-row" }, h("span", { class: "geom-comp-k" }, n.slice(scale.tier.length + 1)), h("span", { class: "geom-comp-v" }, `text ${s.text}`), h("span", { class: "geom-comp-v dim" }, `${s.height}h · chip ${s.chipText}`));
        }),
      ),
    );
  }


  // ── Geometry inspector (right pane) ───────────────────────────────────────────
  // The geometry analog of renderTypeInspector: a .pane-head segmented tablist + a scrollable .seg-body + a
  // pinned .seg-example live control. Binds to doc.geometry = { tier, scale, radius, spaceBase } (the kit
  // axes the engine + persist carry) and each breakpoint mode's `scale`.
  renderGeomInspector(view) {
    const seg = this.geomSegment === "radius" || this.geomSegment === "space" ? this.geomSegment : "ramp";
    const body = seg === "radius" ? this.geomRadiusTab() : seg === "space" ? this.geomSpaceTab() : this.geomRampTab();
    const tabs = [{ id: "ramp", label: "Ladder" }, { id: "radius", label: "Radius" }, { id: "space", label: "Space" }];
    return h(
      "aside",
      { class: "right-pane" },
      h("div", { class: "pane-head" },
        this.panesRight ? this.paneToggle("right") : false,
        this.segmented(tabs, seg, (id) => { this.geomSegment = id; this.render(); }, { ariaLabel: "Geometry inspector", idPrefix: "gtab", controls: "gi-panel" })),
      h("div", { class: "seg-body", role: "tabpanel", id: "gi-panel", "aria-labelledby": "gtab-" + seg }, body),
      h("div", { class: "seg-example" }, ...this.exampleSchemes(() => [this.geomExampleCard(view)])),
    );
  }


  // geomRampTab, the WRITABLE kit axes (tier · scale · radius through the Pro-gated _pickGeomAxis, the
  // space base), the active breakpoint's scale, then a READ-ONLY summary of the kit tier's nine cells.
  geomRampTab() {
    const cfg = this.doc.geometry || DEFAULT_GEOMETRY;
    const scale = this._activeGeomScale();
    const axisSelect = (key, label, ids, names) => field(label, h(
      "select",
      { "data-fk": "gi:" + key, onchange: (e) => this._pickGeomAxis(key, e.target.value) },
      ...ids.map((id) => h("option", { value: id, selected: (cfg[key] || DEFAULT_GEOMETRY[key]) === id ? true : undefined }, this._treatmentLocked(id, DEFAULT_GEOMETRY[key]) ? names[id] + " · Pro" : names[id])),
    ));
    const kitRows = orderedSizeNames(scale).filter((n) => n.startsWith(scale.tier + "-"));
    return h(
      "div",
      { class: "insp-body" },
      h("h3", { class: "insp-title" }, icon("ruler"), "Control ladder"),
      h("div", { class: "insp-sub" }, "Pick a tier, scale and radius: every cell's height, inset, text and icon read one fixed ladder, and the kit default is the tier and scale at size md."),
      axisSelect("tier", "Tier", Object.keys(TIERS), TIER_LABEL),
      axisSelect("scale", "Scale", SCALES, SCALE_LABEL),
      axisSelect("radius", "Radius", Object.keys(RADIUS_MODES), RADIUS_LABEL),
      field("Space base", this.segmented(SPACE_BASES.map((n) => ({ id: String(n), label: n + "px" })), String(cfg.spaceBase || DEFAULT_GEOMETRY.spaceBase), (id) => this._setGeomSpaceBase(id),
        { role: "group", ariaLabel: "Space base", idPrefix: "gi-space" })),
      this._geomModeEditor(),
      h(
        "div",
        { class: "geom-lad" },
        ...kitRows.map((n) => {
          const c = scale.cells[n];
          return h(
            "div",
            { class: "geom-lad-row", "data-cell": n, style: n === scale.cell.name ? "border-color:var(--accent)" : undefined },
            h("span", { class: "geom-lad-k" }, n),
            h("span", { class: "geom-lad-v" }, `${c.height}h · inset ${c.inset} · text ${c.text} · icon ${c.icon}`),
          );
        }),
      ),
      h("p", { class: "insp-sub tyi-future" }, "Text size per cell composes from Typography's height-indexed UI text table; in Figma the cells live in the Geometry collection as size/{cell}/{field} variables."),
    );
  }


  // geomRadiusTab, the kit's radius mode on its default cell (control · mark · inset · card) and the
  // container corner ladder (the fixed M3 scale, read-only).
  geomRadiusTab() {
    const scale = this._activeGeomScale();
    const k = RADIUS_MODES[scale.radius] || RADIUS_MODES[DEFAULT_GEOMETRY.radius];
    const c = scale.cell;
    const roles = [["control", c.radiusControl], ["mark", c.radiusMark], ["inset", c.radiusInset], ["card", c.radiusCard]];
    return h(
      "div",
      { class: "insp-body" },
      h("h3", { class: "insp-title" }, icon("ruler"), "Radius"),
      h("div", { class: "insp-sub" }, `The ${RADIUS_LABEL[scale.radius] || scale.radius} radius mode: control corner = text × ${k.text} + height × ${k.height}; mark, inset and card derive from it. Shown on the kit cell ${c.name}.`),
      h(
        "div",
        { class: "geom-lad" },
        ...roles.map(([r, v]) =>
          h(
            "div",
            { class: "geom-lad-row" },
            h("span", { class: "geom-radius-swatch", style: `border-radius:${Math.min(v, 18)}px` }),
            h("span", { class: "geom-lad-k" }, `--radius-${r}`),
            h("span", { class: "geom-lad-v" }, `${num(v)}px`),
          ),
        ),
      ),
      h(
        "div",
        { class: "geom-lad" },
        ...Object.entries(scale.radii).map(([key, v]) =>
          h(
            "div",
            { class: "geom-lad-row" },
            h("span", { class: "geom-radius-swatch", style: `border-radius:${v === 9999 ? 18 : Math.min(v, 18)}px` }),
            h("span", { class: "geom-lad-k" }, key),
            h("span", { class: "geom-lad-v" }, v === 9999 ? "pill" : `${v}px`),
          ),
        ),
      ),
      h("p", { class: "insp-sub tyi-future" }, "The container corner ladder is the fixed M3 shape scale; the radius mode sets only the control-linked corners."),    );
  }


  // geomSpaceTab, the layout-spacing scale (--space-*): the rhythm BETWEEN components (gutters, gaps,
  // section rhythm), a separate concern from the in-control inset the centering law governs.
  geomSpaceTab() {
    const scale = this._activeGeomScale();
    const maxV = Math.max(1, ...Object.values(scale.space));
    return h(
      "div",
      { class: "insp-body" },
      h("h3", { class: "insp-title" }, icon("ruler"), "Space scale"),
      h("div", { class: "insp-sub" }, `Layout rhythm in ${scale.spaceBase}px multiples, the space between components, not the inset inside one.`),
      h(
        "div",
        { class: "geom-lad" },
        ...Object.entries(scale.space).map(([k, v]) =>
          h(
            "div",
            { class: "geom-lad-row" },
            h("span", { class: "geom-lad-k" }, `--space-${k}`),
            h("span", { class: "geom-space-track" }, h("span", { class: "geom-space-fill", style: `width:${Math.round((v / maxV) * 100)}%` })),
            h("span", { class: "geom-lad-v" }, `${v}px`),
          ),
        ),
      ),    );
  }


  // _geomPaletteColors(view), the SELECTED palette's resolved roles, ready to paint a mock control:
  // surface/onSurface (the card ground) + the palette's own prime/on-prime (a "primary button" look).
  // Shared by geomExampleCard and the canvas ladder's ctlLine so every mock control, canvas or inspector,
  // reflects the actual palette being designed, not a generic fallback accent.
  _geomPaletteColors(view) {
    const p = view.palettes[this.selectedIndex()];
    const roles = (p && p.roles) || [];
    const dark = this.resolvedCanvasScheme() === "dark";
    const sl = slug((p && p.name) || "");
    const byKey = {};
    for (const r of roles) byKey[r.key] = r;
    const pick = (role) => (role ? (dark ? role.darkHex : role.lightHex) : "transparent");
    const main = roles.find((r) => r.suffix === "");
    const onMain = roles.find((r) => r.suffix === "-on-" + sl);
    return { pick, byKey, main, onMain };
  }

  // geomExampleCard, the pinned live card: a few real controls (Button · Chip · Input) built from the kit
  // default cell AND painted in the SELECTED palette's roles. Mirrors typeExampleCard's resolution. The
  // chip reads the cell's chip fields (the compact row).
  geomExampleCard(view) {
    const scale = this._activeGeomScale();
    const { name, size: s } = mdAnchor(scale);
    if (!s) return h("div", { class: "example-card" });
    const { pick, byKey, main, onMain } = this._geomPaletteColors(view);
    return h(
      "div",
      { class: "example-card geom-example", style: "background:" + pick(byKey.surface) },
      h("div", { class: "geom-ex-title", style: "color:" + pick(byKey.onSurface) }, `${name} · ${s.height}px control`),
      h(
        "div",
        { class: "geom-ex-row" },
        h(
          "button",
          {
            class: "geom-ex-ctl",
            tabindex: "-1",
            style: `background:${pick(main)};color:${pick(onMain)};height:${s.height}px;font-size:${s.text}px;gap:${s.inset / 2}px;padding-inline:${s.inset}px;border-radius:${num(s.radiusControl)}px`,
          },
          h("span", { class: "geom-ex-glyph", style: `width:${s.icon}px;height:${s.icon}px` }),
          "Button",
        ),
        // Chip, a smaller, lower-emphasis affordance on the cell's chip fields: containerHigh, a
        // visible-but-quieter tint of the palette's own hue rather than its full-strength prime.
        h(
          "span",
          {
            class: "geom-ex-chip",
            style: `background:${pick(byKey.containerHigh)};color:${pick(byKey.onSurface)};height:${s.chipHeight}px;font-size:${s.chipText}px;gap:${s.chipInset}px;padding-inline:${s.chipInset}px;border-radius:${num(Math.min(s.radiusControl, s.chipHeight / 2))}px`,
          },
          "Chip",
          h("span", { class: "geom-ex-chip-x", style: `width:${s.chipText}px;height:${s.chipText}px` }, icon("x", { size: s.chipText })),
        ),
        // Input, an outlined field (never filled with the prime color; a field's own ground is surface).
        // outlineVariant matches how this app's own shadcn export maps an input border (exports.js);
        // placeholder is the role built specifically for this exact text archetype (semantic.js).
        h(
          "span",
          {
            class: "geom-ex-input",
            style: `border-color:${pick(byKey.outlineVariant)};color:${pick(byKey.placeholder)};height:${s.height}px;font-size:${s.text}px;padding-inline:${s.inset}px;border-radius:${num(s.radiusControl)}px`,
          },
          "Search…",
        ),
      ),
    );
  }
}
export const GeomSection = GeomSectionImpl;
