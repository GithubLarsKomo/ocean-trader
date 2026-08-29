# Wayfinder evidence

This directory documents the technical exploration used to shape **Ocean Trader** before production implementation.

## P1 — Economic voyage loop
Validated: deterministic/headless voyage calculations, contracts, events, company-value changes, and local persistence feasibility.

## P2 — Harbour manoeuvre
Validated: browser-native inertia, underway rudder response, collision consequence, grounding feedback, and low-speed/alignment docking criteria.

## P3 — World map scale
Validated: 20 real ports, five concurrent vessels, route/ETA display, pan/zoom, and synchronized fleet selection.

Automated smoke tests passed for P1–P3. Human gameplay/handling/readability calibration is still evidence to be collected.

The complete disposable prototype and its detailed evidence files are preserved at `prototypes/wayfinder/ocean-trader-wayfinder-prototype.zip`. Prototype code is evidence only and must not be promoted directly into production.
