import type { ManoeuvreState } from '../state'
import type { VesselParameters } from '../vessel-parameters'

export type PropWalkForces = {
  swayForce: number
  yawMoment: number
}

export function propWalkForces(state: ManoeuvreState, shaftActual: number, vessel: VesselParameters): PropWalkForces {
  const shaft = Math.max(-1, Math.min(1, shaftActual))
  if (Math.abs(shaft) < 1e-8) return { swayForce: 0, yawMoment: 0 }

  // Right-handed single screw: astern transverse thrust walks the stern to port,
  // producing a starboard bow/yaw. Ahead transverse thrust is much weaker and opposite.
  const handedness = vessel.propellerHandedness === 'right' ? 1 : -1
  const astern = shaft < 0
  const directionFactor = astern ? 1 : vessel.propWalkAheadFactor
  const speedAttenuation = 1 / (1 + Math.abs(state.surge) * vessel.propWalkSpeedDecay)
  const magnitude = vessel.propWalkStrength * Math.abs(shaft) * directionFactor * speedAttenuation
  const swayForce = (astern ? -handedness : handedness) * magnitude

  // The transverse propeller force acts near the stern. In the normalized 3-DOF
  // model, the longitudinal stern lever converts that side force into yaw moment.
  const yawMoment = -swayForce * vessel.propWalkLeverArm
  return { swayForce, yawMoment }
}
