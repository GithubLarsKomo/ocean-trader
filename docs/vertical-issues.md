# Ocean Trader — Vertical Production Issues

**Source:** OT-SPEC-001 v1.1 (approved)  
**Product/design context:** `PRODUCT.md`, `DESIGN.md`  
**Rule:** Every issue delivers observable player value through the full stack. No horizontal “build all engine / all UI / all persistence” phases.

## VI-001 — Start and complete a persistent mobile trade

**Player value:** Start Ocean Trader on a phone, accept one contract, complete one deterministic voyage with one event, receive settlement, reload, and continue.

Includes the production TypeScript foundation, mobile app shell, one starting vessel, minimal port/cargo catalog, contract acceptance, voyage/event progression, financial ledger, one-time settlement, and versioned local persistence.

**Done when:** the complete loop works at 390×844 without desktop-only interaction; reload restores the exact campaign; identical seed/state/commands replay identically; settlement cannot occur twice; automated tests cover domain and save behavior.

## VI-002 — Manage an active fleet from the phone

**Player value:** Understand several simultaneous voyages, see what needs attention, inspect one vessel, and advance time.

Depends on VI-001. Five-vessel test state; exception-first fleet surface; route/ETA/fuel/condition/cargo details; deterministic concurrent progression; save/resume.

## VI-003 — Navigate the global fleet on a touch world map

**Player value:** Find ports and vessels, inspect route/ETA, and move between fleet and map without losing context.

Depends on VI-002. At least 20 real ports; touch pan/pinch zoom; enlarged hit targets; progressive labels; selected-route focus; mobile bottom sheet; synchronized fleet selection; preserved viewport state.

## VI-004 — Dock a vessel with touch controls

**Player value:** Perform a skill-based harbour arrival and return the operational result to the economic campaign.

Depends on VI-001. Production harbour module; inertia; movement-dependent rudder; touch engine/rudder/stop controls; collision/grounding; heading/speed docking predicate; persisted condition/financial result; orientation-safe state.

## VI-005 — Buy, sell, refuel, and maintain ships

**Player value:** Reinvest profit into fleet composition and readiness.

Depends on VI-001 and VI-002. Four or more ship classes; ship market; fuel/bunkering; condition; planned maintenance/repair; resale value; mobile comparison flows; transaction provenance.

## VI-006 — Finance fleet growth and understand leverage

**Player value:** Finance a ship while understanding debt, payment schedule, company-value effect, and risk before committing.

Depends on VI-005. Loan/mortgage flow; repayments; liabilities; insolvency warning; persistence; mobile pre-commitment summary.

## VI-007 — Make route and market choices matter

**Player value:** Choose among genuinely different opportunities instead of following one dominant route.

Depends on VI-005. Local market state; cargo compatibility; fees/bunker variation; repositioning; bounded cycles; comparison explanation; balance scenario tests.

## VI-008 — Progress the company through shipping eras

**Player value:** A long campaign changes strategically as technology and operating conditions evolve.

Depends on VI-006 and VI-007. Era progression; vessel/technology unlocks; era-dependent economics/constraints; migration-safe persistence.

## Parallelisation

After VI-001, VI-002 and VI-004 may proceed in parallel once their shared domain interfaces are stable. VI-003 follows VI-002. VI-005 follows VI-002 and can then unlock VI-006 and VI-007 in parallel. VI-008 follows both.

## First implementation target

**VI-001 is the next production issue.** It is intentionally a complete thin slice: phone UI + orchestration + deterministic simulation + persistence + tests. Prototype source under `prototypes/wayfinder/` may be consulted for evidence but must not be promoted wholesale into production.
