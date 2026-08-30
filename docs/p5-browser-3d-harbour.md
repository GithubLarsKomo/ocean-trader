# P5 — Browser 3D Harbour

**Status:** active prototype  
**Branch:** `feat/p5-browser-3d-harbour`  
**Gate source:** P4 technical gate accepted 2026-08-30

## Purpose

Prove that the deterministic P4 manoeuvring engine can drive a useful mobile browser 3D harbour scene without moving authoritative vessel physics into the renderer.

## First slice

- renderer: Babylon.js ES modules
- scenario: Rotterdam training basin
- one Handysize vessel at 60% cargo load
- deterministic P4 physics at fixed 30 Hz
- Babylon render loop independent from fixed simulation step
- procedural water, quays, berth marker and vessel mesh
- chase and tactical cameras
- touch-sized engine telegraph controls
- continuous rudder control
- HUD: heading, speed, rudder and engine order
- reset control

Prototype entry point during development: `/p5.html`.

## Architectural boundary

`src/simulation/*` remains authoritative. `src/simulator3d/*` consumes manoeuvre state and only renders it. Babylon.js must not own speed, heading, collision outcomes or campaign state.

## Not yet claimed

- production-ready harbour geometry
- realistic Rotterdam reconstruction
- final water shader or weather
- collision/grounding integration in 3D
- docking success criteria
- bridge camera
- radar
- WebGPU/WebGL performance evidence on physical phones
- human usability evidence

## Next evidence

1. CI build and tests with Babylon.js dependency.
2. Verify standalone `/p5.html` in a deployed preview or local Vite environment.
3. Add harbour collision mapping and docking target adapter without duplicating P4 physics.
4. Add bridge camera and mobile landscape test.
5. Measure frame rate and initial payload before P5 gate acceptance.
