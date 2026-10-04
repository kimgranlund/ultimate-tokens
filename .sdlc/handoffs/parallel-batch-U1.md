# Handoff U1 pass 1 · builder to verifier

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/parallel-batch.md` U1 (#748 item 1, #796 marketing lines), criteria C1.1 to C1.5 |
| Branch | unit/pb-U1 @ 46e04538 (content), this handoff in the next commit |
| Base | plan/parallel-batch @ 61bcd123 |
| Files at 46e04538 | `docs/marketing/store-copy.md` (every swept line reread, 60 sentence edits including 3 stale section cross-references and one typo) · `docs/marketing/web/landing.md` (14 lines polished, incl. both CTA rows and the voice count) · `docs/marketing/product/claude-plugin.md` (:19 and :60, eleven to 15, both `fix-old-names: keep` markers kept) · `docs/marketing/product/boilerplate.md` (:38, eleven to 15) |
| Files in this handoff commit | `.sdlc/handoffs/parallel-batch-U1.md` |
| Ran | the `~~~sh ran` block at 46e04538 in `.worktrees/pb-U1` with this handoff file present, output pasted unedited as `~~~out ran`. At the handoff commit, line 1 prints that commit's sha instead; every other line is the same, since the handoff commit adds only this file. `npm test` at 46e04538: `✓ all 54 test files passed`, exit 0, `git status --short` empty after (load check printed 2 before the run) |
| Left out | no build, no smoke (docs only, no bundled file). #748 item 2 (the Lemon Squeezy dashboard walk of `store-copy.md` §10 and the R37 name re-paste) is the owner's, per plan section 7 |
| Fact sheet | no edit: the `Type voices` row already pins **15** (`docs/marketing/fact-sheet.md:22`) |

## Method

The swept lines are the `+` lines of `git show 37b04676 -- docs/marketing/store-copy.md docs/marketing/web/landing.md` (the em dash sweep, #730) plus the bold-label colon pass `1ba47350` (#763). Each was read against `docs/marketing/voice/voice-platform.md` §4 (posture by surface) and §5 (language rules). The sweep's comma rule produced three recurring defects, each with one repair: a comma splice takes a semicolon, colon or full stop; a comma-joined appositive list (`system, 53 semantic roles, a type scale, a geometry ramp, and exports`) takes parentheses; the `(Ultimate Tokens)` sign-off becomes a plain sign-off line. While on those lines, three copy-desk deviations were fixed (`two brand kits` to `2 brand kits`, `$39 a year` to `$39/year`, `colour` to `color`, `light and dark` as modes to `Light and Dark`, `five treatments` to `5 treatments`).

Two edits sit outside the swept lines, both in lane: the two landing CTA rows (`landing.md:24`, `:85`) still carried the glyph inside code spans, which the gate exempts but which are button text, not code; and three section cross-references in `store-copy.md` pointed at the wrong section (`§5` for the Studio email in §6, `§6` for discounts in §5, `§4.2` for the Studio deep-link in §4.1).

## Rubric verdict per swept line

Line numbers are at the base 61bcd123.

| Lines | Verdict | Reason |
|---|---|---|
| store-copy `:1`, `:50`, `:112`, `:166`, `:196`, `:313`, `:333`, `:356`, `:382`, `:413`, `:450`, `:579` (headings) | kept | `Title: object` reads as a label; nothing mechanical |
| store-copy `:52`, `:58`, `:66`, `:75`, `:81`, `:87`, `:93`, `:99`, `:123`, `:129`, `:177`, `:182`, `:375`, `:417`, `:424`, `:428`, `:431`, `:435`, `:452`, `:464`, `:488`, `:505`, `:518`, `:540`, `:549`, `:558`, `:568`, `:581`, `:586`, `:595`, `:632` | kept | #763 already moved these bold labels to a colon; it reads as the house label form |
| store-copy `:27`, `:28`, `:154`, `:155`, `:157`, `:189`, `:190`, `:206`, `:208`, `:210` to `:214`, `:642` to `:657` (bullets, numbered checklist) | kept | label-colon bullets; the interpunct rows inside them are protected |
| store-copy `:30` | kept | #763's `to replace before publishing` reads plainly |
| store-copy `:7`, `:84`, `:126`, `:138`, `:148`, `:262`, `:393`, `:425`, `:584` | kept | the comma now opens a true appositive or aside; it reads as written |
| store-copy `:21`, `:22`, `:228`, `:230` (`none` cells) | kept | a value in a table cell, reads correctly |
| store-copy `:78` (storefront tagline) | kept | the comma carries the beat the dash did; the same line is canonical at `boilerplate.md:10` and `landing.md:90`, so a change would move three surfaces for no gain |
| store-copy `:117`, `:171` | kept | R37 product names |
| store-copy `:131` | kept | the canonical thesis line, platform §5 casing and punctuation |
| store-copy `:259` | kept | `No, the Figma plugin is free` is natural speech |
| store-copy `:389`, `:390` | kept | internal schema notes; the comma reads fine there |
| store-copy `:611` | kept | must match the shipped `src/ui/overlays/settings.js:395` string, which is outside this lane |
| store-copy `:11`, `:35`, `:41`, `:44`, `:109`, `:163`, `:198`, `:242`, `:256`, `:276`, `:309`, `:327`, `:365`, `:398`, `:403`, `:516`, `:556`, `:566`, `:575`, `:590`, `:605`, `:628` | polished | comma splice: two clauses joined by the comma the sweep left; now a semicolon, colon or full stop (or `so` at `:628`) |
| store-copy `:101`, `:140`/`:141`, `:146`, `:185`/`:186`, `:269`, `:280`/`:281`, `:350`, `:536`/`:537` | polished | comma-joined appositive list read as a run-on series; now parentheses or a colon |
| store-copy `:19`, `:20`, `:24`, `:90`, `:396`, `:401`, `:407` | polished | `Product, Pro` and `Pro, product_options` read as a list, not a label; now `Pro product`, a colon or an interpunct |
| store-copy `:134`, `:179`, `:323`, `:343`, `:462`, `:495`, `:509`, `:547`, `:623` | polished | the dash introduced an elaboration; a colon does that job, a comma made it a list |
| store-copy `:152`, `:160`, `:481`, `:614` | polished | `2 brand kits` and `$39/year` per copy-desk; `with` restores the participle the dash implied |
| store-copy `:371` | polished | `Subscribe, $39/year` became `Subscribe ($39/year)`, the price stated plainly and matching the landing CTA row |
| store-copy `:399`, `:405`, `:486` | polished | the `(Ultimate Tokens)` sign-off reads like a citation; a plain sign-off line is what §4's email row describes |
| store-copy `:503` | polished | `Just reply, {{SUPPORT_EMAIL}}` was ambiguous (reply to whom); now `Reply to this email or write to` |
| store-copy `:525` to `:527` | polished | numbered bold imperative, then a full sentence |
| landing `:15`, `:26`, `:77`, `:90` | kept | H1 thesis variant, the honesty aside, a colon label, the canonical tagline |
| landing `:6`, `:20`/`:21`, `:32`, `:34`, `:41`, `:51`, `:52`, `:59`, `:60`, `:79`, `:81` | polished | same three defects as above; `:41` also carries #796's count (15 voices, `from display to fine print` to match the fact sheet's first voice); `:52` now states the thesis in its truthful form, `can't drift from each other` |
| landing `:24`, `:85` (not swept) | polished | code-span CTAs carried the glyph; now the parenthetical form, `Open the app (it's free)`, `Get Pro ($39/year)` |

## §6 rubric scores

| Piece | One idea | Voice fidelity | Claim discipline | Density | Surface fit | Reader respect |
|---|---|---|---|---|---|---|
| `store-copy.md` product pages, checkout, emails, policies | 4 | 4 | 5 | 4 | 4 | 5 |
| `web/landing.md` | 5 | 4 | 5 | 4 | 5 | 5 |

Every axis is at 4 or above. The 4s are on long-standing text this unit didn't rewrite. On One idea, the Pro page argues both the thesis and the practice (`### What Pro unlocks`). On Voice fidelity, `perfectly in sync` at store-copy `:85` is a booth phrase. On Density, the store-copy FAQ answer `What can I export?` repeats the long body. Layer 1: `voice-check.mjs` exits 0 on all four files with no warnings (see the `ran` block).

## Claims

| Claim | Needle | Anchor | Kind |
|---|---|---|---|
| the store-copy intro gates every edit in its own sentence | `Gate every edit with the` | `docs/marketing/store-copy.md` | present |
| the object table labels the Pro product as a label, not a list | `Pro product` | `docs/marketing/store-copy.md` | present |
| no object-table row reads `Product, <tier>` | `Product, ` | `docs/marketing/store-copy.md` | absent |
| the locked decisions name the two tiers after a colon | `two tiers: Pro (single user)` | `docs/marketing/store-copy.md` | present |
| the support-channel decision reads as a dated ruling | `(decided 2026-07-09: there is no support inbox` | `docs/marketing/store-copy.md` | present |
| the support-channel typo is fixed | `public on purpose;` | `docs/marketing/store-copy.md` | present |
| the seat-enforcement note explains the flow after a colon | `(instance) flow: each device consumes one seat` | `docs/marketing/store-copy.md` | present |
| the tier-enforcement note splits into two sentences | `being published. The` | `docs/marketing/store-copy.md` | present |
| the SEO meta title uses the house separator | `Ultimate Tokens · Perceptual design-token generator` | `docs/marketing/store-copy.md` | present |
| the social card lists the three systems after a colon | `Three composing systems: color, type, geometry.` | `docs/marketing/store-copy.md` | present |
| the products note joins its clauses with a semicolon | `(the product-page body); LS has no separate` | `docs/marketing/store-copy.md` | present |
| the Pro body introduces the measured claim with a colon | `from the same source: every step measured` | `docs/marketing/store-copy.md` | present |
| the Figma variables aside is parenthesized | `(Color Primitives and Color Roles, aliased` | `docs/marketing/store-copy.md` | present |
| the design-system contents are parenthesized | `preview cards), in a target each` | `docs/marketing/store-copy.md` | present |
| the Free tier count is in digits | `the full generator and 2 brand kits` | `docs/marketing/store-copy.md` | present |
| the Pro price line reads `with every update` | `per user, with every update and customer support included` | `docs/marketing/store-copy.md` | present |
| no line joins `every update and customer support` with a bare comma | `, every update and customer support` | `docs/marketing/store-copy.md` | absent |
| the ownership line joins with a semicolon | `your Figma file; nothing leaves your machine` | `docs/marketing/store-copy.md` | present |
| the Studio excerpt states the seat count after a colon | `Pro for your whole team: 5 seats` | `docs/marketing/store-copy.md` | present |
| the Studio body parenthesizes the Pro toolkit | `the full Pro toolkit (unlimited brand kits` | `docs/marketing/store-copy.md` | present |
| the pasteability note explains rich text after a colon | `rich text: the` | `docs/marketing/store-copy.md` | present |
| the comparison table label takes a colon | `Free vs Pro vs Studio: comparison table` | `docs/marketing/store-copy.md` | present |
| the subscription FAQ joins with a semicolon | `Cancel anytime;` | `docs/marketing/store-copy.md` | present |
| the cancel FAQ joins with a semicolon | `stay put; you're simply back` | `docs/marketing/store-copy.md` | present |
| the naming FAQ parenthesizes the systems, in American spelling | `every export (color, type, and geometry)` | `docs/marketing/store-copy.md` | present |
| the plugin FAQ joins with a semicolon | `); it teaches the agent which of the 53` | `docs/marketing/store-copy.md` | present |
| the design-system FAQ answers with a colon | `Yes: export a design system` | `docs/marketing/store-copy.md` | present |
| the design-system FAQ parenthesizes the core | `carrier) lands as a target` | `docs/marketing/store-copy.md` | present |
| the variants note splits into two sentences | `under the product name. This is the text` | `docs/marketing/store-copy.md` | present |
| the Pro variant states the price after a colon | `Ultimate Tokens Pro for one maker:` | `docs/marketing/store-copy.md` | present |
| the Pro variant context note ends its sentence before the direction | `binding constraint for one person.` | `docs/marketing/store-copy.md` | present |
| the Studio variant states the price after a colon | `Ultimate Tokens Pro for a team:` | `docs/marketing/store-copy.md` | present |
| the Studio context points at the email in §6 | `in the Studio email (§6)` | `docs/marketing/store-copy.md` | present |
| the Studio context parenthesizes the spec reference | `Phase 2); the copy above describes` | `docs/marketing/store-copy.md` | present |
| no deep-link points at §4.2, the API checkout | `instead (§4.2)` | `docs/marketing/store-copy.md` | absent |
| the buy-now note joins with a semicolon | `(read-only); the app uses` | `docs/marketing/store-copy.md` | present |
| the Pro buy button states the price in parentheses | `Subscribe (` | `docs/marketing/store-copy.md` | present |
| the Pro receipt-note label no longer reads as a list | `` Pro, `product `` | `docs/marketing/store-copy.md` | absent |
| the Studio receipt-note label no longer reads as a list | `Studio, ` | `docs/marketing/store-copy.md` | absent |
| the Pro receipt note splits after the key location | `Your license key is in your purchase email. Open Ultimate Tokens` | `docs/marketing/store-copy.md` | present |
| the Studio receipt note splits after the key location | `Your team license key is in your purchase email. Each` | `docs/marketing/store-copy.md` | present |
| the Studio receipt note names what each member activates | `member activates it under Settings` | `docs/marketing/store-copy.md` | present |
| no sign-off reads as a parenthetical | `(Ultimate Tokens)` | `docs/marketing/store-copy.md` | absent |
| the checkout_data label takes a colon | `(prefill + pass-through): set` | `docs/marketing/store-copy.md` | present |
| the discount code points at §5, Discounts | `pre-apply a launch code (§5)` | `docs/marketing/store-copy.md` | present |
| the thank-you page introduces what is live with a colon | `That's it: unlimited kits` | `docs/marketing/store-copy.md` | present |
| the Studio welcome states the seats after a colon | `Studio is ready: ` | `docs/marketing/store-copy.md` | present |
| the Studio welcome names where to write | `Reply to this email or write to` | `docs/marketing/store-copy.md` | present |
| the key-delivery subject takes a colon | `Pro key: activate in 30 seconds` | `docs/marketing/store-copy.md` | present |
| the key-delivery body joins with a semicolon | `offline; no key needed there` | `docs/marketing/store-copy.md` | present |
| onboarding step 1 is a full sentence after its bold imperative | `There's no limit anymore` | `docs/marketing/store-copy.md` | present |
| onboarding step 2 is a full sentence after its bold imperative | `Drop the same tokens into CSS` | `docs/marketing/store-copy.md` | present |
| onboarding step 3 is a full sentence after its bold imperative | `It'll build with your exact roles` | `docs/marketing/store-copy.md` | present |
| the lifecycle note parenthesizes the two senders | `Which system sends these (LS` | `docs/marketing/store-copy.md` | present |
| the lifecycle note closes the parenthesis before its verb | `mail) is a deployment decision` | `docs/marketing/store-copy.md` | present |
| the renewal reminder introduces the reassurance with a colon | `do: it'll carry on, with updates` | `docs/marketing/store-copy.md` | present |
| the dunning email splits into two sentences | `to keep Pro. Your kits and settings` | `docs/marketing/store-copy.md` | present |
| the cancellation email splits into two sentences | `account returns to Free. Your saved kits` | `docs/marketing/store-copy.md` | present |
| the ended email joins with a semicolon and the canonical calming word | `here; you're simply back to the Free limits` | `docs/marketing/store-copy.md` | present |
| the license terms split the Studio clause | `reduced per-seat rate. Don't exceed` | `docs/marketing/store-copy.md` | present |
| the in-app section note takes a colon | `Not a Lemon Squeezy surface: these` | `docs/marketing/store-copy.md` | present |
| the upgrade-row description reads `with updates` | `/year, with updates & support` | `docs/marketing/store-copy.md` | present |
| the 2-kit upgrade prompt states price and exit after a colon | `for unlimited kits:` | `docs/marketing/store-copy.md` | present |
| the expired banner joins with `so` | `has ended, so you're back to Free` | `docs/marketing/store-copy.md` | present |
| the landing intro joins with a semicolon | `Structure only; layout belongs` | `docs/marketing/web/landing.md` | present |
| the landing subhead parenthesizes the system's parts | `OKLCH-true system (53 semantic roles` | `docs/marketing/web/landing.md` | present |
| the landing subhead closes the parenthesis before its verb | `a geometry ramp) and exports it` | `docs/marketing/web/landing.md` | present |
| the hero CTA carries no dash | `Open the app (it's free)` | `docs/marketing/web/landing.md` | present |
| the color section introduces OKLCH after a colon | `where human vision is even: OKLCH-native` | `docs/marketing/web/landing.md` | present |
| the color section parenthesizes the role families | `53 semantic roles (surfaces, on-colors` | `docs/marketing/web/landing.md` | present |
| the color section capitalizes the mode names | `resolved for Light and Dark in one pass` | `docs/marketing/web/landing.md` | present |
| the landing type section says 15 voices and 5 treatments | `15 voices from display to fine print, 5 treatments` | `docs/marketing/web/landing.md` | present |
| the exports section names the three AI design tools as the subject | `A design system that Claude` | `docs/marketing/web/landing.md` | present |
| the exports section states the thesis in its truthful form | `in sync; they're derived from one source, so they can't drift from each other` | `docs/marketing/web/landing.md` | present |
| the agents section introduces the guesses after a colon | `all day: a plausible hex` | `docs/marketing/web/landing.md` | present |
| the agents section parenthesizes the MCP clients | `any MCP client (Claude Code, Cursor): a` | `docs/marketing/web/landing.md` | present |
| the Pro pricing line parenthesizes the price | `per user): unlimited kits` | `docs/marketing/web/landing.md` | present |
| the Studio pricing line parenthesizes the price | `/seat/year): Pro for the whole team` | `docs/marketing/web/landing.md` | present |
| the CTA row's free button carries no dash | `Open the app (free)` | `docs/marketing/web/landing.md` | present |
| the CTA row's Pro button states the price in parentheses | `Get Pro (` | `docs/marketing/web/landing.md` | present |
| no landing line carries the old voice count | `eleven` | `docs/marketing/web/landing.md` | absent |
| the plugin description and bullet say 15 voices | `the 15-voice scale, role × level` | `docs/marketing/product/claude-plugin.md` | present |
| no plugin line carries the old voice count | `eleven` | `docs/marketing/product/claude-plugin.md` | absent |
| the boilerplate long paragraph says 15 type voices | `15 type voices on a modular scale` | `docs/marketing/product/boilerplate.md` | present |
| no boilerplate line carries the old voice count | `eleven` | `docs/marketing/product/boilerplate.md` | absent |

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
B=61bcd123; U=46e04538; S=docs/marketing/store-copy.md; L=docs/marketing/web/landing.md; P=docs/marketing/product/claude-plugin.md; Q=docs/marketing/product/boilerplate.md
# C1.1
grep -rn "eleven" docs/marketing | grep -ic voice; git grep -n "eleven" "$B" -- docs/marketing | grep -ic voice
# C1.2
grep -c "fix-old-names: keep" "$P"; git show "$B:$P" | grep -c "fix-old-names: keep"; grep -n "fix-old-names: keep" "$P" | cut -d: -f1 | tr '\n' ' '; echo
# C1.3
node test/repo/em-dash.mjs | tail -1 | sed "s/ (.*//"; node -e 'import("./src/engine/type.mjs").then(m=>console.log(String(Object.keys(m.makeVoices()).length)))'
grep -noE "15[- ](type )?voices?" "$L" "$P" "$Q"
printf 'x \xe2\x80\x94 y\n' >> "$L"; node test/repo/em-dash.mjs > /dev/null 2>&1; echo "exit $?"; node test/repo/em-dash.mjs 2>&1 | grep -c 'landing.md'; git checkout -q -- "$L"
# C1.4
git diff --name-only "$B" "$U"
# C1.5
perl -ne 'BEGIN{$n=0;$f=0} if(/^## Claims/){$on=1;next} if($on && /^## /){$on=0} next unless $on && /^\| / && !/^\| (Claim|---)/; chomp; my @c = split / \| /, substr($_,2); my ($nd,$a,$k)=@c[1,2,3]; $k=~s/ \|$//; $a=~s/^`(.*)`$/$1/; $nd=~s/^`` (.*) ``$/$1/ or $nd=~s/^`(.*)`$/$1/; open my $h,"<",$a or die "no $a"; my $c=grep { index($_,$nd)>=0 } <$h>; close $h; $n++; if(($k eq "present" && $c<1) || ($k eq "absent" && $c!=0)){$f++; print "FAIL $k $a: $nd ($c)\n"} END{print "claims rows $n fail $f\n"}' .sdlc/handoffs/parallel-batch-U1.md
git show "$B:$S" | grep -cF 'Gate every edit with the'; git show "$B:$L" | grep -cF 'A design system that Claude'
# P (voice gate, branding)
node .claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs "$S" "$L" "$P" "$Q"; echo "voice-check exit $?"; node test/repo/branding.mjs | tail -1 | sed "s/ (.*//"
~~~

~~~out ran
46e04538
0
4
3
3
19 33 60 
em-dash: clean
15
docs/marketing/web/landing.md:41:15 voices
docs/marketing/product/claude-plugin.md:19:15-voice
docs/marketing/product/claude-plugin.md:60:15-voice
docs/marketing/product/boilerplate.md:38:15 type voices
exit 1
1
docs/marketing/product/boilerplate.md
docs/marketing/product/claude-plugin.md
docs/marketing/store-copy.md
docs/marketing/web/landing.md
claims rows 85 fail 0
0
0
voice-check exit 0
branding: clean
~~~

## Open questions (product decisions, not writing ones)

| Item | Where | Why it is not this unit's |
|---|---|---|
| 🟡 The shipped Account upgrade row says `and hosted MCP.` in the present tense. Hosted MCP is dark (fact sheet: `hosted MCP (when live)`), so §6 auto-fails this line. The row also carries no price, so the upgrade triad (limit, price, exit) is incomplete | `src/ui/overlays/settings.js:402` | `src/` is outside the marketing lane. `store-copy.md` §9 already holds the drop-in replacement (`From $39/year, with updates & support included.`), so the host can file it via `/file-bug` |
| 🟡 `voice-check.mjs` only pins voice counts written in digits (`11 voices` reds), so `eleven` passed layer 1. That gap is how #796's lines survived | `.claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs` | the skill script is outside `docs/marketing/**`. Extending the drift regex to spelled-out numbers closes the class |
| 🟡 The voice platform still describes the pivot as an `em-dash form` and calls ordinary em dashes punctuation. Its own example no longer contains the glyph, and the skill's SKILL.md says the same | `docs/marketing/voice/voice-platform.md` §5, `.claude/skills/ultimate-tokens-brand-voice/SKILL.md` | in lane, but not in U1's criteria. A one-line follow-up should restate the pivot as the comma form under the no-glyph rule |
| 🟡 The live store still carries the pre-sweep text. Every Lemon Squeezy field this unit changed joins the §10 walk: SEO meta title, social card, both product descriptions, the Studio listing excerpt, both variant descriptions, both receipt notes, the order-confirmation and Studio emails, the lifecycle emails, and the terms summary | `store-copy.md` §10 | #748 item 2, the owner's walk with a live key |
