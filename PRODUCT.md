# Ocean Trader — Product Context

**Status:** Approved product context
**Product:** Ocean Trader
**Platform priority:** Mobile First
**Source:** OT-SPEC-001 v1.1 + Wayfinder P1–P3

## Product statement

Ocean Trader is a mobile-first browser game in which the player builds and operates a global shipping company. The core experience combines accessible economic decisions with selected hands-on harbour manoeuvres. The game uses real ports and geography, fictional but technically plausible vessels, and a long-running campaign that can span roughly 1970 into the future.

Ocean Trader is an independent reinterpretation of the maritime management genre. It must not copy branding, artwork, text, source code, UI layout, sound, or proprietary assets from Ports of Call or other commercial games.

## Primary user and job

The primary user wants to make meaningful shipping decisions in short sessions without needing professional maritime or financial expertise. A useful session should allow the player to understand the current fleet, choose an economically interesting action, advance operations, resolve consequences, and leave the campaign in a clear persistent state.

## Product principles

1. **Mobile First, not mobile reduced.** Smartphone is a first-class gameplay target. Tablet and desktop gain additional density and simultaneous context, but no core gameplay capability may require a large screen.
2. **Easy to learn, hard to master.** First-voyage decisions must be understandable; mastery comes from fleet composition, routing, timing, maintenance, financing, risk, and manoeuvring skill.
3. **Real world, playable economy.** Ports and geographic relationships are real; markets and finances are modeled for gameplay clarity and balance.
4. **Consequences before commitment.** Before accepting a contract or financial commitment, the player should understand expected duration, major costs, risk, and reward.
5. **Short sessions, long campaign.** The game must support meaningful progress in minutes while preserving strategic continuity over many sessions.
6. **Skill plus strategy.** Harbour manoeuvres provide direct control and tension; the economic game remains the main long-term progression system.
7. **Local-first and resilient.** Core single-player play must not depend on a live backend.

## Core loop

Freight market → contract → ship → voyage plan → voyage progression → event → harbour arrival/manoeuvre → settlement → refuel/repair/fleet decision → next contract.

## MVP product scope

The MVP includes a persistent single-player campaign, at least 20 real ports, at least four materially different ship classes, freight contracts, fuel, condition/maintenance, voyage events, multiple simultaneous voyages, world map/fleet overview, selected 2D harbour manoeuvres, ship acquisition, financing, and local versioned saves.

The MVP does not require multiplayer, live AIS, live freight or bunker markets, satellite imagery, cloud accounts, monetisation, or mandatory AI/ML.

## Mobile-first experience

The smallest supported primary viewport is a modern smartphone in portrait orientation. Landscape may be used where it materially improves harbour manoeuvring, but the player must not be forced to rotate for ordinary company, market, fleet, contract, or map workflows.

The mobile information architecture prioritises a small number of primary surfaces:

- **Command / Today:** cash, attention items, active voyages, next meaningful actions.
- **Market:** available contracts and their economics.
- **Fleet:** vessels, state, cargo, ETA, maintenance, exceptions.
- **Map:** ports, routes, vessel positions, selection and ETA.
- **Company:** value, debt, reputation, transaction history, settings/save.

Desktop/tablet may combine surfaces into split views, but these are enhancements of the same flows.

## Success criteria

A new player should be able to complete the first profitable trade without external instructions. A returning player should be able to understand what needs attention within seconds. Five or more simultaneous voyages must remain manageable on mobile through prioritisation and drill-down rather than dense miniature dashboards.

Harbour manoeuvring must feel deliberate and learnable on touch, with inertia, clear throttle/rudder state, collision/grounding feedback, and reliable docking criteria.

## Deferred product decisions

The exact campaign start year, final ship-class catalog, cargo catalog, financing constants, public marketing tagline, map rendering library, harbour rendering library, and optional future multiplayer/AI features remain implementation or later product decisions unless promoted into the SPEC.
