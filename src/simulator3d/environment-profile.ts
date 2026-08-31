import type { EnvironmentState } from '../simulation/state'

export type HarbourEnvironmentMode = 'baseline' | 'cross'

/**
 * Default P5.3 human-test environment. The manoeuvring core is assessed without
 * cross-track forcing so thrust/rudder/thruster direction is immediately legible.
 * Cross-wind/current remain available as an explicit stress profile.
 */
export const BASELINE_HARBOUR_ENVIRONMENT: EnvironmentState = {
  windSpeedMps: 0,
  windFromDeg: 0,
  currentSpeedMps: 0,
  currentToDeg: 0,
}

/** Original P5.3-E Rotterdam reference forcing used for the environment stress test. */
export const CROSS_HARBOUR_ENVIRONMENT: EnvironmentState = {
  windSpeedMps: 5.5,
  windFromDeg: 240,
  currentSpeedMps: .25,
  currentToDeg: 105,
}

export function selectHarbourEnvironment(requested: string | null | undefined, campaignArrival: boolean) {
  // Campaign arrivals stay on the stable human-acceptance baseline. Standalone
  // training may explicitly opt into the cross-environment stress test.
  const mode: HarbourEnvironmentMode = !campaignArrival && requested === 'cross' ? 'cross' : 'baseline'
  return {
    mode,
    environment: mode === 'cross' ? CROSS_HARBOUR_ENVIRONMENT : BASELINE_HARBOUR_ENVIRONMENT,
  }
}
