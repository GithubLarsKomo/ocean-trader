# Ocean Trader

**Ocean Trader** is a mobile-first browser-based maritime shipping simulation.

## Status

- Product name: **Ocean Trader**
- Product strategy: **Mobile First**
- `SPEC.md`: **OT-SPEC-001 v1.1 APPROVED**
- VI-001: implemented — persistent trade loop
- VI-002: implemented — mobile multi-ship fleet management
- VI-003: implemented — interactive mobile world map with 20 real ports
- VI-004: implemented — touch-first harbour manoeuvring integrated into voyage settlement
- VI-005: implemented — four ship classes, buy/sell market, bunkering, repairs, condition/age valuation, save schema v3
- VI-006: implemented — transparent financing offers, debt service, liabilities in company value, liquidity risk preview, save schema v4
- VI-007: implemented — deterministic local market cycles, cargo compatibility, port fees, route risk, expected-margin ranking, empty repositioning and save schema v5
- VI-008: implemented — six campaign eras from 1970 into the future, era-dependent economics, technology unlocks, strategic era progression and save schema v6
- Design Pass 1: implemented — maritime command-deck / shipping-ledger / nautical-chart visual system replacing the generic app-card aesthetic
- Design Pass 2: implemented — original Ocean Trader compass-wave mark, four class-specific vessel illustrations, hybrid rendered world-chart/harbour stages, cargo art and port-operations imagery wired into mobile and desktop views
- `PRODUCT.md` / `DESIGN.md`: approved product and binding interaction/visual context
- `prototypes/wayfinder/`: disposable evidence prototypes; not production code

## Vertical production sequence

The planned production backbone **VI-001 through VI-008 is now implemented**.

`VI-001 → VI-002 → VI-003 → VI-004 → VI-005 → VI-006 → VI-007 → VI-008`

The next phase is product refinement rather than another backbone slice: visual design, interaction polish, balance, content depth, usability evidence and release hardening.

## Era progression

Campaign eras currently span:

`1970 Classic Shipping → 1985 Container Expansion → 2000 Global Scale → 2015 Digital Fleet → 2030 Energy Transition → 2045 Autonomous Horizons`

Era progression changes fuel efficiency, maintenance economics, port costs, market volatility and technology availability. Strategic time jumps require an idle fleet, cost operating overhead and slightly reduce vessel condition.

## Visual direction

Ocean Trader should feel like a maritime simulation rather than a SaaS dashboard. The binding direction in `DESIGN.md` combines:

- maritime command deck,
- shipping ledger / manifest,
- nautical chart,
- original illustrated maritime context for ships, ports, cargo and manoeuvring.

The current hybrid renderer keeps map, route, vessel and harbour simulation state live while placing original local art beneath or beside those operational layers. Mobile portrait remains the baseline. Tablet and desktop enhance the same task model rather than replacing it with a separate desktop dashboard.

## Development

```powershell
npm install
npm test
npm run build
npm run dev
```
