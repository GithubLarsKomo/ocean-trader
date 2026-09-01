import type { ManoeuvreState } from '../state'
import type { VesselParameters } from '../vessel-parameters'

export type RudderForces = {
  swayForce: number
  yawMoment: number
  effectiveFlow: number
}

const sign = (value: number) => value > 1e-6 ? 1 : value < -1e-6 ? -1 : 0

/**
 * Rudder force is generated only by actual water-relative vessel motion over
 * the blade. Shaft rotation / propeller wash alone must not rotate a vessel
 * that is still stopped in the water.
 *
 * Simulator body/world convention: positive lateral/yaw is PORT (mathematical
 * counter-clockwise); bridge command convention: positive rudder is STBD.
 * Therefore a positive/STBD helm produces a port force at the stern and a
 * negative/starboard yaw moment at the vessel CG.
 */
export function rudderForces(
  state: Pick<ManoeuvreState, 'surge'>,
  rudder: number,
  _shaftActual: number,
  vessel: VesselParameters,
): RudderForces {
  const shipFlow = Math.abs(state.surge)
  const effectiveFlow = Math.min(vessel.rudderFlowCap, shipFlow)

  if (effectiveFlow < 1e-6 || Math.abs(rudder) < 1e-6) return { swayForce: 0, yawMoment: 0, effectiveFlow }

  const direction = sign(state.surge)
  const rudderEffect = rudder * vessel.rudderForceFactor * effectiveFlow * effectiveFlow * direction

  return {
    swayForce: rudderEffect * vessel.rudderSwayFactor,
    yawMoment: -rudderEffect * vessel.rudderLeverArm,
    effectiveFlow,
  }
}
