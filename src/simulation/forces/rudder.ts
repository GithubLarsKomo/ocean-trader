import type { ManoeuvreState } from '../state'
import type { VesselParameters } from '../vessel-parameters'

export type RudderForces = {
  swayForce: number
  yawMoment: number
  effectiveFlow: number
}

const sign = (value: number) => value > 1e-6 ? 1 : value < -1e-6 ? -1 : 0
const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

// Human-test calibration: the vessel must have actual water-relative way before
// propeller wash can augment the rudder. Wash then ramps in progressively so
// steering becomes useful at harbour speed without resurrecting a zero-way pivot.
const RUDDER_WASH_MIN_WAY_MPS = .02
const RUDDER_WASH_FULL_WAY_MPS = .30
const LOW_SPEED_PROP_WASH_GAIN = 3.25

/**
 * Rudder force requires actual water-relative vessel motion over the blade.
 * Shaft rotation / propeller wash alone must not rotate a vessel that is still
 * stopped in the water. Once the vessel has way on, propeller wash augments
 * the local rudder inflow and restores useful low-speed steering authority.
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
  if (shipFlow < RUDDER_WASH_MIN_WAY_MPS || Math.abs(rudder) < 1e-6) {
    return { swayForce: 0, yawMoment: 0, effectiveFlow: shipFlow }
  }

  const washGate = clamp01(
    (shipFlow - RUDDER_WASH_MIN_WAY_MPS) /
    (RUDDER_WASH_FULL_WAY_MPS - RUDDER_WASH_MIN_WAY_MPS),
  )
  const aheadWash = Math.max(0, shaftActual) * vessel.propWashFactor * LOW_SPEED_PROP_WASH_GAIN * washGate
  const asternWash = Math.max(0, -shaftActual) * vessel.propWashFactor * vessel.asternRudderWashFactor * LOW_SPEED_PROP_WASH_GAIN * washGate
  const effectiveFlow = Math.min(vessel.rudderFlowCap, shipFlow + aheadWash + asternWash)
  const direction = sign(state.surge)
  const rudderEffect = rudder * vessel.rudderForceFactor * effectiveFlow * effectiveFlow * direction

  return {
    swayForce: rudderEffect * vessel.rudderSwayFactor,
    yawMoment: -rudderEffect * vessel.rudderLeverArm,
    effectiveFlow,
  }
}
