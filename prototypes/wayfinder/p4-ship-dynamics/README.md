# P4 Ship Dynamics — Diagnostic Prototype

This is a disposable Wayfinder prototype for validating Ocean Trader ship-handling behaviour before any 3D renderer is introduced.

## Run locally

From the repository root:

```powershell
npm install
npm run dev
```

Then open:

```text
/prototypes/wayfinder/p4-ship-dynamics/index.html
```

## What to inspect

Use the benchmark and load selectors to compare Coaster, Handysize, Feeder and Panamax under identical deterministic inputs.

Available views:

- acceleration,
- hard turn,
- crash stop,
- reverse / prop walk,
- wind drift.

Load presets are empty, 50% and laden.

The viewer is evidence tooling only. It is not production UI and must not be promoted to the main application merely because the tracks look plausible.

## P4 acceptance focus

The four vessel classes should show materially different handling. In particular:

- Coaster should react and turn quickly,
- Panamax should build speed, turn and stop more slowly,
- reverse manoeuvring should produce a transverse/yaw effect,
- wind should create lateral motion independent of heading,
- loading should measurably change acceleration and stopping behaviour,
- identical input streams must replay identically.

Automated benchmark relationships are defined in `src/simulation/benchmarks.test.ts`.
