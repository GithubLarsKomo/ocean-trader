# Ocean Trader — Product & Engineering Specification

**Spec ID:** OT-SPEC-001  
**Version:** 1.1  
**Status:** APPROVED  
**Approval date:** 2026-08-29  
**Product:** Ocean Trader  
**Product type:** Mobile-first browser-based single-player maritime shipping simulation  
**Source basis:** Confirmed product decisions + Wayfinder P1–P3 + mobile-first decision.

## 1. Purpose and product vision

Ocean Trader is a modern browser-based shipping-company simulation inspired by the general economic/action loop of classic maritime management games without copying protected branding, text, graphics, layouts, source code, sound, or proprietary assets.

The player builds a shipping company over a long-running campaign. Short sessions combine freight selection, ship assignment, voyage planning, events, fuel and condition management, selected harbour manoeuvres, and reinvestment into a growing fleet.

The product MUST be easy to understand during the first voyage while supporting increasingly deep economic and operational decisions over time.

### 1.1 Core promise

The player SHOULD always be able to answer: What can I transport? With which ship? Where is it going? How long will it take? What will it cost? What can go wrong? What will I earn? What should I do next?

### 1.2 Mobile-first decision

- **DEC-013:** Ocean Trader is Mobile First. Smartphone is a first-class MVP target; tablet and desktop are adaptive enhancements.
- Core gameplay MUST remain usable on a modern smartphone in portrait orientation.
- Harbour manoeuvring MAY recommend landscape orientation where beneficial, but ordinary campaign workflows MUST NOT require rotation.
- No core feature MAY exist only in a desktop-only interaction pattern such as hover, right-click, permanently visible sidebars, or large-screen-only drag targets.

### 1.3 MVP non-goals

The MVP MUST NOT require multiplayer, live AIS, live freight/bunker markets, satellite imagery, full professional marine navigation, full hydrodynamics, real-world ship identities, mandatory AI/ML, cloud accounts, or monetisation.

## 2. Confirmed decisions

- **DEC-001:** Modern independent reinterpretation, not a 1:1 clone.
- **DEC-002:** Long-running campaign with short sessions.
- **DEC-003:** Economy deeper than the historical inspiration but approachable.
- **DEC-004:** Harbour manoeuvres are an important feature.
- **DEC-005:** Real ports and geography.
- **DEC-006:** Realistically inspired fictional ship types with technical data.
- **DEC-007:** Campaign may span approximately 1970 into the future.
- **DEC-008:** Multiplayer deferred beyond MVP.
- **DEC-009:** Easy to learn, hard to master.
- **DEC-010:** Modern stylised nautical map and high-quality original 2D ships.
- **DEC-011:** Real distances/ports with gameplay-modelled economy.
- **DEC-012:** Disposable prototypes precede production implementation.
- **DEC-013:** Mobile First; smartphone MUST be a primary supported MVP device.

## 3. Primary gameplay loop

`Freight market → contract selection → ship assignment → voyage planning → voyage progression → event resolution → harbour arrival/manoeuvre → unload → settlement → refuel/repair/fleet decision → next contract`

Secondary loops include buying/selling ships, financing, maintenance, empty repositioning, multi-vessel management, reputation, and campaign/technology progression.

## 4. Functional requirements

### 4.1 Campaign/company

- **REQ-CMP-001:** Persistent company state MUST contain cash, debt, fleet value, reputation, campaign date, and owned vessels.
- **REQ-CMP-002:** Campaign MUST continue across browser sessions.
- **REQ-CMP-003:** New campaign MUST start from defined date/capital and at least one viable vessel-acquisition path.
- **REQ-CMP-004:** Company value MUST reflect liquid funds, vessel value, liabilities, and other material assets.
- **REQ-CMP-005:** Insolvency risk MUST exist, with warning before directly calculable irreversible loss.
- **REQ-CMP-006:** Campaign progression SHOULD unlock technologies, efficiency, regulations, cargo opportunities, and constraints.

### 4.2 Ports/geography

- **REQ-PORT-001:** Initial production catalog MUST contain at least 20 real ports across major regions.
- **REQ-PORT-002:** Each port MUST have stable ID, name, latitude, longitude, region, operational attributes, and market attributes.
- **REQ-PORT-003:** Port-to-port base distances MUST derive from geographic data or validated shipping-route logic.
- **REQ-PORT-004:** Production routing SHOULD account for Suez/Panama and other major constraints where material.
- **REQ-PORT-005:** Ports MAY differ in fuel price, repair ability, cargo availability, fees, congestion, and risk.

### 4.3 Ships

- **REQ-SHP-001:** Each vessel MUST have stable ID and class definition.
- **REQ-SHP-002:** MVP MUST support at least four materially different ship classes.
- **REQ-SHP-003:** Vessel data MUST include capacity, service speed, fuel use, condition, age, maintenance cost, and market value.
- **REQ-SHP-004:** Later classes SHOULD support draft, manoeuvrability, reliability, crew cost, emissions, and cargo compatibility.
- **REQ-SHP-005:** Condition MUST materially affect cost, reliability, resale value, or performance.
- **REQ-SHP-006:** Player MUST be able to buy and sell vessels during MVP campaign progression.

### 4.4 Freight/economy

- **REQ-FRT-001:** Ports MUST offer freight contracts.
- **REQ-FRT-002:** Before acceptance, contracts MUST expose origin, destination, cargo, quantity, payout, expected duration, deadline, and relevant constraints.
- **REQ-FRT-003:** Incompatible or over-capacity freight MUST be rejected.
- **REQ-FRT-004:** Payout MUST reflect distance, cargo characteristics, market state, and delivery risk.
- **REQ-FRT-005:** Late delivery MAY reduce payout and/or reputation.
- **REQ-FRT-006:** Contract generation MUST avoid unintended long dead-end states.
- **REQ-ECO-001:** Every voyage MUST show expected revenue and material cost drivers before commitment.
- **REQ-ECO-002:** Material costs MUST include fuel and maintenance/depreciation effects.
- **REQ-ECO-003:** Production economy SHOULD include port fees, financing, repairs, and repositioning.
- **REQ-ECO-004:** Economy MUST be deterministic for identical state plus random seed.
- **REQ-ECO-005:** Randomness MUST NOT silently negate the player's core strategic decisions.
- **REQ-ECO-006:** Contract attractiveness MUST be comparable without external calculations.
- **REQ-ECO-007:** Local supply/demand variation or market cycles SHOULD be supported.

### 4.5 Voyage/events

- **REQ-VOY-001:** Voyage MUST expose origin, destination, departure, ETA, progress, vessel state, and financial effects.
- **REQ-VOY-002:** Voyage simulation MUST be independent from UI rendering.
- **REQ-VOY-003:** Simulation core MUST support headless automated tests.
- **REQ-VOY-004:** Multiple vessels MUST progress simultaneously.
- **REQ-VOY-005:** Game time MUST support accelerated advancement.
- **REQ-VOY-006:** Active voyages MUST resume correctly from save.
- **REQ-VOY-007:** Outcomes MUST be reproducible from identical state and seed.
- **REQ-EVT-001:** Voyage events MUST be able to alter cost, duration, condition, reputation, or cargo outcome.
- **REQ-EVT-002:** MVP SHOULD include weather, technical malfunction, operational delay, and beneficial conditions.
- **REQ-EVT-003:** Later events MAY include piracy, strikes, canal closure, rescue, quarantine, regulation change, or cargo damage.
- **REQ-EVT-004:** Events MUST state consequences and available choices where applicable.
- **REQ-EVT-005:** High-impact randomness MUST be bounded.

### 4.6 Harbour manoeuvre

- **REQ-HBR-001:** Selected arrivals/departures MUST invoke a 2D harbour manoeuvre.
- **REQ-HBR-002:** Harbour simulation MUST model perceptible inertia.
- **REQ-HBR-003:** Rudder authority MUST depend materially on vessel movement.
- **REQ-HBR-004:** Forward/reverse commands MUST have visible acceleration/deceleration behaviour.
- **REQ-HBR-005:** Hard collisions MUST have visible operational consequences.
- **REQ-HBR-006:** Grounding/shallow water MUST be distinguishable from hard collision.
- **REQ-HBR-007:** Docking success MUST require position, low speed, and acceptable heading.
- **REQ-HBR-008:** Harbour control MUST be usable with touch; keyboard controls SHOULD be supported as desktop enhancement.
- **REQ-HBR-009:** Touch targets MUST remain operable without precision pointer input.
- **REQ-HBR-010:** Repeated forced manoeuvres MUST be preventable from becoming tedious through frequency, delegation, or later automation.

### 4.7 World map/fleet

- **REQ-MAP-001:** World map MUST support at least 20 ports and five active vessels without loss of core smartphone usability.
- **REQ-MAP-002:** Map MUST support touch pan and pinch zoom; mouse/wheel are desktop enhancements.
- **REQ-MAP-003:** Active vessels MUST expose origin, destination, progress, and ETA.
- **REQ-MAP-004:** Map selection MUST synchronize with fleet details.
- **REQ-MAP-005:** Port selection MUST expose operational/market context.
- **REQ-MAP-006:** Label clutter MUST be reduced by progressive disclosure, filtering, and selection.
- **REQ-MAP-007:** Vessel routes MUST remain distinguishable from ports and other vessels.
- **REQ-FLT-001:** Player MUST inspect all owned ships and voyages from one mobile-usable fleet surface.
- **REQ-FLT-002:** Fleet view MUST prioritise operational exceptions and items requiring attention.
- **REQ-FLT-003:** Empty repositioning SHOULD be supported.
- **REQ-FLT-004:** Maintenance planning SHOULD be supported.

### 4.8 Financing

- **REQ-FIN-001:** Financing SHOULD support loans/mortgages.
- **REQ-FIN-002:** Financing MUST expose principal, cost, schedule, and default consequence before commitment.
- **REQ-FIN-003:** Financing MUST be understandable without specialist financial knowledge.

### 4.9 Save/restore

- **REQ-SAV-001:** MVP MUST support local persistent save.
- **REQ-SAV-002:** Saves MUST be versioned.
- **REQ-SAV-003:** Load MUST validate schema/version.
- **REQ-SAV-004:** Invalid saves MUST fail safely and preserve original stored data where practical.
- **REQ-SAV-005:** Production SHOULD support manual save export/import.
- **REQ-SAV-006:** Future cloud sync MAY be added behind a stable persistence interface.

## 5. Domain model

Core entities are `Company`, `Vessel`, `Port`, `Contract`, `Voyage`, `Event`, `Transaction`, `Loan`, and `SaveGame`.

Company owns vessels and liabilities. Vessel is either at one port or on one active voyage. Contract has one origin and destination. Voyage belongs to one vessel and optionally one contract. Transactions provide financial provenance. Event outcomes attach to voyages and persist their applied effects.

## 6. Domain invariants

- **INV-001:** A vessel MUST be either at one port or on exactly one active voyage.
- **INV-002:** A vessel MUST NOT carry incompatible or excess freight.
- **INV-003:** A completed contract MUST NOT pay more than once.
- **INV-004:** Company cash changes MUST be attributable to typed transactions.
- **INV-005:** Voyage progression MUST NOT depend on UI lifecycle, canvas frame rate, or render speed.
- **INV-006:** Persisted state MUST contain sufficient information for deterministic resume.
- **INV-007:** Random events MUST use explicit seeded randomness or persisted outcomes.
- **INV-008:** Port, vessel, voyage, and contract IDs MUST remain stable within a save.
- **INV-009:** Core gameplay MUST remain usable offline once application assets are available.

## 7. State machines

Contract: `offered → accepted → in_transit → delivered`, with `expired` and `failed` terminals.  
Vessel: `in_port → loading → underway → harbour_approach → in_port`, plus `maintenance`.  
Voyage: `planned → active → arrival_pending → completed`, with interruption/failure branches.  
Save: `current → serializing → persisted → validated_on_load → restored`; corrupt/incompatible saves are rejected or quarantined.

## 8. Simulation architecture

Required boundary:

```text
UI / Presentation
  ↓ commands / selectors
Application / Game Orchestration
  ↓
Deterministic Simulation Core
  ↓
Domain State + seeded RNG
  ↓
Persistence Adapter
```

The simulation core MUST be framework-independent, avoid DOM access, accept explicit state/commands, return new state/events, and support automated tests. Harbour manoeuvre MAY use a real-time module, but its financial/condition result MUST return through an explicit domain boundary.

TypeScript is the approved production language. A component UI framework and Canvas/WebGL rendering MAY be used; exact libraries remain reversible implementation choices.

## 9. Mobile-first UX and accessibility

- **REQ-UX-001:** Smartphone portrait is the baseline layout for market, fleet, company, contract, save, and ordinary map workflows.
- **REQ-UX-002:** Primary touch targets MUST be at least 44 × 44 CSS px, with sufficient spacing to avoid accidental activation.
- **REQ-UX-003:** No critical action MAY depend on hover, right-click, or fine pointer accuracy.
- **REQ-UX-004:** Important actions SHOULD live within comfortable thumb reach where this does not conflict with game visibility.
- **REQ-UX-005:** Dense data MUST use progressive disclosure rather than shrinking desktop tables.
- **REQ-UX-006:** Navigation state and critical information MUST survive orientation change and viewport resize.
- **REQ-UX-007:** Contract consequence MUST be understandable before acceptance.
- **REQ-UX-008:** Units and number formatting MUST be consistent.
- **REQ-UX-009:** Opportunity, commitment, warning, irreversible action, and completed outcome MUST be visually distinguishable.
- **REQ-UX-010:** Colour MUST NOT be the only carrier of critical state.
- **REQ-UX-011:** Text MUST remain legible at normal mobile viewing distance without browser zoom.
- **REQ-UX-012:** Tablet and desktop MAY add simultaneous panels but MUST preserve the same task model and information hierarchy.

## 10. Persistence, privacy, and security

MVP is local-first. Active voyages MUST survive reload. Network failure MUST NOT corrupt campaign state. Imported saves MUST be validated as untrusted input. MVP SHOULD collect no personal data by default and MUST NOT require third-party trackers for core gameplay.

Future accounts, analytics, cloud saves, leaderboards, or multiplayer require explicit server-authority, authentication/authorization, retention, export/deletion, and anti-cheat specifications before rollout.

## 11. AI/ML readiness

AI/ML is not required for MVP and MUST NOT be required for correct gameplay. Potential later uses include balancing assistance, adaptive help, anomaly detection, constrained procedural event drafting, personalization, or NPC strategy.

Save integrity, financial accounting, contract settlement, capacity constraints, collision outcome baseline, legal state transitions, and hard difficulty bounds MUST remain deterministic/rule-governed.

Any future model MUST be evaluated against deterministic baselines with model versioning, metrics, rollback, and documented user impact before it can influence gameplay.

## 12. Visual direction and IP

The design MUST NOT copy historical Ports of Call UI or assets. It SHOULD use a modern stylised maritime/cartographic language, strong operational hierarchy, original 2D vessel art, and restrained nautical styling.

- **REQ-IP-001:** Public branding MUST be Ocean Trader unless separately changed through a product decision.
- **REQ-IP-002:** Original game artwork, sound, layout, manual text, source code, or proprietary data MUST NOT be copied.
- **REQ-IP-003:** Generic maritime simulation mechanics MAY be implemented independently.
- **REQ-IP-004:** Real port/geographic data MUST respect source licensing.

`PRODUCT.md` and `DESIGN.md` are normative product/design companions to this SPEC.

## 13. Performance and quality

- **REQ-QLT-001:** Core smartphone interactions SHOULD remain responsive with at least 20 ports and 20 active vessels in campaign state.
- **REQ-QLT-002:** Harbour manoeuvre SHOULD target 60 fps on modern smartphones and desktops, with a defined degraded-quality path before interaction latency becomes unacceptable.
- **REQ-QLT-003:** Simulation results MUST be independent of rendering frame rate.
- **REQ-QLT-004:** Save/load regression tests MUST cover schema evolution.
- **REQ-QLT-005:** Economy/voyage calculations MUST have automated tests.
- **REQ-QLT-006:** Critical state transitions MUST have automated tests.
- **REQ-QLT-007:** CI MUST fail production builds on test failure.
- **REQ-QLT-008:** Mobile viewport and touch interaction smoke tests MUST be part of release validation.

## 14. Prototype evidence

P1 established technical viability of the economic voyage loop and local persistence. P2 established technical viability of inertia, steering, collision/grounding classes, and docking criteria. P3 established technical viability of 20 real ports, simultaneous vessels, ETA/progress, pan/zoom, and synchronized selection.

Human calibration of pacing, manoeuvring feel, and mobile information density remains a tuning task. Prototype constants are evidence, not production requirements.

## 15. Release gates

**G0 — Wayfinder evidence:** P1/P2/P3 technical smoke tests pass. Status: PASS.  
**G1 — Production foundation:** approved SPEC, PRODUCT.md, DESIGN.md, TypeScript foundation, deterministic test harness, save schema v1, mobile application shell.  
**G2 — First playable vertical slice:** new campaign → one ship → mobile contract selection → voyage/event → settlement → persistent save.  
**G3 — Harbour integrated:** touch-first harbour manoeuvre → docking/failure → condition consequence → return to economy.  
**G4 — Fleet campaign MVP:** 20+ ports, 4+ ship classes, acquisition, simultaneous voyages, fuel/repair, financing, map/fleet overlay, mobile accessibility/performance baseline.

## 16. Acceptance criteria

**AC-001 Deterministic voyage:** identical state + seed + commands MUST yield identical domain/financial outputs.  
**AC-002 Complete trade loop:** a compatible accepted contract MUST settle exactly once, move the vessel to destination, account costs/revenue once, and persist.  
**AC-003 Multi-vessel progression:** at least five active vessels MUST advance independently with valid progress, ETA, state, and saveability.  
**AC-004 Harbour docking:** acceptable position + low speed + heading MUST produce exactly one docking result.  
**AC-005 Collision consequence:** hard collision above threshold MUST provide immediate feedback and bounded vessel consequence.  
**AC-006 Safe save loading:** malformed/incompatible save MUST NOT silently overwrite a valid campaign.  
**AC-007 Offline core:** after assets are available, network loss MUST NOT prevent continuing the local campaign.  
**AC-008 Mobile core loop:** at a supported smartphone portrait viewport, a player MUST be able to start/continue a campaign, inspect a contract, accept it, progress the voyage, resolve an event, settle, and save without desktop-only interaction.  
**AC-009 Touch map:** smartphone user MUST be able to select vessel/port, pan, zoom, inspect ETA, and return to fleet context using touch only.  
**AC-010 Touch harbour:** harbour controls MUST be operable by touch without accidental-control rates that make normal docking impractical.

## 17. Risks and assumptions

**RISK-001:** Harbour realism may become frustrating; tune from touch-first playtests before adding wind/current complexity.  
**RISK-002:** Economy may develop dominant strategies; mitigate with simulation/balance tests.  
**RISK-003:** Fleet growth may overwhelm mobile map readability; mitigate with filtering, clustering, attention queues, and progressive disclosure.  
**RISK-004:** 1970→future pacing may be too slow or superficial; define era mechanics after core loop validation.  
**RISK-005:** Historical branding may cause IP confusion; use independent Ocean Trader branding/assets.  
**RISK-006:** Desktop-first components may regress mobile usability; mobile acceptance tests are release gates.

**ASSUMPTION-001:** Smartphone is primary; tablet/desktop are enhancements.  
**ASSUMPTION-002:** Local persistence is sufficient for MVP.  
**ASSUMPTION-003:** TypeScript deterministic core is suitable and reversible.  
**ASSUMPTION-004:** Human testing may tune constants without changing architecture.

## 18. Deferred non-blocking decisions

Exact campaign start year, exact ship classes, cargo catalog, financing constants, map/rendering libraries, detailed visual assets, and optional future multiplayer/AI remain deferred unless promoted through a later specification change.

## 19. Production sequencing

Production proceeds as vertical user-value slices, not horizontal technology layers:

1. mobile-first deterministic trade loop,
2. touch harbour integration,
3. multi-vessel mobile fleet/map,
4. ship market and maintenance,
5. financing and deeper market dynamics,
6. campaign-era progression,
7. optional online/AI capabilities after core stability.

## 20. Approval

OT-SPEC-001 v1.1 is **APPROVED**. Mobile First is normative. `PRODUCT.md` and `DESIGN.md` are approved companion artifacts. Vertical issue decomposition is authorised from this version.
