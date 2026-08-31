import type { EnvironmentState, ManoeuvreState } from '../state'
import type { VesselParameters } from '../vessel-parameters'
import { environmentVectors, navigationMetrics } from '../units'

export type WindForces = {
  swayForce: number
  yawMoment: number
  apparentForwardMps: number
  apparentLateralMps: number
  apparentSpeedMps: number
}

const WIND_FORCE_SCALE = .00012

/**
 * Compact apparent-wind model for low-speed harbour manoeuvring.
 * True wind is resolved in world coordinates, ship ground velocity is removed,
 * then the apparent air vector is transformed into vessel body coordinates.
 * Positive lateral force pushes the vessel to starboard. The center of effort
 * is aft of CG, so that same force produces an opposing (port) yaw moment.
 */
export function windForces(
  state: Pick<ManoeuvreState, 'heading' | 'surge' | 'sway'>,
  environment: EnvironmentState,
  vessel: VesselParameters,
): WindForces {
  const vectors = environmentVectors(environment)
  const navigation = navigationMetrics(state, environment)
  const apparentWorldX = vectors.windWorldX - navigation.groundWorldX
  const apparentWorldY = vectors.windWorldY - navigation.groundWorldY
  const cos = Math.cos(state.heading)
  const sin = Math.sin(state.heading)
  const apparentForwardMps = apparentWorldX * cos + apparentWorldY * sin
  const apparentLateralMps = -apparentWorldX * sin + apparentWorldY * cos
  const apparentSpeedMps = Math.hypot(apparentForwardMps, apparentLateralMps)

  const swayForce = apparentLateralMps * Math.abs(apparentLateralMps) * vessel.windage * WIND_FORCE_SCALE
  const yawMoment = -swayForce * vessel.windYawArm
  return { swayForce, yawMoment, apparentForwardMps, apparentLateralMps, apparentSpeedMps }
}
