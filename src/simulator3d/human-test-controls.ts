import type { ManoeuvreInput } from '../simulation/state'

export const MAX_RUDDER_DEG = 35

export type RudderSide = 'PORT' | 'MID' | 'STBD'

export type RudderPresentation = {
  normalized: number
  side: RudderSide
  degrees: number
  label: string
  cssRotationDeg: number
  /**
   * Adapter for the current scene renderer, which still applies a legacy minus
   * sign when rotating the rudder mesh. Keep the sign correction here so every
   * user-facing rudder visualization is derived from one convention.
   */
  rendererRudderInput: number
}

const clamp = (value: number) => Math.max(-1, Math.min(1, Number.isFinite(value) ? value : 0))

/** Positive normalized helm is always STBD; negative is PORT. */
export function rudderPresentation(value: number): RudderPresentation {
  const normalized = clamp(value)
  const side: RudderSide = Math.abs(normalized) < .025 ? 'MID' : normalized < 0 ? 'PORT' : 'STBD'
  const degrees = Math.round(Math.abs(normalized) * MAX_RUDDER_DEG)
  return {
    normalized,
    side,
    degrees,
    label: side === 'MID' ? 'MID' : `${side} ${degrees}°`,
    cssRotationDeg: normalized * MAX_RUDDER_DEG,
    rendererRudderInput: -normalized,
  }
}

/**
 * Restored manoeuvres keep physical motion, damage and shaft state, but never
 * resume with an active bridge command merely because the page was opened.
 */
export function neutralBridgeInput(): ManoeuvreInput {
  return { engineOrder: 'STOP', rudder: 0, bowThruster: 0 }
}

export function startGateMessage(restored: boolean): string {
  return restored
    ? 'PAUSED · manoeuvre restored · use a bridge control to resume'
    : 'BRIDGE READY · use a bridge control to start'
}
