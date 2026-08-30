import type { ManoeuvreInput, ManoeuvreState } from '../simulation/state'
import type { HarbourOperationState } from './operations'

export type HarbourAttempt = {
  version: 1
  vesselId: string
  state: ManoeuvreState
  operation: HarbourOperationState
  input: ManoeuvreInput
}

const prefix = 'ocean-trader.harbour-attempt.v1:'
export const attemptKey = (vesselId: string) => `${prefix}${vesselId}`

export function loadHarbourAttempt(storage: Pick<Storage, 'getItem'>, vesselId: string): HarbourAttempt | null {
  const raw = storage.getItem(attemptKey(vesselId))
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<HarbourAttempt>
    if (value.version !== 1 || value.vesselId !== vesselId || !value.state || !value.operation || !value.input) return null
    const numbers = [value.state.x, value.state.y, value.state.heading, value.state.surge, value.state.sway, value.state.yawRate, value.state.condition, value.input.throttle, value.input.rudder]
    if (!numbers.every(Number.isFinite)) return null
    return value as HarbourAttempt
  } catch { return null }
}

export function saveHarbourAttempt(storage: Pick<Storage, 'setItem'>, attempt: HarbourAttempt) {
  storage.setItem(attemptKey(attempt.vesselId), JSON.stringify(attempt))
}

export function clearHarbourAttempt(storage: Pick<Storage, 'removeItem'>, vesselId: string) {
  storage.removeItem(attemptKey(vesselId))
}
