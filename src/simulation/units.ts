import type { EnvironmentState, ManoeuvreState } from './state'

export const KNOTS_PER_MPS = 1.9438444924406
export const MPS_PER_KNOT = 1 / KNOTS_PER_MPS

const degToRad = (deg: number) => deg * Math.PI / 180
const radToDeg = (rad: number) => rad * 180 / Math.PI
const normalizeBearing = (deg: number) => ((deg % 360) + 360) % 360

/** Simulator math uses positive rotation/lateral axis to PORT; maritime bearings increase clockwise to STBD. */
export const maritimeBearingDeg = (worldAngleRad: number) => normalizeBearing(-radToDeg(worldAngleRad))
export const maritimeRotDegPerMin = (yawRateRadPerSec: number) => -radToDeg(yawRateRadPerSec) * 60

export type EnvironmentVectors = {
  windWorldX: number
  windWorldY: number
  currentWorldX: number
  currentWorldY: number
}

/** Convert maritime bearing (0° +X, 90° STBD) to the simulator world vector. */
export function vectorFromBearing(speed: number, bearingDeg: number) {
  const bearing = degToRad(bearingDeg)
  return { x: speed * Math.cos(bearing), y: -speed * Math.sin(bearing) }
}

/** Resolve canonical maritime environment fields plus legacy P4/P5.2 axis vectors. */
export function environmentVectors(environment: EnvironmentState): EnvironmentVectors {
  const canonicalWind = vectorFromBearing(environment.windSpeedMps ?? 0, (environment.windFromDeg ?? 0) + 180)
  const canonicalCurrent = vectorFromBearing(environment.currentSpeedMps ?? 0, environment.currentToDeg ?? 0)
  return {
    windWorldX: environment.windX ?? canonicalWind.x,
    windWorldY: environment.windY ?? canonicalWind.y,
    currentWorldX: environment.currentX ?? canonicalCurrent.x,
    currentWorldY: environment.currentY ?? canonicalCurrent.y,
  }
}

export type NavigationMetrics = {
  stwMps: number
  stwKnots: number
  sogMps: number
  sogKnots: number
  cogDeg: number
  waterWorldX: number
  waterWorldY: number
  groundWorldX: number
  groundWorldY: number
}

/**
 * STW derives only from water-relative surge/sway. SOG/COG add current in world
 * coordinates and therefore never feed back into hull/rudder hydrodynamics.
 */
export function navigationMetrics(state: Pick<ManoeuvreState, 'heading' | 'surge' | 'sway'>, environment: EnvironmentState): NavigationMetrics {
  const cos = Math.cos(state.heading)
  const sin = Math.sin(state.heading)
  const waterWorldX = state.surge * cos - state.sway * sin
  const waterWorldY = state.surge * sin + state.sway * cos
  const { currentWorldX, currentWorldY } = environmentVectors(environment)
  const groundWorldX = waterWorldX + currentWorldX
  const groundWorldY = waterWorldY + currentWorldY
  const stwMps = Math.hypot(state.surge, state.sway)
  const sogMps = Math.hypot(groundWorldX, groundWorldY)
  const cogDeg = sogMps < 1e-9 ? maritimeBearingDeg(state.heading) : maritimeBearingDeg(Math.atan2(groundWorldY, groundWorldX))
  return {
    stwMps,
    stwKnots: stwMps * KNOTS_PER_MPS,
    sogMps,
    sogKnots: sogMps * KNOTS_PER_MPS,
    cogDeg,
    waterWorldX,
    waterWorldY,
    groundWorldX,
    groundWorldY,
  }
}
