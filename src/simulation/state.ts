export type ManoeuvreState = {
  x: number
  y: number
  heading: number
  surge: number
  sway: number
  yawRate: number
  throttle: number
  rudder: number
  condition: number
  elapsed: number
}

export type ManoeuvreInput = {
  throttle: number
  rudder: number
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
    throttle: 0,
    rudder: 0,
    condition,
    elapsed: 0,
  }
}
