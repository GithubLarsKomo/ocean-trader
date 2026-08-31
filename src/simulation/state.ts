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
  surge: number
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

export type EnvironmentState = {
  windX: number
  windY: number
  currentX: number
  currentY: number
}

export type VesselLoadState = {
  cargoLoadRatio: number
  displacementTonnes: number
  draftMeters: number
  trim: number
}

export const calmEnvironment: EnvironmentState = {
  windX: 0,
  windY: 0,
  currentX: 0,
  currentY: 0,
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
