import type { ManoeuvreState, VesselLoadState } from '../simulation/state'
import type { VesselParameters } from '../simulation/vessel-parameters'
import type { P5HarbourScenario } from './rotterdam'

export type HarbourOperationState = {
  collisions: number
  damage: number
  docked: boolean
  contactActive: boolean
  message: string
}

export const initialHarbourOperationState = (): HarbourOperationState => ({ collisions: 0, damage: 0, docked: false, contactActive: false, message: 'Approach berth' })

const pointInBox = (x: number, z: number, box: { x: number; z: number; length: number; width: number }, margin = 0) =>
  Math.abs(x - box.x) <= box.length / 2 + margin && Math.abs(z - box.z) <= box.width / 2 + margin

const angleDelta = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
const distance2 = (ax: number, az: number, bx: number, bz: number) => (ax - bx) ** 2 + (az - bz) ** 2

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
  const hitBuoy = scenario.buoys.find(b => distance2(x, z, b.x, b.z) <= (shipMargin + b.radius) ** 2)
  const contactKind = hitQuay ? 'quay' : hitBuoy ? 'buoy' : null

  if (contactKind) {
    if (operation.contactActive) {
      return {
        state: { ...previous, surge: Math.min(0, previous.surge), sway: previous.sway * .5, yawRate: previous.yawRate * .5 },
        operation,
      }
    }
    const massImpact = Math.max(1, speed * load.displacementTonnes / 5500)
    const impact = contactKind === 'quay' ? Math.min(18, massImpact) : Math.min(4, .35 + massImpact * .22)
    const rebound = contactKind === 'quay' ? .12 : .24
    return {
      state: { ...previous, surge: -previous.surge * rebound, sway: -previous.sway * rebound, yawRate: previous.yawRate * .3, condition: Math.max(0, previous.condition - impact) },
      operation: {
        ...operation,
        contactActive: true,
        collisions: operation.collisions + 1,
        damage: operation.damage + impact,
        message: contactKind === 'quay' ? `Quay contact · damage ${impact.toFixed(1)}%` : `Navigation buoy struck · damage ${impact.toFixed(1)}%`,
      },
    }
  }

  const released = operation.contactActive ? { ...operation, contactActive: false } : operation
  const inBerth = pointInBox(x, z, scenario.berth, 0)
  const aligned = angleDelta(state.heading, scenario.berth.heading) < .18
  const slow = speed < .22
  if (inBerth && aligned && slow) {
    return { state: { ...state, surge: 0, sway: 0, yawRate: 0 }, operation: { ...released, docked: true, message: 'All fast · berth secured' } }
  }

  return { state, operation: { ...released, message: speed > .8 ? 'Reduce speed for berth approach' : 'Approach berth' } }
}
