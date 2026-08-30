# P6 — Campaign Integration

**Status:** active vertical slice  
**Branch:** `feat/p6-campaign-integration`  
**Baseline:** P5 completion merged to `main`

## Goal

Connect the strategic campaign to the deterministic 3D harbour simulator without duplicating settlement logic.

```text
contract
→ voyage
→ arrivalPending
→ 3D harbour manoeuvre
→ docking / collision result
→ completeHarbourArrival()
→ cash / reputation / condition / port / contract settlement
→ saveState()
→ return to campaign
```

## Architectural rule

`completeHarbourArrival()` remains the only authoritative arrival settlement. The 3D simulator provides a resulting vessel condition and a successful docking signal; it does not independently calculate campaign revenue, reputation, contract completion, destination ownership, or voyage removal.

## Implemented slice

- pending-arrival routing from mobile fleet CTA into `/p5.html?vessel=<id>`
- desktop critical-arrival card can open the same 3D path
- existing 2D harbour remains available as fallback when routing cannot resolve an arrival
- campaign save is loaded through existing storage migration path
- simulator vessel class comes from campaign vessel
- simulator load ratio derives from contract tonnes / vessel capacity
- starting hull condition comes from campaign vessel condition
- successful docking settles once through `completeHarbourArrival()`
- resulting campaign is saved through `saveState()`
- return action becomes available only after settlement
- standalone `/p5.html` remains a training mode when no vessel query is supplied
- automated adapter tests cover pending-arrival loading and settlement

## P6 acceptance evidence

Required before replacing the production harbour path:

1. CI tests and build green.
2. One complete campaign contract can be played through the 3D arrival and persists after page reload.
3. Collision damage changes the settled vessel condition.
4. Settlement cannot happen twice for the same voyage.
5. Back/refresh during an unfinished manoeuvre does not settle the voyage.
6. Mobile landscape controls remain usable on a physical phone.
7. Existing 2D fallback remains available until human usability evidence is accepted.

## Not claimed yet

- physical-device FPS evidence
- human usability acceptance
- final Rotterdam production art
- radar/weather/traffic production completeness
- replacement/removal of the legacy 2D harbour
