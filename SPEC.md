# Ocean Trader — Product & Engineering Specification

**Spec ID:** OT-SPEC-001  
**Status:** Proposed for approval  
**Product type:** Browser-based single-player maritime shipping simulation  
**Source basis:** Confirmed product defaults plus Wayfinder prototypes P1–P3.

## 1. Purpose and product vision

Ocean Trader is a modern browser-based shipping-company simulation inspired by the general economic/action loop of classic maritime management games without copying protected branding, text, graphics, layouts, source code, or proprietary assets.

The player builds a shipping company over a long-running campaign. Short sessions consist of selecting freight, assigning ships, planning and executing voyages, reacting to events, managing fuel and technical condition, performing selected harbour manoeuvres, and reinvesting profits into a growing fleet.

The product MUST be easy to understand during the first voyage while supporting increasingly deep economic and operational decisions over time.

### 1.1 Core promise
The player SHOULD always understand: what can be transported, with which ship, to where, how long it will take, what it costs, what can go wrong, what it earns, and what strategic choice comes next.

### 1.2 MVP non-goals
The MVP MUST NOT require multiplayer, live AIS, live freight/bunker markets, satellite imagery, full professional navigation, full hydrodynamics, real-world ship identities, mandatory AI/ML, user accounts, cloud persistence, or monetisation.

## 2. Confirmed decisions

- **DEC-001:** Modern independent reinterpretation, not a 1:1 clone.
- **DEC-002:** Long-running campaign with short sessions.
- **DEC-003:** Economy deeper than the historical inspiration but approachable.
- **DEC-004:** Harbour manoeuvres are an important feature.
- **DEC-005:** Real ports and geography.
- **DEC-006:** Realistically inspired fictional ship types with technical data.
- **DEC-007:** Campaign may span approximately 1970 into the future.
- **DEC-008:** Multiplayer deferred beyond MVP.
- **DEC-009:** “Easy to learn, hard to master”.
- **DEC-010:** Modern stylised nautical map and high-quality 2D ships.
- **DEC-011:** Real distances/ports with gameplay-modelled economy.
- **DEC-012:** Disposable prototypes precede production implementation.

## 3. Primary gameplay loop

`Freight market → contract selection → ship assignment → voyage planning → voyage progression → event resolution → harbour arrival/manoeuvre → unload → settlement → refuel/repair/fleet decision → next contract`

Secondary loops include buying/selling ships, financing, maintenance, empty repositioning, multi-vessel fleet management, reputation, and technological/campaign progression.

## 4. Functional requirements

### Campaign/company
- **REQ-CMP-001:** Persistent company state MUST contain cash, debt, fleet value, reputation, campaign date, and owned vessels.
- **REQ-CMP-002:** Campaign MUST continue across browser sessions.
- **REQ-CMP-003:** New campaign MUST start from defined date/capital and at least one viable ship-acquisition path.
- **REQ-CMP-004:** Company value MUST reflect liquid funds, vessel value, liabilities, and other material assets.
- **REQ-CMP-005:** Insolvency risk MUST exist, with warning before directly calculable irreversible loss.
- **REQ-CMP-006:** Campaign progression SHOULD unlock technologies, efficiency, regulations, cargo opportunities, and constraints.

### Ports/geography
- **REQ-PORT-001:** Initial production catalog MUST contain at least 20 real ports across major regions.
- **REQ-PORT-002:** Each port MUST have stable ID, name, latitude, longitude, region, operational and market attributes.
- **REQ-PORT-003:** Port-to-port base distances MUST derive from geographic data or validated shipping-route logic.
- **REQ-PORT-004:** Production routing SHOULD account for major constraints such as Suez/Panama where material.
- **REQ-PORT-005:** Ports MAY differ in fuel price, repair ability, cargo availability, fees, congestion, and risk.

### Ships
- **REQ-SHP-001:** Each vessel MUST have stable ID and class definition.
- **REQ-SHP-002:** MVP MUST support at least four materially different ship classes.
- **REQ-SHP-003:** Vessel data MUST include capacity, service speed, fuel use, condition, age, maintenance cost, and market value.
- **REQ-SHP-004:** Later classes SHOULD support draft, manoeuvrability, reliability, crew cost, emissions, and cargo compatibility.
- **REQ-SHP-005:** Condition MUST affect cost, reliability, resale, or performance.
- **REQ-SHP-006:** Player MUST be able to buy and sell vessels in the production MVP or first post-foundation milestone.

### Freight
- **REQ-FRT-001:** Ports MUST offer freight contracts.
- **REQ-FRT-002:** Before acceptance, contract MUST expose origin, destination, cargo, quantity, payout, expected duration, deadline, and relevant constraints.
- **REQ-FRT-003:** Incompatible or over-capacity freight MUST be rejected.
- **REQ-FRT-004:** Payout MUST reflect distance, cargo characteristics, market state, and delivery risk.
- **REQ-FRT-005:** Late delivery MAY reduce payout and/or reputation.
- **REQ-FRT-006:** Contract generation MUST avoid unintended long dead-end states.

### Economy
- **REQ-ECO-001:** Every voyage MUST show expected revenue and material cost drivers.
- **REQ-ECO-002:** Material costs MUST include fuel and maintenance/depreciation effects.
- **REQ-ECO-003:** Production economy SHOULD include port fees, financing, repairs, and repositioning.
- **REQ-ECO-004:** Economy MUST be deterministic for identical state plus seed.
- **REQ-ECO-005:** Randomness MUST NOT silently negate core player strategy.
- **REQ-ECO-006:** Contract attractiveness MUST be comparable without external calculations.
- **REQ-ECO-007:** Local supply/demand variation or market cycles SHOULD be supported.

### Voyage simulation
- **REQ-VOY-001:** Voyage MUST expose origin, destination, departure, ETA, progress, vessel state, and financial effects.
- **REQ-VOY-002:** Voyage simulation MUST be independent from UI rendering.
- **REQ-VOY-003:** Simulation core MUST support headless automated tests.
- **REQ-VOY-004:** Multiple vessels MUST progress simultaneously.
- **REQ-VOY-005:** Game time MUST support accelerated advancement.
- **REQ-VOY-006:** All active voyages MUST resume correctly from save.
- **REQ-VOY-007:** Outcomes MUST be reproducible from identical state and seed.

### Events
- **REQ-EVT-001:** Voyage events MUST be able to alter cost, duration, condition, reputation, or cargo outcome.
- **REQ-EVT-002:** MVP SHOULD include weather, technical malfunction, operational delay, and beneficial conditions.
- **REQ-EVT-003:** Later events MAY include piracy, strikes, canal closure, rescue, quarantine, regulation change, or cargo damage.
- **REQ-EVT-004:** Events MUST state consequences and available choice where applicable.
- **REQ-EVT-005:** High-impact randomness MUST be bounded.

### Harbour manoeuvre
- **REQ-HBR-001:** Selected arrivals/departures MUST invoke a 2D harbour manoeuvre.
- **REQ-HBR-002:** Harbour simulation MUST model perceptible inertia.
- **REQ-HBR-003:** Rudder authority MUST depend materially on vessel movement.
- **REQ-HBR-004:** Forward/reverse commands MUST have visible acceleration/deceleration behaviour.
- **REQ-HBR-005:** Hard collisions MUST have visible operational consequences.
- **REQ-HBR-006:** Grounding/shallow water MUST be distinguishable from hard collision.
- **REQ-HBR-007:** Docking success MUST require position, low speed, and acceptable heading.
- **REQ-HBR-008:** Harbour control MUST work via keyboard and touch-capable controls.
- **REQ-HBR-009:** Later difficulty SHOULD vary by vessel, port, weather, and current.
- **REQ-HBR-010:** Repeated forced manoeuvres MUST be preventable from becoming tedious through frequency/delegation/automation design.

### World map/fleet
- **REQ-MAP-001:** World map MUST display at least 20 ports and five active vessels without loss of core desktop usability.
- **REQ-MAP-002:** Map MUST support pan and zoom.
- **REQ-MAP-003:** Active vessels MUST expose origin, destination, progress, and ETA.
- **REQ-MAP-004:** Map selection MUST synchronize with fleet details.
- **REQ-MAP-005:** Port selection MUST expose operational/market context.
- **REQ-MAP-006:** Label clutter MUST be reduced by progressive disclosure.
- **REQ-MAP-007:** Vessel routes MUST remain distinguishable from ports and other vessels.

### Fleet/finance
- **REQ-FLT-001:** Player MUST inspect all owned ships and voyages from one fleet surface.
- **REQ-FLT-002:** Fleet view MUST expose operational exceptions.
- **REQ-FLT-003:** Empty repositioning SHOULD be supported.
- **REQ-FLT-004:** Maintenance planning SHOULD be supported.
- **REQ-FIN-001:** Financing SHOULD support loans/mortgages.
- **REQ-FIN-002:** Financing MUST expose principal, cost, schedule, and default consequence.
- **REQ-FIN-003:** Financing MUST be understandable without real-world finance expertise.

### Save/restore
- **REQ-SAV-001:** MVP MUST support local persistent save.
- **REQ-SAV-002:** Saves MUST be versioned.
- **REQ-SAV-003:** Load MUST validate schema/version.
- **REQ-SAV-004:** Invalid saves MUST fail safely and preserve original stored data where practical.
- **REQ-SAV-005:** Production SHOULD support manual save export/import.
- **REQ-SAV-006:** Future cloud sync MAY be added behind a stable persistence interface.

## 5. Domain model

Core entities: `Company`, `Vessel`, `Port`, `Contract`, `Voyage`, `Event`, `Transaction`, `Loan`, and `SaveGame`.

Minimum relationships:
- Company owns vessels and liabilities.
- Vessel is either at one port or on one active voyage.
- Contract has one origin and one destination.
- Voyage belongs to one vessel and optionally one freight contract.
- Transactions provide financial provenance.
- Event outcomes are attached to voyages and persist their applied effects.

## 6. Domain invariants

- **INV-001:** Vessel MUST be either at a port or on exactly one active voyage.
- **INV-002:** Vessel MUST NOT carry incompatible/excess freight.
- **INV-003:** Completed contract MUST NOT pay more than once.
- **INV-004:** Cash changes MUST be attributable to typed transactions.
- **INV-005:** Voyage progression MUST NOT depend on UI lifecycle, canvas frame rate, or render speed.
- **INV-006:** Persisted state MUST contain enough information for deterministic resume.
- **INV-007:** Random events MUST use explicit seeded randomness or persisted outcomes.
- **INV-008:** Port/vessel/voyage/contract IDsRST remain stable within a save.
- **INV-009:** Core gameplay MUST remain usable offline once application assets are available.

## 7. State machines

Contract: `offered → accepted → in_transit → delivered`, with `expired` / `failed` terminals.  
Vessel: `in_port → loading → enderway → harbour_approach → in_port`, plus maintenance.  
Voyage: `planned → active → arrival_pending → completed`, with interruption/failure branches.  
Save: `current → serializing → persisted → validated_on_load → restored`; corrupt/incompatible saves are rejected/quarantined.

## 8. Simulation architecture

Required boundary:

```text
UI / Presentation
  ↓ commands/selectors
Application/Game Orchestration
  ↓
Deterministic Simulation Core
  ↓
Domain State + seeded RNG
  ↓
Persistence Adapter
```

The simulation core MUST be framework-independent, avoid DOM access, accept explicit state/commands, return new state/events, and support automated tests.

Harbour manoeuvre MAY use a dedicated real-time module, but its financial/condition result MUST return through an explicit domain boundary.

A TypeScript browser application with component UI plus Canvas-based simulation is an approved reversible assumption. React and Phaser MAY be used but are not normative.

## 9. Persistence and offline behaviour

MVP is local-first. Active voyages MUST survive reload. Network failure MUST NOT corrupt campaign state. Live data MUST NOT be required for core gameplay. Future cloud sync must use a persistence abstraction.

## 10. Security and privacy

MVP has no account and SHOULD collect no personal data by default. Third-party trackers MUST NOT be required for gameplay. Imported saves MUST be validated as untrusted input.

If accounts, analytics, leaderboards, cloud saves, or multiplayer are later added, server authority, authentication/authorization, retention/export/deletion, and anti-cheat rules MUST be specified before rollout.

## 11. AI/ML architecture and data strategy

AI/ML is **not required for MVP** and MUST not be required for correct gameplay.

Possible later uses: balancing assistance, adaptive help, anomaly detection, constrained procedural event drafting, personalization, or NPC competitor strategy.

The following MUST remain deterministic/rule-governed: save integrity, financial accounting, contract settlement, capacity constraints, core collision outcome, legal state transitions, and hard difficulty bounds.

If telemetry is later enabled with appropriate legal basis/consent, it SHOULD use structured events such as `contract_viewed`, `contract_accepted`, `voyage_completed`, `harbour_collision`, `harbour_completed`, `ship_bought`, and `campaign_bankrupt`.

Any future model MUST first be evaluated against deterministic baselines in shadow/advisory mode with versioning, metrics, rollback, and documented user impact.

## 12. UX requirements

- **REQ-UX-001:** Contract consequence MUST be understandable before acceptance.
- **REQ-UX-002:** Units/formatting MUST be consistent.
- **REQ-UX-003:** Opportunity, commitment, warning, irreversible action, and completed outcome MUST be visually distinguishable.
- **REQ-UX-004:** Map MUST NOT display every label persistently at every zoom.
- **REQ-UX-005:** Harbour controls MUST give immediate throttle/rudder/speed/collision/grounding/docking feedback.
- **REQ-UX-006:** Desktop MUST be supported; modern tablets SHOULD be supported.
- **REQ-UX-007:** Smartphone is post-MVP unless later promoted.
- **REQ-UX-008:** Core non-pointer actions SHOULD be keyboard-operable.
- **REQ-UX-009:** Colour MUST NOT be the only carrier of critical state.

## 13. Visual direction and IP

Final design MUST NOT copy historical Ports of Call UI. It SHOULD use modern stylised maritime/cartographic language, clear operational hierarchy, original 2D ship art, and restrained nautical styling.

- **REQ-IP-001:** Public product branding MUST be distinct from “Ports of Call” unless separately cleared.
- **REQ-IP-002:** Original game artwork, sound, layout, manual text, source code, or proprietary data MUST NOT be copied.
- **REQ-IP-003:** Generic maritime simulation mechanics MAY be implemented independently.
- **REQ-IP-004:** Real port/geographic data MUST respect source licensing.

Production frontend requires confirmed `PRODUCT.md` and `DESIGN.md`.

## 14. Performance and quality

- **REQ-QLT-001:** Core UI SHOULD remain responsive with at least 20 ports and 20 active vessels on a typical desktop.
- **REQ-QLT-002:** Harbour manoeuvre SHOULD target 60 fps on typical desktop and acceptable tablet interaction.
- **REQ-QLT-003:** Simulation results MUST be independent of rendering frame rate.
- **REQ-QLT-004:** Save/load regression tests MUST cover schema evolution.
- **REQ-QLT-005:** Economy/voyage calculations MUST have automated tests.
- **REQ-QLT-006:** Critical state transitions MUST have automated tests.
- **REQ-QLT-007:** CI MUST fail production builds on test failure.

## 15. Prototype evidence

**P1 Economic loop:** headless voyage simulation, generated contracts, state progression, company-value calculation, and local persistence are technically viable. Human pacing/balance evidence remains pending.

**P2 Harbour:** acceleration/inertia, underway rudder response, collision consequence, grounding class, and docking predicate are technically viable. Human handling calibration remains pending.

**P3 Map:** 20 real ports, five simultaneous vessels, ETA/progress, pan/zoom, and synchronized selection are technically viable. Human readability calibration remains pending.

Prototype constants are evidence, not production requirements.

## 16. Release gates

**G0 Prototype evidence:** P1/P2/P3 automated smoke tests pass. **Technical status: PASS; qualitative calibration pending.**

**G1 Production foundation:** approved SPEC, approved PRODUCT.md, approved DESIGN.md, TypeScript foundation, deterministic test harness, save schema v1.

**G2 First playable vertical slice:** new campaign → one ship → contract → complete voyage → event → arrival → settlement → persistent save.

**G3 Harbour integrated:** production harbour simulation → docking success/failure → condition consequence → return to economy.

**G4 Fleet campaign MVP:** 20+ ports, 4+ ship classes, acquisition, simultaneous voyages, fuel/repair, financing, map/fleet overlay, persistence, accessibility baseline.

## 17. Acceptance criteria

**AC-001 Deterministic voyage:** identical saved state + seed + commands MUST yield identical domain and financial outputs.

**AC-002 Complete trade loop:** compatible contract accepted and completed MUST settle exactly once, move vessel to destination, account costs/revenue exactly once, and persist state.

**AC-003 Multi-vessel progression:** at least five active vessels MUST advance independently with valid progress/ETA/state and saveability.

**AC-004 Harbour docking:** acceptable position + low speed + heading MUST produce one docking success and defined operational result.

**AC-005 Collision consequence:** hard collision above threshold MUST provide immediate feedback and bounded vessel consequence.

**AC-006 Safe save loading:** malformed/incompatible save MUST NOT silently overwrite a valid campaign.

**AC-007 Offline core:** once assets are local, network loss MUST NOT prevent ongoing local campaign play.

## 18. Risks and assumptions

**RISK-001:** Harbour realism may become frustrating. Mitigate through human docking calibration before adding wind/current complexity.  
**RISK-002:** Economy may develop dominant strategies. Mitigate with simulation/balance tests and later telemetry.  
**RISK-003:** Fleet growth may overwhelm map readability. Mitigate with filters, clustering, progressive disclosure.  
**RISK-004:** 1970→future pacing may be too slow or superficial. Define era mechanics only after core loop validation.  
**RISK-005:** Historical branding may cause IP confusion. Use independent branding/assets.

**ASSUMPTION-001:** Desktop/tablet first.  
**ASSUMPTION-002:** Local persistence sufficient for MVP.  
**ASSUMPTION-003:** TypeScript simulation core is suitable/reversible.  
**ASSUMPTION-004:** Human prototype testing may tune constants without changing architecture.

## 19. Deferred non-blocking decisions

Final public name, exact campaign start year, exact four ship classes, cargo catalog, financing parameters, map provider/library, Phaser usage, final design system, and smartphone timing.

## 20. Sequencing

Production SHOULD proceed vertically:
1. deterministic saveable trade loop,
2. harbour integration,
3. fleet/map multi-vessel loop,
4. ship market/maintenance,
5. financing/deeper economy,
6. era progression,
7. optional online/AI features.

## 21. Approval

Approval means this SPEC becomes normative, deferred decisions remain explicitly non-blocking, prototype code remains evidence rather than production code, and routing may continue to frontend product/design context plus `spec-to-vertical-issues`.

**Approval state:** PENDING USER APPROVAL
