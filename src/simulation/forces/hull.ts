import type { ManoeuvreState } from '../state'
import type { VesselParameters } from '../vessel-parameters'

export type HullForces = {
  surgeForce: number
  swayForce: number
  yawMoment: number
}

/**
 * Low-speed 3-DOF hull resistance model.
 *
 * Forces are deliberately compact rather than CFD-derived, but keep the
 * important manoeuvring behaviour: nonlinear drag plus sway/yaw coupling.
 * Coupling terms oppose the existing motion instead of creating energy.
 */
export function hullForces(state: Pick<ManoeuvreState, 'surge' | 'sway' | 'yawRate'>, vessel: VesselParameters): HullForces {
  const u = state.surge
  const v = state.sway
  const r = state.yawRate

  const surgeForce = -vessel.surgeDragLinear * u - vessel.surgeDragQuadratic * Math.abs(u) * u
  const swayForce = -vessel.swayDragLinear * v
    - vessel.swayDragQuadratic * Math.abs(v) * v
    - vessel.swayYawCoupling * r
  const yawMoment = -vessel.yawDragLinear * r
    - vessel.yawDragQuadratic * Math.abs(r) * r
    - vessel.yawSwayCoupling * v

  return { surgeForce, swayForce, yawMoment }
}
