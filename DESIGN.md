# Ocean Trader — Design System & Interaction Contract

**Status:** APPROVED / binding production context  
**Product:** Ocean Trader  
**Design priority:** Mobile First  
**Visual direction:** Maritime command deck + shipping ledger + nautical chart  
**Source:** OT-SPEC-001 v1.1 + PRODUCT.md

## 1. Product feeling

Ocean Trader is a maritime simulation, not a generic productivity app and not a retro clone. It should feel like a modern interpretation of a shipping company's command room: calm, atmospheric, tactile, precise and information-rich.

The experience combines three visual metaphors without literally imitating real software:

- **Command deck:** live fleet state, attention, voyage progress, harbour control.
- **Shipping ledger / manifest:** contracts, finance, vessel acquisition, transaction history.
- **Nautical chart:** world map, ports, routes, spatial planning and era context.

The UI must never reproduce distinctive Ports of Call screens, artwork, typography, labels or layouts.

## 2. Anti-SaaS rule

Ocean Trader must not look like a dashboard template or mobile banking/productivity app.

Avoid as the dominant visual language:

- large fields of identical rounded cards,
- excessive pill badges,
- generic blue/teal gradient surfaces,
- floating white-space-heavy KPI dashboards,
- icon-only app navigation without maritime context,
- every module having the same card geometry.

Use instead restrained rectangular register/manifest surfaces, instrument-like status areas, chart frames, ledger lines, maritime typography and selective brass/signal accents. Rounded shapes are reserved primarily for true status indicators or controls where the shape improves usability.

## 3. Mobile-first layout contract

Baseline: **360–430 CSS px portrait**. Every core workflow must be complete there before tablet/desktop enhancement.

- **Phone:** one primary task surface at a time; bottom command navigation; progressive disclosure.
- **Tablet:** optional split list/detail, larger chart surface, harbour landscape enhancement.
- **Desktop:** multi-panel command layout is allowed, but task order remains consistent with mobile.

Never shrink a desktop table to fit phone width.

## 4. Information architecture

Primary destinations remain limited to four or five:

1. **Market** — cargo and ship exchange.
2. **Fleet** — vessel register, voyages, port operations.
3. **Chart** — world map, routes, vessels and ports.
4. **Company** — value, debt, journal, technology and era progression.

A separate Command destination may be introduced later only if it adds genuine decision value; it must not duplicate the four operational surfaces.

## 5. Hierarchy

### Level 1 — Decision
Accept contract, berth vessel, repair, finance, buy/sell, reposition, progress era.

### Level 2 — Operational state
ETA, cash effect, condition, fuel, cargo, route, deadline, risk, debt, technology lock.

### Level 3 — Supporting evidence
Detailed market explanation, ledger history, secondary vessel specifications and provenance.

A phone viewport should rarely contain more than one Level-1 decision block.

## 6. Visual language

### Surfaces

- Deep blue-charcoal ocean background with restrained chart/grid structure.
- Operational register panels: dark, rectangular, fine line-work, limited radius.
- Important strategic panels may use a framed chart/ledger treatment.
- Avoid decorative glassmorphism and large blur-heavy floating cards.

### Accent hierarchy

- **Brass / warm sand:** strategic emphasis, selected records, campaign time, primary action.
- **Signal cyan:** navigation/instrument state, route and live operational data.
- **Amber:** attention and unresolved risk.
- **Red:** danger/destructive action.
- **Green:** safe/arrived/completed state.

Color is never the only state indicator.

### Typography

Use a dual hierarchy without external font dependency by default:

- Humanist/system sans for operational labels and controls.
- Restrained maritime/editorial serif for product, vessel and major screen titles.
- Monospace/tabular numerals for dates, money, debt, fuel, percentages and instrument values where useful.

Critical phone data must not fall below 13 px equivalent legibility; very small uppercase text may only be supporting labels.

## 7. Core components

### Contract / manifest
Must show route, assigned vessel, cargo, quantity, duration, deadline, market state, expected major costs/risk and payout before acceptance. It should read like a shipping manifest, not a commerce product card.

### Vessel register
The fleet list is a register with status/route/condition information. Selected vessel opens a larger vessel dossier with voyage or port-operation context.

### Ship market
Offers show vessel identity, class, year, port, condition and price. Technology unavailable in the current era is shown explicitly as a locked capability, not silently disabled.

### Company ledger
Company value, debt, financing and journal use ledger-like separation and tabular numbers. Finance remains transparent before commitment.

### Era chronometer
Campaign era is always discoverable and visible in Company. The timeline communicates past/current/future periods, operational multipliers and technology unlocks. Strategic time progression is a material action with explicit cost/consequence.

## 8. World chart

The map is the visual centrepiece for global operations, not a miniature widget.

Phone requirements:

- touch pan and zoom,
- enlarged hit targets,
- progressive labels,
- selected vessel/port focus,
- route contrast,
- detail below/over the chart without destroying spatial context.

Desktop may expand the chart into a large command surface with persistent fleet context.

No third-party tiles or tracking services are required for the MVP; original/local chart rendering is preferred.

## 9. Harbour manoeuvre

Harbour is an immersive focused mode. Spatial visibility takes precedence over application chrome.

- engine and rudder are distinct,
- actual speed and current state remain visible,
- neutral/stop is immediately reachable,
- controls do not obscure berth or bow/stern awareness,
- collision/grounding/success use visual + textual feedback,
- viewport rotation does not reset the manoeuvre.

The harbour should feel like a bridge control surface rather than a form.

## 10. Interaction and accessibility

- Critical touch target minimum 44×44 CSS px; 48 px preferred.
- No critical action depends on hover, right-click or pixel-precise dragging.
- Irreversible/high-cost financial actions require explicit confirmation.
- Visible keyboard focus on desktop.
- WCAG-oriented contrast for text and controls.
- Respect `prefers-reduced-motion`.
- No state communicated by color alone.
- Canvas/SVG spatial surfaces expose essential state through adjacent DOM UI.

## 11. Motion

Motion communicates navigation, voyage progress, arrival and settlement. It must be restrained. Avoid decorative dashboard animation, bouncing cards, animated counters and game-like noise that competes with operational information.

## 12. Era-sensitive art direction

The interface identity remains consistent across the campaign; do not reskin the whole application every era. Era changes may subtly alter supporting accents, terminology and technical annotations, while preserving usability and brand continuity.

Historical inspiration must remain balanced and fictionalized where needed. Future eras should feel plausible rather than science-fictional unless the product strategy is explicitly changed.

## 13. Asset rules

All vessel illustrations, port icons, chart styling, logos and interface graphics must be original or appropriately licensed. Real port names and factual geography are acceptable with suitable sources. No historical Ports of Call assets may be reused.

## 14. Verification gate

Every production UI release is checked at minimum at:

- 360×800 portrait,
- 390×844 portrait,
- 430×932 portrait,
- representative tablet portrait/landscape,
- desktop ≥1280 px.

Verify touch target size, horizontal overflow, text clipping, safe areas, modal reachability, keyboard focus, reduced motion, map/harbour interaction and Level-1 decision clarity.

## 15. Design acceptance

A screen is not complete because it functions or because every data point is visible. It passes only if:

1. the primary decision is visually obvious,
2. the phone workflow is complete,
3. the screen belongs unmistakably to Ocean Trader rather than a generic app template,
4. operational data remains legible and auditable,
5. atmospheric styling never obscures game state or touch interaction.
