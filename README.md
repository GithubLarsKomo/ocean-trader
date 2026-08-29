# Ocean Trader

**Ocean Trader** is a mobile-first browser-based maritime shipping simulation.

## Status

- Product name: **Ocean Trader**
- Product strategy: **Mobile First**
- `SPEC.md`: **OT-SPEC-001 v1.1 APPROVED**
- VI-001: implemented — persistent trade loop
- VI-002: implemented — mobile multi-ship fleet management with independent voyages and save schema v2
- VI-003: implemented — interactive mobile world map with 20 real ports, fleet positions, routes, ETA, selection, pan and zoom
- VI-004: implemented — touch-first harbour manoeuvring with inertia, rudder authority, collision/grounding consequences and harbour-gated settlement
- `PRODUCT.md`: approved product context
- `DESIGN.md`: approved mobile-first design/interaction contract
- `docs/vertical-issues.json`: implementation-ready vertical backlog
- `docs/dependency-order.json`: production dependency order
- `docs/wayfinder/`: decisions, handoff, and prototype evidence
- `prototypes/wayfinder/`: disposable P1–P3 evidence prototypes; not production code

## Production sequence

Production has advanced through **VI-004**. The next vertical product slice is **VI-005 — buy, sell, refuel, and maintain ships**, turning voyage profit and condition into fleet-capital decisions.

`VI-001 → VI-002 → VI-003 → VI-004 → VI-005 → {VI-006, VI-007} → VI-008`

## Development

```powershell
npm install
npm test
npm run build
npm run dev
```

The production UI baseline is smartphone portrait. Tablet and desktop are adaptive enhancements of the same task model.
