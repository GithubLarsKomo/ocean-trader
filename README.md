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
- `PRODUCT.md` / `DESIGN.md`: approved product and interaction context
- `prototypes/wayfinder/`: disposable evidence prototypes; not production code

## Production sequence

Current production focus has advanced through **VI-005**. The next slices are **VI-006 — financing/debt** and **VI-007 — deeper route/market economics**, which can proceed independently on the ship-economy foundation.

`VI-001 → VI-002 → VI-003 → VI-004 → VI-005 → {VI-006, VI-007} → VI-008`

## Development

```powershell
npm install
npm test
npm run build
npm run dev
```

The production UI baseline is smartphone portrait. Tablet and desktop are adaptive enhancements of the same task model.
