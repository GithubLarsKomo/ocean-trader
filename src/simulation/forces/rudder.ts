import type { ManoeuvreState } from '../state'
import type { VesselParameters } from '../vessel-parameters'

export type RudderForces = {
  swayForce: number
  yawMoment: number
  effectiveFlow: number
}

const sign = (value: number) => value > 1e-6 ? 1 : value < -1e-6 ? -1 : 0

/**
 * Rudder force from water flow over the blade rather than a direct yaw command.
 * Ahead propeller wash keeps the rudder useful at very low ship speed; with
 * STOP and zero vessel speed the rudder produces no force.
 *
 * Simulator body/world convention: positive lateral/yaw is PORT (mathematical
 * counter-clockwise); bridge command convention: positive rudder is STBD.
 * Therefore a positive/STBD helm produces a port force at the stern and a
 * negative/starboard yaw moment at the vessel CG.
 */
export function rudderForces(
  state: Pick<ManoeuvreState, 'surge'>,
  rudder: number,
  shaftActual: number,
  vessel: VesselParameters,
): RudderForces {
  const shipFlow = Math.abs(state.surge)
  const aheadWash = Math.max(0, shaftActual) * vessel.propWashFactor
  const asternWash = Math.max(0, -shaftActual) * vessel.propWashFactor * vessel.asternRudderWashFactor
  const effectiveFlow = Math.min(vessel.rudderFlowCap, shipFlow + aheadWash + asternWash)

  if (effectiveFlow < 1e-6 || Math.abs(rudder) < 1e-6) return { swayForce: 0, yawMoment: 0, effectiveFlow }

  const direction = sign(state.surge) || sign(shaftActual) || 1
  const rudderEffect = rudder * vessel.rudderForceFactor * effectiveFlow * effectiveFlow * direction

  return {
    swayForce: rudderEffect * vessel.rudderSwayFactor,
    yawMoment: -rudderEffect * vessel.rudderLeverArm,
    effectiveFlow,
  }
}
