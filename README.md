# Ocean Trader

Browser-based maritime shipping simulation. The repository contains the current Wayfinder evidence and the proposed production specification for **Ocean Trader**.

## Status

- Product name: **Ocean Trader**
- `SPEC.md`: proposed for approval
- `docs/wayfinder/`: decision, investigation, and prototype evidence
- `prototypes/wayfinder/`: disposable P1–P3 evidence prototypes; **not production code**

## Wayfinder prototypes

P1 validates the economic voyage loop, P2 the harbour manoeuvre, and P3 the scalable world map/fleet overlay.

Run locally after extracting the prototype artifact:

```powershell
python -m http.server 8080
```

Smoke tests:

```powershell
node tests.mjs
node harbor-tests.mjs
node map-tests.mjs
```

Production implementation starts only after explicit SPEC approval and subsequent product/design shaping.
