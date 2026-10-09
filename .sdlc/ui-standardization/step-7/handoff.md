## Task goal
The editor shell is one standardized UI: a single text-role system, one inset and radius composition rule for every container, one anatomy table for every control, one glyph motion set, all derived from the Maison ladder cell, with the shell defaulting to the product tier, sm scale, md size.

## Step 7: Typography and Geometry section text onto the roles
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
### Do
Depends on: step 6. Edits only `src/ui/styles.css` (rules whose selector contains a `"step-7"` needle of `test/repo/shell-text.mjs`, never `.geom-ex-`, `.geom-ctl`, `.geom-glyph`, `.geom-caret`, `.tyi-voice-name` or `.tyi-font-input`), that gate's pending list, and doc cites.
1. The rewrite. A rule's literal size, weight, line-height, tracking, case or `font` becomes:
   `font: var(--ui-<role>-font); letter-spacing: var(--ui-<role>-tracking); text-transform: var(--ui-<role>-case);`
   plus `color: var(--ui-<role>-ink)`, unless the rule keeps a state color. Further rules:
   - A rule with `font-variant-numeric` re-declares it after the shorthand.
   - A rule that sets only a weight uses a token: 400 is `var(--ui-weight-regular)`, 500 and 550 `var(--ui-weight-medium)`, 600 and 650 `var(--ui-weight-strong)`, 700 `var(--ui-weight-heavy)`.
   - Layout `gap`, `padding` and `margin` stay.
2. Roles named by the architect's table and this step (binding):
   - pane-title: `.type-spec-head b`, `.geom-spec-head b`.
   - kicker: `.typo-cat-head b`, `.type-spec-grouphead b`, `.geom-spec-grouphead b`.
   - label: `.tyi-font-role`.
   - control: `.geom-select` (a shell select).
   - helper: `.type-spec-note`, `.geom-spec-note`.
   - code: `.type-spec-token`, `.geom-spec-token`, `.geom-lad-k`, `.geom-lad-v`.
   - badge: `.geom-chip` (a badge by the user's ruling).
3. Fallback for a selector the list does not name (first match wins):
   1. The rule uppercases: kicker.
   2. It sets a monospace family, or names `code`, `pre` or `-token`: code.
   3. It names `h3` or ends in `-title` or `-head b`, and today's size is 14px or more: pane-title.
   4. It names `b`, `strong`, `th`, `-name`, `-title` or `-head`, with weight 600 or more: element-title.
   5. It names `label`, `dt`, `-label` or `-role`: label.
   6. It is a `button`, `select` or `input`: control.
   7. Today's size is 12.5px or more: body.
   8. Anything else: helper.
4. Remove the `"step-7"` key from `PENDING` in `test/repo/shell-text.mjs`.
5. The inline literals in `src/ui/sections/typography.js` (:539, :830, :1031) and `src/ui/sections/geometry.js` (:375, :413, :737) are specimens or measurement probes painted at a kit cell. Leave them; this step does not touch section JS.
6. Citations: repair every STALE `styles.css:N` cite in `docs/references/component-inventory.md` and `docs/specs/app-shell.md` by number.
7. Run the criteria below, plus `node test/repo/shell-text.mjs`.
### Acceptance criteria
- (red) `node -e 'const a=JSON.parse(process.argv[1]);const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[];const w=(f,t)=>{let i=f;while(i<t){const o=c.indexOf("{",i);if(o<0||o>=t)break;const p=c.slice(i,o).trim();let d=1,j=o+1;while(j<t&&d>0){if(c[j]=="{")d++;else if(c[j]=="}")d--;j++}if(p[0]=="@"){if(!p.startsWith("@keyframes"))w(o+1,j-1)}else R.push([p.split(",").map((s)=>s.trim().replace(/\s+/g," ")),c.slice(o+1,j-1)]);i=j}};w(0,c.length);const lit=(p,v)=>!/var\(/.test(v)&&(p=="font"||p=="font-size"&&/[1-9]/.test(v)||p=="font-weight"&&/^[1-9]/.test(v)||p=="letter-spacing"&&/[1-9]/.test(v)||p=="text-transform"&&!/^(none|inherit|capitalize)$/.test(v)||p=="line-height"&&!/^(1|normal|inherit|0)$/.test(v));const inF=(s)=>a.F.some((f)=>s.includes(f))&&!a.X.some((x)=>s.includes(x));const bad=[];for(const[L,b]of R){if(!L.some(inF))continue;for(const d of b.split(";")){const k=d.indexOf(":");if(k<0)continue;const p=d.slice(0,k).trim(),v=d.slice(k+1).trim().replace(/\s*!important$/,"");if(lit(p,v))bad.push(L.join(", ")+" | "+p+": "+v)}}const role=(s)=>{const m=R.filter(([L])=>L.includes(s)).map((r)=>r[1]).join(";").match(/(^|[;\s])font\s*:\s*var\(--ui-([a-z-]+)-font\)/);return m?m[2]:null};for(const[s,r]of Object.entries(a.M))if(role(s)!==r)bad.push(s+" reads "+role(s)+", want "+r);bad.slice(0,4).forEach((x)=>console.log(x));console.log(bad.length+" off");process.exit(bad.length?1:0)' '{"F":[".typo-",".type-spec-",".ty-role",".tyi-",".geom-"],"X":[".geom-ex-",".geom-ctl",".geom-glyph",".geom-caret",".tyi-voice-name",".tyi-font-input"],"M":{".type-spec-head b":"pane-title",".geom-spec-head b":"pane-title",".type-spec-grouphead b":"kicker",".geom-spec-grouphead b":"kicker",".typo-cat-head b":"kicker",".type-spec-token":"code",".geom-spec-token":"code",".geom-lad-k":"code",".type-spec-note":"helper",".geom-spec-note":"helper",".tyi-font-role":"label",".geom-chip":"badge",".geom-select":"control"}}'`
- `node test/repo/shell-text.mjs && ! grep -qF '"step-7"' test/repo/shell-text.mjs`
- (guard) `node test/repo/ui-polish.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/app.js src/ui/app-helpers.mjs src/ui/sections src/ui/overlays src/ui/icons.js test/ui test/smoke scripts .claude/skills)$(git ls-files --others --exclude-standard -- src/ui/sections src/ui/overlays test/ui test/smoke scripts)"`
