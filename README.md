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
- `PRODUCT.md` / `DESIGN.md`: approved product and interaction context
- `prototypes/wayfinder/`: disposable evidence prototypes; not production code

## Production sequence

Current production focus has advanced through **VI-007**. The remaining planned vertical slice is **VI-008 — campaign era progression from 1970 into the future**.

`VI-001 → VI-002 → VI-003 → VI-004 → VI-005 → VI-006 → VI-007 → VI-008`

## Development

```powershell
npm install
npm test
npm run build
npm run dev
```

The production UI baseline is smartphone portrait. Tablet and desktop are adaptive enhancements of the same task model.
