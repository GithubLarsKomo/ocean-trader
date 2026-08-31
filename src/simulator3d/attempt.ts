import { ENGINE_ORDER_TARGETS, engineOrderFromLegacyThrottle } from '../simulation/forces/propulsion'
import { initialManoeuvreState, type EngineOrder, type ManoeuvreInput, type ManoeuvreState } from '../simulation/state'
import type { HarbourOperationState } from './operations'

export type HarbourAttempt = {
  version: 2
  vesselId: string
  state: ManoeuvreState
  operation: HarbourOperationState
  input: ManoeuvreInput
}

type StoredAttempt = Partial<Omit<HarbourAttempt, 'version' | 'state' | 'input'>> & {
  version?: 1 | 2
  state?: Partial<ManoeuvreState> & { throttle?: number }
  input?: Partial<ManoeuvreInput>
}

const prefix = 'ocean-trader.harbour-attempt.v2:'
const legacyPrefix = 'ocean-trader.harbour-attempt.v1:'
export const attemptKey = (vesselId: string) => `${prefix}${vesselId}`
const legacyAttemptKey = (vesselId: string) => `${legacyPrefix}${vesselId}`
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isEngineOrder = (value: unknown): value is EngineOrder => typeof value === 'string' && value in ENGINE_ORDER_TARGETS

function normalizeInput(value: StoredAttempt['input']): ManoeuvreInput | null {
  if (!value || !finite(value.rudder)) return null
  if (isEngineOrder(value.engineOrder)) return { engineOrder: value.engineOrder, rudder: value.rudder }
  if (finite(value.throttle)) return { engineOrder: engineOrderFromLegacyThrottle(value.throttle), rudder: value.rudder }
  return null
}

function normalizeState(value: StoredAttempt['state'], input: ManoeuvreInput): ManoeuvreState | null {
  if (
    !value
    || !finite(value.x)
    || !finite(value.y)
    || !finite(value.heading)
    || !finite(value.surge)
    || !finite(value.sway)
    || !finite(value.yawRate)
    || !finite(value.condition)
  ) return null

  const engineOrder = isEngineOrder(value.engineOrder) ? value.engineOrder : input.engineOrder ?? engineOrderFromLegacyThrottle(input.throttle ?? 0)
  const legacyShaft = finite(value.throttle) ? Math.max(-1, Math.min(1, value.throttle)) : 0
  const shaftDemand = finite(value.shaftDemand) ? value.shaftDemand : ENGINE_ORDER_TARGETS[engineOrder]
  const shaftActual = finite(value.shaftActual) ? value.shaftActual : legacyShaft || shaftDemand
  const baseline = initialManoeuvreState(value.condition)

  return {
    ...baseline,
    x: value.x,
    y: value.y,
    heading: value.heading,
    surge: value.surge,
    sway: value.sway,
    yawRate: value.yawRate,
    rudder: finite(value.rudder) ? value.rudder : input.rudder,
    engineOrder,
    shaftDemand,
    shaftActual,
    reversalDelayRemaining: finite(value.reversalDelayRemaining) ? Math.max(0, value.reversalDelayRemaining) : 0,
    condition: value.condition,
    elapsed: finite(value.elapsed) ? value.elapsed : 0,
  }
}

export function loadHarbourAttempt(storage: Pick<Storage, 'getItem'>, vesselId: string): HarbourAttempt | null {
  const raw = storage.getItem(attemptKey(vesselId)) ?? storage.getItem(legacyAttemptKey(vesselId))
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as StoredAttempt
    if ((value.version !== 1 && value.version !== 2) || value.vesselId !== vesselId || !value.operation) return null
    const input = normalizeInput(value.input)
    if (!input) return null
    const state = normalizeState(value.state, input)
    if (!state) return null
    return { version: 2, vesselId, state, operation: value.operation, input }
  } catch { return null }
}

export function saveHarbourAttempt(storage: Pick<Storage, 'setItem'>, attempt: HarbourAttempt) {
  storage.setItem(attemptKey(attempt.vesselId), JSON.stringify(attempt))
}

export function clearHarbourAttempt(storage: Pick<Storage, 'removeItem'>, vesselId: string) {
  storage.removeItem(attemptKey(vesselId))
  storage.removeItem(legacyAttemptKey(vesselId))
}
