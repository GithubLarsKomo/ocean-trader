# Ocean Trader — Design System & Interaction Contract

**Status:** Approved design context
**Product:** Ocean Trader
**Design priority:** Mobile First
**Source:** OT-SPEC-001 v1.1 + PRODUCT.md

## 1. Design objective

Ocean Trader should feel like a modern maritime operations product rather than a retro game imitation: calm, precise, tactile, information-rich, and legible. The visual language must support quick operational decisions on a phone while still scaling elegantly to tablet and desktop.

The interface must never reproduce distinctive Ports of Call screens, artwork, typography, labels, or layout patterns.

## 2. Mobile-first layout contract

### Baseline viewport

Design starts at a modern smartphone portrait viewport around 360–430 CSS px wide. Every core workflow must be complete there before tablet/desktop enhancements are added.

### Responsive strategy

- **Phone:** one primary task surface at a time; bottom navigation; sheets/drawers for contextual detail; progressive disclosure.
- **Tablet:** optional split view for list + detail; harbour may prefer landscape; persistent secondary context may appear where useful.
- **Desktop:** multi-panel operational layout is allowed, but hierarchy and task order remain the same as mobile.

Never solve density by shrinking desktop tables onto phone screens.

## 3. Information architecture

The primary mobile navigation contains at most five top-level destinations:

1. **Command** — current cash, urgent attention, active voyages, next actions.
2. **Market** — available contracts and economics.
3. **Fleet** — vessels, cargo, condition, ETA, maintenance, exceptions.
4. **Map** — ports, routes, vessel positions and drill-down.
5. **Company** — value, debt, reputation, history, save/settings.

Contextual actions belong inside the current workflow rather than becoming additional global navigation items.

## 4. Interaction principles

- Critical touch targets: minimum **44 × 44 CSS px**; 48 px is preferred for primary game controls.
- Primary actions should be reachable in the lower half of the screen where practical.
- No critical action depends on hover, right-click, double-click, or pixel-precise dragging.
- Back navigation must be predictable and must not discard uncommitted state without warning.
- Destructive or irreversible financial actions require explicit confirmation when consequences are material.
- Use immediate feedback for accepted commands; long operations require visible progress or state change.
- Bottom sheets are preferred for mobile port/vessel details when the map should remain visible.

## 5. Visual hierarchy

### Level 1 — Decision

The one action or condition that matters most now: accept contract, resolve event, berth vessel, repair, pay/finance, or choose next route.

### Level 2 — Operational state

ETA, cash impact, vessel condition, fuel, cargo, route, deadline, risk.

### Level 3 — Supporting detail

Historical transactions, secondary technical characteristics, detailed market explanation, provenance.

A phone screen should rarely show more than one Level-1 decision block at a time.

## 6. Typography

Use a modern system-first sans-serif stack for production until a branded webfont is explicitly selected. Numeric values must be highly legible and use tabular numerals where supported.

Recommended type scale:

- Display / screen title: 28–32 px phone
- Section title: 20–24 px
- Card title: 16–18 px
- Body: 15–17 px
- Metadata: 13–14 px
- Never place critical game data below 13 px on phone.

Line height should favor scanability over compactness. Avoid all-caps paragraphs; short operational labels may use restrained uppercase or letter spacing.

## 7. Color system

The exact palette remains implementation-adjustable, but semantic roles are fixed.

Required roles:

- **Ocean / background:** very dark blue-charcoal rather than pure black.
- **Surface:** differentiated operational panels/cards.
- **Primary action:** high-contrast maritime cyan/teal family.
- **Attention:** amber/orange.
- **Danger:** red family.
- **Success / arrived / safe:** green family.
- **Neutral text:** high-contrast off-white plus muted secondary tone.

Color must never be the only indicator of warning, success, selection, route state, or vessel condition; pair with icon, text, shape, or pattern.

## 8. Components

### Contract card

Must show destination, cargo, quantity, payout, ETA/duration, deadline, expected major cost, and risk/constraint summary before acceptance. Mobile default is stacked, not table-like.

### Vessel card

Must show name/class, current state, route or port, ETA, condition, fuel, cargo, and attention marker where relevant.

### KPI strip

Use sparingly for cash, company value, debt, reputation, or fleet count. On phone, horizontal scrolling should not be required to understand critical KPIs.

### Bottom sheet / detail sheet

Used for map-selected port/vessel details and contextual actions. It must support partial and expanded states without covering all navigation context.

### Event card

Consequence-first wording: what happened, what changes, what choices exist. If there is no choice, present it as a resolved operational event rather than fake interactivity.

### Confirmation dialog

Reserve for irreversible, high-cost, or campaign-threatening actions; do not overuse.

## 9. World map

The map is an operational surface, not decorative cartography.

On phone:

- touch pan and pinch zoom are mandatory;
- port/vessel hit areas must exceed the visible marker size;
- persistent labels are aggressively reduced at low zoom;
- selected route/vessel gets clear focus;
- vessel/port detail opens in a bottom sheet;
- a Fleet/Attention filter must be available once density increases;
- the user must be able to return from detail to the exact previous map state.

Desktop may add a persistent fleet panel.

## 10. Harbour manoeuvre

The harbour surface prioritises spatial visibility and large tactile controls.

Mobile controls:

- engine/throttle and rudder are distinct control groups;
- current command and actual movement/speed must both be visible;
- controls must not obscure the docking target or vessel bow/stern awareness;
- a neutral/stop action is immediately reachable;
- collision, grounding, shallow water, and docking success use visual + textual/haptic-capable feedback;
- orientation changes must not reset manoeuvre state.

Touch handling must use pointer/touch-safe input and prevent accidental browser scrolling/zooming inside the active manoeuvre area while preserving accessibility outside it.

## 11. Motion

Motion should communicate state, not decorate it. Use restrained transitions for route progress, panel changes, attention, arrival, and financial settlement. Respect `prefers-reduced-motion` and provide equivalent non-motion state cues.

## 12. Accessibility

- WCAG-oriented contrast for text and critical controls.
- Semantic HTML for non-canvas UI.
- Visible focus states for keyboard users.
- Accessible labels for icon-only controls.
- Keyboard support for desktop-enhanced flows.
- Reduced motion support.
- Do not encode state by color alone.
- Canvas/WebGL surfaces must expose essential state and actions through adjacent DOM UI where practical.

## 13. Content style

Copy is concise, operational, and specific. Prefer “Fuel cost +€12,400” to vague text such as “This may be expensive.” Use maritime terminology where it improves authenticity, but introduce specialist terms through context rather than requiring prior knowledge.

## 14. Asset rules

All ship illustrations, port icons, map styling, logos, and interface graphics must be original or appropriately licensed. Real port names and geographic data must use licensable factual sources. No historical Ports of Call assets may be reused.

## 15. Production verification

Every production UI slice must be checked at minimum at:

- 360 × 800 portrait,
- 390 × 844 portrait,
- 430 × 932 portrait,
- representative tablet portrait/landscape,
- desktop ≥1280 px.

Required checks include touch-target size, horizontal overflow, text clipping, safe-area handling, modal/sheet reachability, keyboard focus on desktop, reduced-motion behavior, and map/harbour interaction on touch.

## 16. Design acceptance gate

A screen is not considered complete merely because it works on desktop. The phone portrait implementation is the baseline acceptance version; wider layouts are enhancements. Any later component or feature that regresses the mobile core loop fails the design gate.
