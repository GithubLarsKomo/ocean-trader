export type EngineOrder =
  | 'FULL_ASTERN'
  | 'HALF_ASTERN'
  | 'SLOW_ASTERN'
  | 'DEAD_SLOW_ASTERN'
  | 'STOP'
  | 'DEAD_SLOW_AHEAD'
  | 'SLOW_AHEAD'
  | 'HALF_AHEAD'
  | 'FULL_AHEAD'

export type ManoeuvreState = {
  x: number
  y: number
  heading: number
  /** Water-relative longitudinal speed in m/s. */
  surge: number
  /** Water-relative lateral speed in m/s. */
  sway: number
  yawRate: number
  rudder: number
  bowThruster: number
  engineOrder: EngineOrder
  shaftDemand: number
  shaftActual: number
  reversalDelayRemaining: number
  condition: number
  elapsed: number
}

export type ManoeuvreInput = {
  rudder: number
  bowThruster?: number
  engineOrder?: EngineOrder
  /** Compatibility input for P4 benchmarks and persisted pre-P5.3 attempts. */
  throttle?: number
}

/**
 * Maritime environment in simulator navigation coordinates:
 * heading/bearing 0° is world +X, 90° is world +Y, positive clockwise/starboard.
 * Wind direction follows maritime convention (direction FROM); current uses direction TO.
 * Legacy vector fields remain temporarily supported for P4/P5.2 benchmark compatibility.
 */
export type EnvironmentState = {
  windSpeedMps?: number
  windFromDeg?: number
  currentSpeedMps?: number
  currentToDeg?: number
  windX?: number
  windY?: number
  currentX?: number
  currentY?: number
}

export type VesselLoadState = {
  cargoLoadRatio: number
  displacementTonnes: number
  draftMeters: number
  trim: number
}

export const calmEnvironment: EnvironmentState = {
  windSpeedMps: 0,
  windFromDeg: 0,
  currentSpeedMps: 0,
  currentToDeg: 0,
}

export function initialManoeuvreState(condition = 100): ManoeuvreState {
  return {
    x: 0,
    y: 0,
    heading: 0,
    surge: 0,
    sway: 0,
    yawRate: 0,
    rudder: 0,
    bowThruster: 0,
    engineOrder: 'STOP',
    shaftDemand: 0,
    shaftActual: 0,
    reversalDelayRemaining: 0,
    condition,
    elapsed: 0,
  }
}
