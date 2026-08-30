import type { ManoeuvreState } from '../simulation/state'
import type { P5HarbourScenario } from './rotterdam'

export type HarbourCollision = { kind: 'buoy' | 'quay'; id: string; severity: number }

const sq = (n: number) => n * n

export function detectHarbourCollision(
  state: ManoeuvreState,
  scenario: P5HarbourScenario,
  shipLength = 7.5,
  shipBeam = 2.1,
): HarbourCollision | null {
  const x = scenario.spawn.x + state.x * scenario.renderScale
  const z = scenario.spawn.z + state.y * scenario.renderScale
  const shipRadius = Math.max(shipBeam * .55, 1.15)

  for (const buoy of scenario.buoys) {
    if (sq(x - buoy.x) + sq(z - buoy.z) <= sq(shipRadius + buoy.radius)) {
      return { kind: 'buoy', id: buoy.id, severity: Math.min(1, Math.hypot(state.surge, state.sway) / 2.4) }
    }
  }

  const halfL = shipLength * .43
  const halfB = shipBeam * .55
  const c = Math.cos(state.heading)
  const s = Math.sin(state.heading)
  const samples = [
    [halfL, 0], [-halfL, 0], [0, halfB], [0, -halfB],
    [halfL * .75, halfB], [halfL * .75, -halfB], [-halfL * .75, halfB], [-halfL * .75, -halfB],
  ]
  for (const [lx, lz] of samples) {
    const px = x + lx * c - lz * s
    const pz = z + lx * s + lz * c
    for (let i = 0; i < scenario.quays.length; i += 1) {
      const q = scenario.quays[i]
      if (Math.abs(px - q.x) <= q.length / 2 && Math.abs(pz - q.z) <= q.width / 2) {
        return { kind: 'quay', id: `quay-${i}`, severity: Math.min(1, Math.hypot(state.surge, state.sway) / 1.8) }
      }
    }
  }
  return null
}

export function resolveHarbourCollision(previous: ManoeuvreState, attempted: ManoeuvreState, collision: HarbourCollision): ManoeuvreState {
  const damage = collision.kind === 'quay' ? 1.5 + collision.severity * 6 : .25 + collision.severity * 1.5
  return {
    ...previous,
    surge: -attempted.surge * (collision.kind === 'quay' ? .12 : .28),
    sway: -attempted.sway * .2,
    yawRate: attempted.yawRate * .35,
    condition: Math.max(0, previous.condition - damage),
    elapsed: attempted.elapsed,
    throttle: attempted.throttle,
    rudder: attempted.rudder,
  }
}
