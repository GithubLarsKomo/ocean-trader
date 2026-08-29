# Ocean Trader

**Ocean Trader** is a mobile-first browser-based maritime shipping simulation.

## Status

- Product strategy: **Mobile First**
- `SPEC.md`: **OT-SPEC-001 v1.1 APPROVED**
- `PRODUCT.md`: approved product context
- `DESIGN.md`: approved mobile-first interaction/design contract
- **VI-001 production slice implemented in the repository root**
- `docs/public-deployment-legal.md`: public deployment legal baseline
- `public/impressum.html` and `public/datenschutz.html`: public legal pages
- `prototypes/wayfinder/`: disposable P1–P3 evidence only; not production code

## Production app

VI-001 implements a complete thin vertical slice:

`mobile freight market → accept contract → deterministic voyage → bounded event → arrival/settlement → versioned local save/restore`

Technology: React + TypeScript + Vite. Domain simulation is independent of rendering and has automated tests.

### Local development

```powershell
npm install
npm run dev
```

### Verification

```powershell
npm test
npm run build
```

### Coolify

The current prototype deployment may still point at `/prototypes/wayfinder`. To deploy the production app, switch Coolify to repository root, use a Node/Nixpacks or equivalent Vite build, build with `npm run build`, and serve `dist/` as static output.

## Production sequence

`VI-001 → {VI-002, VI-004} → {VI-003, VI-005} → {VI-006, VI-007} → VI-008`

The production UI baseline is smartphone portrait; tablet and desktop are adaptive enhancements of the same task model.
