# Ocean Trader

**Ocean Trader** is a mobile-first browser-based maritime shipping simulation.

## Status

- Product name: **Ocean Trader**
- Product strategy: **Mobile First**
- `SPEC.md`: **OT-SPEC-001 v1.1 APPROVED**
- `PRODUCT.md`: approved product context
- `DESIGN.md`: approved mobile-first design/interaction contract
- `docs/vertical-issues.json`: implementation-ready vertical backlog
- `docs/dependency-order.json`: production dependency order
- `docs/wayfinder/`: decisions, handoff, and prototype evidence
- `prototypes/wayfinder/`: disposable P1–P3 evidence prototypes; **not production code**

## Production sequence

The next implementation target is **VI-001 — Start and complete a persistent mobile trade**. It delivers a complete thin production slice: smartphone UI, deterministic simulation, one voyage/event/settlement loop, versioned local persistence, and automated tests.

The intended sequence is:

`VI-001 → {VI-002, VI-004} → {VI-003, VI-005} → {VI-006, VI-007} → VI-008`

## Wayfinder prototypes

P1 validates the economic voyage loop, P2 the harbour manoeuvre, and P3 the scalable world map/fleet overlay. They are retained as technical evidence only and must not be promoted wholesale into production.

Run the prototype locally from `prototypes/wayfinder/`:

```powershell
cd prototypes/wayfinder
python -m http.server 8080
```

Smoke tests:

```powershell
node tests.mjs
node harbor-tests.mjs
node map-tests.mjs
```

The production UI baseline is smartphone portrait. Tablet and desktop are adaptive enhancements of the same task model.
