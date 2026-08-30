# Ocean Trader — Ship Simulation Development Guide

**Status:** Current implementation guide  
**Date:** 2026-08-30  
**Applies to:** simulator work after VI-008  
**Production baseline:** `main`  
**Development branch:** `feat/p4-ship-dynamics`

## 1. Purpose

Ocean Trader will evolve its current 2D harbour manoeuvre into a reusable maritime simulation engine. The goal is not to clone Ports of Call, Sim3D, or another commercial simulator. The goal is to preserve Ocean Trader's independent product identity while adopting useful genre principles: direct ship control, materially different vessel behaviour, environmental effects, bridge instrumentation, and scenario-based harbour operations.

The strategic campaign remains the primary game. The simulator is the physical consequence layer of campaign decisions.

**Core design rule:** economy affects physics.

Cargo load, vessel class, condition, weather, current, water depth and equipment should influence how a ship handles. A laden Panamax must feel materially different from an empty coaster.

## 2. Current production baseline

The current production harbour model in `src/harbour.ts` is a deterministic 2D manoeuvring model with:

- x/y position,
- heading,
- scalar speed,
- throttle,
- rudder,
- simple acceleration and drag,
- speed-dependent steering authority,
- rectangular quay/breakwater collision zones,
- shallow-water zones,
- deterministic docking criteria,
- collision/grounding damage,
- voyage settlement integration.

This implementation remains the production fallback until the replacement proves superior by tests and human usability evidence.

Do not delete or bypass the production path during P4/P5 experimentation.

## 3. Target architecture

Separate simulation, rendering and campaign logic.

```text
Ocean Trader domain / campaign
        │
        ▼
Simulation adapter
        │
        ▼
Deterministic maritime simulation
        │
        ├── vessel dynamics
        ├── propulsion
        ├── rudder / thrusters
        ├── wind / current
        ├── shallow-water effects
        └── collision / damage
        │
        ▼
Renderer
        ├── P4: simple 2D diagnostic view
        └── P5+: Babylon.js 3D scene
```

The renderer must never own authoritative vessel physics.

The campaign domain must not depend on Babylon.js, WebGL/WebGPU, DOM APIs or browser frame timing.

## 4. Physics target: 3 degrees of freedom

Replace the current scalar-speed model for the experimental engine with planar 3-DOF motion:

- **surge `u`** — longitudinal velocity,
- **sway `v`** — lateral velocity,
- **yaw rate `r`** — angular velocity.

Authoritative vessel state should include at minimum:

```ts
interface ManoeuvreState {
  x: number
  y: number
  heading: number
  surge: number
  sway: number
  yawRate: number
  throttle: number
  rudder: number
  condition: number
  elapsed: number
}
```

Forces/moments are composed from simplified, calibrated models rather than full CFD:

```text
Hull resistance
+ propeller thrust
+ rudder force
+ transverse propeller effect / prop walk
+ bow/stern thruster if fitted
+ wind
+ current
+ shallow-water effects
+ collision impulses
```

Use a fixed deterministic simulation timestep. Recommended starting point: **30 Hz (`dt = 1/30`)**. Rendering may run independently at 60/120 Hz with interpolation.

## 5. Vessel parameter model

Ship classes must differ physically, not only economically.

Create class-specific parameters for at least:

- length,
- beam,
- displacement/lightship estimate,
- design draft,
- maximum ahead thrust,
- reverse thrust factor,
- hull drag coefficients,
- lateral drag,
- yaw inertia,
- rudder area/effectiveness,
- prop-walk coefficient,
- thruster availability and force,
- windage area.

Initial tuning target:

- **Coaster:** agile, short stopping distance, strong low-speed authority.
- **Handysize:** visibly heavier, moderate response.
- **Feeder:** larger windage and meaningful lateral drift.
- **Panamax:** high inertia, long stopping distance, slow yaw response, strong consequences for late control inputs.

A player should be able to distinguish coaster and Panamax handling without seeing the vessel name.

## 6. Cargo and draft coupling

Simulation state should derive a hydrodynamic load state from campaign data.

```ts
interface VesselLoadState {
  cargoLoadRatio: number
  displacementTonnes: number
  draftMeters: number
  trim: number
}
```

Load should affect, at minimum:

- acceleration,
- stopping distance,
- turn response,
- draft,
- under-keel clearance,
- grounding risk,
- fuel use,
- visible waterline in 3D.

Do not make load effects purely cosmetic.

## 7. Difficulty presets

Build Arcade and Simulation as parameter presets over the same engine, not separate physics implementations.

### Arcade

Optimise for fast touch play:

- reduced inertia,
- stronger rudder authority,
- stronger braking/reverse effect,
- reduced wind/current influence,
- forgiving collision damage,
- optional assist for heading/berth alignment.

Target ordinary docking duration: approximately **30–90 seconds**.

### Simulation

Use class-specific physical values:

- full inertia,
- lateral drift,
- weaker reverse steering,
- prop walk,
- wind/current,
- draft and under-keel clearance,
- realistic stopping distances relative to game scale.

A later Master preset may reduce assists further, but it is not required for P4/P5.

## 8. Wayfinder prototype sequence

### P4 — Ship Dynamics

**Purpose:** prove the physics before investing in 3D art.

Use a minimal top-down diagnostic renderer. No production UI redesign and no Babylon.js requirement.

Required manoeuvres:

1. full ahead acceleration,
2. hard-port / hard-starboard turn,
3. crash stop,
4. reverse manoeuvre,
5. prop-walk demonstration,
6. lateral drift under wind/current,
7. same manoeuvre with empty vs laden vessel.

Compare at least Coaster, Handysize, Feeder and Panamax.

**P4 acceptance criteria:**

- deterministic replay from identical initial state/input stream,
- no NaN/infinite state values over long simulation runs,
- class behaviour is materially distinct,
- Panamax stops and turns substantially more slowly than Coaster,
- reverse control differs from forward control,
- lateral drift exists independently of heading,
- load state changes handling measurably,
- automated unit tests cover force composition and integration,
- no regression to existing campaign tests.

P4 code is experimental until these criteria are met.

### P5 — Browser 3D Harbour

**Purpose:** prove that the deterministic engine can drive a useful mobile 3D scene.

Preferred renderer: **Babylon.js**.

First scene must remain deliberately small:

- one harbour,
- one vessel,
- one berth,
- water,
- quay/collision geometry,
- bridge/chase/tactical cameras,
- rudder control,
- engine telegraph,
- minimal HUD.

Recommended first harbour for production-quality work: **Rotterdam**.

**P5 mobile target:**

- modern iPhone portrait/landscape usable,
- sustained >= 30 FPS under normal manoeuvring,
- progressive asset loading,
- avoid excessively large initial scene payload; target roughly <= 15–20 MB for the first scenario,
- simulator remains usable if WebGPU is unavailable and falls back to WebGL.

### P6 — Campaign Integration

Full vertical slice:

```text
contract
→ voyage
→ arrival
→ 3D harbour manoeuvre
→ damage/fuel/time result
→ settlement
→ persistent campaign state
```

P6 is the gate before replacing the existing production harbour experience.

## 9. Harbour scenario architecture

Do not hard-code future harbours into simulation code. Use data-driven scenarios.

```ts
interface HarbourScenario {
  id: string
  portId: PortId
  spawn: Pose
  berths: Berth[]
  depthMap: string
  collisionMesh: string
  currentZones: CurrentZone[]
  windPreset: WindPreset
  trafficRoutes: TrafficRoute[]
  environment: {
    timeOfDay: number
    weather: WeatherPreset
  }
  difficulty: number
}
```

Initial scenario progression after P5:

1. Rotterdam — open, learnable, scalable to large ships.
2. Hamburg — channel/terminal operations.
3. Singapore — current, islands, traffic and higher complexity.
4. New York — later expansion.

## 10. Bridge controls and HUD

Mobile control is a first-class constraint.

Recommended controls:

- left: large rudder lever or wheel input,
- right: engine telegraph with Ahead / Stop / Astern levels,
- optional bow-thruster control only on fitted ships,
- camera switch reachable with one thumb,
- no tiny desktop-style instrument panel required for essential control.

Minimum operational HUD for Simulation mode:

- speed over ground,
- heading,
- rate of turn,
- rudder angle,
- engine order,
- draft,
- depth / under-keel clearance when relevant,
- wind/current when active.

Radar is a later P5/P6 component but should be architecturally independent from the 3D camera.

## 11. Damage and campaign consequences

Collision response should evolve from the current flat condition penalty toward deterministic impact severity based on:

- relative contact speed,
- vessel mass/displacement,
- contact angle,
- obstacle type.

Potential campaign effects:

- hull condition,
- cargo damage,
- propulsion/rudder damage,
- repair cost,
- delay,
- reputation consequences.

Do not add subsystem damage until the base manoeuvring model is stable.

## 12. Candidate strategic improvements after P4/P5

Ports-of-Call analysis identified useful genre mechanics that fit Ocean Trader without copying implementation:

- multiple cargo parcels per vessel,
- voyage speed control (Eco / Cruise / Fast),
- mid-voyage diversion,
- freight reservations with deadline penalties,
- vessel maintenance policies,
- richer weather/operational events.

These are secondary to P4/P5. Do not expand the economic feature set while the new physics engine is still unproven.

## 13. Repository structure target

P4 should begin with a small structure and expand only when justified:

```text
src/
  simulation/
    engine.ts
    state.ts
    vessel-parameters.ts
    hydrodynamics.ts
    propulsion.ts
    environment.ts
    collision.ts

prototypes/
  wayfinder/
    p4-ship-dynamics/
```

P5 may add:

```text
src/
  simulator3d/
    scene.ts
    vessel-renderer.ts
    harbour-renderer.ts
    cameras.ts
    water.ts
    weather.ts

  simulator-ui/
    helm.tsx
    engine-telegraph.tsx
    hud.tsx
```

Prototype evidence belongs under `prototypes/wayfinder/`; production modules move under `src/` only after the relevant gate is passed.

## 14. Test strategy

Every physics change should prefer deterministic automated evidence over visual intuition alone.

Required categories:

- unit tests for force/parameter calculations,
- deterministic integration tests,
- manoeuvre benchmark tests,
- boundary/NaN stability tests,
- existing `npm test` regression suite,
- `npm run build` on every production-facing commit.

Add benchmark fixtures for representative manoeuvres. Store expected ranges rather than overfitting every floating-point sample.

Human usability evidence remains required before declaring touch manoeuvring production-ready.

## 15. Git workflow

`main` remains the stable production branch.

Simulator development starts on:

```text
feat/p4-ship-dynamics
```

Rules:

1. P4 experimental work stays on the feature branch.
2. Keep commits small and logically testable.
3. Do not remove the existing harbour implementation during P4.
4. Do not merge P4 merely because it renders correctly; acceptance criteria must be met.
5. P5 should normally begin only after P4 evidence is accepted.
6. Production integration should arrive through a reviewable merge/PR rather than direct replacement of `main`.

## 16. IP boundary

Ports of Call and its simulator versions are reference products only.

Do not copy or reproduce:

- source code,
- 3D models,
- textures,
- sounds,
- UI layouts,
- text/manual wording,
- proprietary harbour scenarios,
- distinctive artwork or branding.

Allowed direction: independently implement general maritime-simulation concepts such as 3-DOF vessel motion, bridge controls, weather effects, scenario architecture, radar concepts and difficulty presets.

Ocean Trader remains an independent product with original code, data, artwork, layouts and tuning.

## 17. Definition of next action

The next implementation task is **P4 — Ship Dynamics** on `feat/p4-ship-dynamics`.

Start with deterministic TypeScript physics and a diagnostic 2D view. Do **not** start with Babylon.js. The first technical question to prove is whether the four ship classes feel and measure materially different under the same manoeuvre inputs.
