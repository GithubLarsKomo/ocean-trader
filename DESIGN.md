# Ocean Trader — Design System & Interaction Contract

**Status:** APPROVED / binding production context  
**Product:** Ocean Trader  
**Design priority:** Mobile First  
**Visual direction:** Illustrated maritime command center + shipping ledger + nautical chart  
**Source:** OT-SPEC-001 v1.1 + PRODUCT.md

## 1. Product feeling

Ocean Trader is a maritime simulation, not a generic productivity app and not a retro clone. It should feel like a modern interpretation of a shipping company's command room: calm, atmospheric, tactile, precise and information-rich.

The experience combines four visual metaphors:

- **Command center / bridge:** live fleet state, attention, voyage progress, bridge instruments and harbour control.
- **Shipping ledger / manifest:** contracts, finance, vessel acquisition and transaction history.
- **Nautical chart:** world map, ports, routes, weather and spatial planning.
- **Illustrated maritime world:** ships, harbours, cargo, events and technical systems are visually represented rather than reduced to abstract cards.

The UI must never reproduce distinctive Ports of Call screens, artwork, typography, labels or layouts.

## 2. Binding concept reference

The approved Ocean Trader command-center concept establishes the target production composition:

- a prominent gold/brass Ocean Trader identity on deep navy,
- campaign year, era, reputation, cash and enterprise value treated as command-deck instruments,
- desktop world chart as the dominant global operations surface,
- adjacent headquarters/finance/news and live freight exchange panels,
- fleet overview with illustrated vessel silhouettes and progress/state,
- ship bridge HUD with speed/course/rudder/fuel/condition instrument presentation,
- event and critical-warning cards with strong illustrated context,
- mobile key screens for Chart, Fleet Detail and Freight Exchange,
- immersive full-width harbour manoeuvre mode,
- cargo pictograms and class-specific vessel illustrations,
- original event artwork for weather, accidents, technical failure and market events.

This is a structural and art-direction reference, not a bitmap to be embedded as the application UI. Production components must remain live, responsive and data-driven.

## 3. Anti-SaaS rule

Ocean Trader must not look like a dashboard template or mobile banking/productivity app.

Avoid as the dominant visual language:

- large fields of identical rounded cards,
- excessive pill badges,
- generic blue/teal gradient surfaces,
- floating white-space-heavy KPI dashboards,
- icon-only app navigation without maritime context,
- every module having the same card geometry.

Use instead framed operations panels, command-deck instruments, manifest surfaces, chart frames, ledger lines, illustrated ship/cargo/event content and selective brass/signal accents. Rounded shapes are reserved primarily for instruments, true status indicators and controls where the shape improves usability.

## 4. Responsive composition

Baseline remains **360–430 CSS px portrait**. Every core workflow must be complete there before tablet/desktop enhancement.

### Phone

One dominant operational scene per screen:

- **Chart:** map occupies most of the upper viewport; selected vessel/port context appears below or in a sheet.
- **Fleet:** vessel illustration/state first, then operational metrics/actions.
- **Market:** route/cargo/price first; secondary economics progressively disclosed.
- **Company:** strategic status and campaign progression first.
- **Harbour:** full-screen spatial manoeuvre with large controls.

### Tablet

Allow split list/detail and larger chart or harbour surfaces.

### Desktop

Use a genuine multi-panel command-center composition rather than stretching phone cards. The preferred desktop hierarchy is:

1. World chart / fleet operations — largest panel.
2. Headquarters / finance / messages.
3. Freight exchange.
4. Fleet overview.
5. Bridge HUD / selected vessel.
6. Events and warnings.

Panels may be visible simultaneously where doing so improves decision-making.

## 5. Information architecture

Primary destinations remain:

1. **Market** — cargo and ship exchange.
2. **Fleet** — vessel register, voyages, port operations.
3. **Chart** — world map, routes, vessels, weather and ports.
4. **Company** — value, debt, journal, technology and era progression.

The desktop command center may expose summaries of all four destinations at once, but does not create duplicate state or alternative business logic.

## 6. Hierarchy

### Level 1 — Decision
Accept contract, berth vessel, repair, finance, buy/sell, reposition, resolve event, progress era.

### Level 2 — Operational state
ETA, cash effect, condition, fuel, cargo, route, deadline, risk, debt, technology lock, weather and critical alerts.

### Level 3 — Supporting evidence
Detailed market explanation, ledger history, secondary vessel specifications, crew detail and provenance.

A phone viewport should rarely contain more than one Level-1 decision block.

## 7. Visual language

### Palette

- **Ocean Blue:** near-black/navy global background.
- **Deep Sea:** command panels and chart frames.
- **Sea Teal / Signal Cyan:** live operational state, routes and instrument readouts.
- **Nautical Gold / Brass:** brand, strategic emphasis, selected state, campaign time and primary action.
- **Parchment / cool off-white:** charts, documents or lighter headquarters surfaces where appropriate.
- **Alert Red / Success Green:** critical and safe outcomes.

### Surfaces

- Desktop panels resemble framed maritime instrumentation modules.
- Contracts read as manifests or terminal listings.
- Fleet entries incorporate vessel identity and silhouette/illustration.
- Charts use map framing, route lines and operational overlays.
- Headquarters surfaces may be lighter than bridge/chart surfaces when this reinforces place and task identity.

### Typography

- Editorial/maritime serif for Ocean Trader brand, vessel names and major titles.
- Humanist/system sans for UI labels and body copy.
- Monospace/tabular numerals for dates, money, position, fuel, speed, debt and instrument values.

## 8. Required visual assets

All must be original or appropriately licensed.

### Brand

- Ocean Trader anchor/compass mark.
- Horizontal wordmark.
- App/favicon mark.

### Ship classes

Consistent side-view illustrations for Coaster, Handysize, Feeder and Panamax. The same visual grammar must support future classes/eras.

### Cargo icons

At minimum: container, general cargo, bulk, chemical and reefer; later machinery, timber, steel and other market categories may be added.

### Harbours

Illustrated port identity system for core hubs, initially Hamburg, Rotterdam, New York and Singapore. Visual cues may include skyline, cranes, terminal geometry, lighting/weather and berth structure without requiring photorealism.

### Event art

Original 16:9/4:3 artwork system for storms, mechanical failure, fire, collision, grounding, strikes, congestion and market shocks.

### Instruments

Speed, course, rudder, engine, radar/weather and condition indicators should share one coherent bridge-instrument style.

## 9. Core components

### Contract / freight exchange

Must show route, cargo icon/type, quantity, voyage duration, deadline, assigned/eligible vessel, price/payout, expected margin and risk. Desktop may use a terminal/list treatment; mobile uses stacked route cards.

### Vessel register

Use vessel illustration/silhouette, name/class, voyage/port, progress/ETA, fuel, condition and attention status. Selected vessel opens a richer bridge/dossier surface.

### Bridge HUD

Show at least speed, course or route bearing, rudder/steering state where applicable, fuel/consumption, weather/environment summary and condition. It must feel instrument-like rather than like KPI tiles.

### Headquarters

Company value, cash, debt, finance, contracts and messages/news may share one headquarters area on desktop. Strategic information can use brighter paper/chart-like surfaces where useful.

### Event / warning card

Events receive strong imagery and consequence-first text. Critical warnings use unmistakable red framed overlays and must not depend on color alone.

### Era chronometer

Campaign era remains visible and technology locks are explicit.

## 10. World chart

The chart is a visual centrepiece.

- large desktop footprint,
- recognizable world geography rather than an empty plotting plane,
- real ports and routes,
- ship markers with clear selected state,
- weather/environment overlays when implemented,
- mobile pan and zoom,
- detail without destroying spatial context.

Original/local chart rendering remains preferred; no third-party tracking or map tile dependency is required for MVP.

## 11. Harbour manoeuvre

Harbour is immersive and spatial, not a form.

Target composition follows the approved concept:

- broad illustrated/3D-like berth scene,
- ship orientation clearly visible,
- safe docking corridor/berth target,
- wind/current/depth information,
- condition/contact indicators,
- engine controls separated from rudder controls,
- speed instrument always visible,
- collision/grounding/success feedback layered over the scene.

The underlying deterministic harbour physics remain independent of rendering.

## 12. Crew direction

Crew management is a future gameplay slice but its visual system is reserved now. When implemented, portraits must be fictional/original and state must include at least role plus selected operational attributes such as morale, health or experience. Crew must affect actual simulation outcomes rather than exist as decorative RPG UI.

## 13. Interaction and accessibility

- Critical touch target minimum 44×44 CSS px; 48 px preferred.
- No critical action depends on hover, right-click or pixel-precise dragging.
- Irreversible/high-cost financial actions require explicit confirmation.
- Visible keyboard focus on desktop.
- WCAG-oriented contrast for text and controls.
- Respect `prefers-reduced-motion`.
- No state communicated by color alone.
- SVG/canvas spatial surfaces expose essential state through adjacent DOM UI.

## 14. Era-sensitive art direction

The interface identity remains consistent across campaign eras. Do not reskin the entire product. Era evolution may change vessel types, cargo/port infrastructure, subtle instrument treatment and supporting annotations while preserving the brand and interaction model.

## 15. Asset and IP rules

All ship illustrations, port artwork, cargo icons, chart styling, logos, portraits, event images and interface graphics must be original or appropriately licensed. Real port names and factual geography are acceptable with suitable sources. No historical Ports of Call assets or distinctive UI layouts may be reused.

## 16. Verification gate

Every production UI release is checked at minimum at:

- 360×800 portrait,
- 390×844 portrait,
- 430×932 portrait,
- representative tablet portrait/landscape,
- desktop ≥1280 px.

Verify touch target size, horizontal overflow, text clipping, safe areas, modal reachability, keyboard focus, reduced motion, map/harbour interaction, Level-1 decision clarity and desktop command-center panel balance.

## 17. Design acceptance

A screen passes only if:

1. the primary decision is visually obvious,
2. the phone workflow is complete,
3. the desktop version uses space as a command center rather than a stretched mobile app,
4. the screen belongs unmistakably to Ocean Trader,
5. operational data remains legible and auditable,
6. illustrated maritime context strengthens rather than obscures gameplay,
7. atmospheric styling never compromises interaction.
