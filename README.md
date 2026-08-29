# Ocean Trader

**Ocean Trader** is a mobile-first browser-based maritime shipping simulation.

## Status

- Product name: **Ocean Trader**
- Product strategy: **Mobile First**
- `SPEC.md`: **OT-SPEC-001 v1.1 APPROVED**
- VI-001: implemented — persistent single-ship trade loop
- VI-002: implemented — mobile multi-ship fleet management with independent voyages and save schema v2
- VI-003: implemented — interactive mobile world map with 20 real ports, fleet positions, routes, ETA, selection, pan and zoom
- `PRODUCT.md`: approved product context
- `DESIGN.md`: approved mobile-first design/interaction contract
- `docs/vertical-issues.json`: implementation-ready vertical backlog
- `docs/dependency-order.json`: production dependency order
- `docs/wayfinder/`: decisions, handoff, and prototype evidence
- `prototypes/wayfinder/`: disposable P1–P3 evidence prototypes; not production code

## Production sequence

Current production focus has advanced through **VI-003**. The next independent vertical product slice is **VI-004 — touch-first harbour manoeuvring**. It builds on the fleet foundation without coupling harbour physics to the React UI.

`VI-001 → VI-002 → VI-003 → VI-004 → VI-005 → {VI-006, VI-007} → VI-008`

## Development

```powershell
npm install
npm test
npm run build
npm run dev
```

The production UI baseline is smartphone portrait. Tablet and desktop are adaptive enhancements of the same task model.
