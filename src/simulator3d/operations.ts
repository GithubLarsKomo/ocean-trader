import type { ManoeuvreState, VesselLoadState } from '../simulation/state'
import type { VesselParameters } from '../simulation/vessel-parameters'
import type { P5HarbourScenario } from './rotterdam'

export type HarbourOperationState = {
  collisions: number
  damage: number
  docked: boolean
  message: string
}

export const initialHarbourOperationState = (): HarbourOperationState => ({ collisions: 0, damage: 0, docked: false, message: 'Approach berth' })

const pointInBox = (x: number, z: number, box: { x: number; z: number; length: number; width: number }, margin = 0) =>
  Math.abs(x - box.x) <= box.length / 2 + margin && Math.abs(z - box.z) <= box.width / 2 + margin

const angleDelta = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))

export function evaluateHarbourOperation(
  state: ManoeuvreState,
  previous: ManoeuvreState,
  vessel: VesselParameters,
  load: VesselLoadState,
  scenario: P5HarbourScenario,
  operation: HarbourOperationState,
): { state: ManoeuvreState; operation: HarbourOperationState } {
  const x = scenario.spawn.x + state.x * scenario.renderScale
  const z = scenario.spawn.z + state.y * scenario.renderScale
  const speed = Math.hypot(state.surge, state.sway)
  const shipMargin = Math.max(1.1, vessel.beamMeters / 24)
  const hitQuay = scenario.quays.some(q => pointInBox(x, z, q, shipMargin))

  if (hitQuay) {
    const impact = Math.min(18, Math.max(1, speed * load.displacementTonnes / 5500))
    return {
      state: { ...previous, surge: -previous.surge * .12, sway: -previous.sway * .12, yawRate: previous.yawRate * .25, condition: Math.max(0, previous.condition - impact) },
      operation: { ...operation, collisions: operation.collisions + 1, damage: operation.damage + impact, message: `Quay contact · damage ${impact.toFixed(1)}%` },
    }
  }

  const inBerth = pointInBox(x, z, scenario.berth, 0)
  const aligned = angleDelta(state.heading, scenario.berth.heading) < .18
  const slow = speed < .22
  if (inBerth && aligned && slow) {
    return { state: { ...state, surge: 0, sway: 0, yawRate: 0 }, operation: { ...operation, docked: true, message: 'All fast · berth secured' } }
  }

  return { state, operation: { ...operation, message: speed > .8 ? 'Reduce speed for berth approach' : 'Approach berth' } }
}
