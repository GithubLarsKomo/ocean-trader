import { ENGINE_ORDER_TARGETS, engineOrderFromLegacyThrottle } from '../simulation/forces/propulsion'
import { initialManoeuvreState, type EngineOrder, type ManoeuvreInput, type ManoeuvreState } from '../simulation/state'
import { initialHarbourOperationState, type BerthingMetrics, type HarbourOperationState } from './operations'

export type HarbourAttempt = {
  version: 2
  vesselId: string
  state: ManoeuvreState
  operation: HarbourOperationState
  input: ManoeuvreInput
}

type StoredOperation = Partial<HarbourOperationState> & { lastBerthingMetrics?: Partial<BerthingMetrics> }
type StoredAttempt = Partial<Omit<HarbourAttempt, 'version' | 'state' | 'input' | 'operation'>> & {
  version?: 1 | 2
  state?: Partial<ManoeuvreState> & { throttle?: number }
  operation?: StoredOperation
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
  if (isEngineOrder(value.engineOrder)) return { engineOrder: value.engineOrder, rudder: value.rudder, bowThruster: 0 }
  if (finite(value.throttle)) return { engineOrder: engineOrderFromLegacyThrottle(value.throttle), rudder: value.rudder, bowThruster: 0 }
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
    bowThruster: 0,
    engineOrder,
    shaftDemand,
    shaftActual,
    reversalDelayRemaining: finite(value.reversalDelayRemaining) ? Math.max(0, value.reversalDelayRemaining) : 0,
    condition: value.condition,
    elapsed: finite(value.elapsed) ? value.elapsed : 0,
  }
}

function normalizeMetrics(value: StoredOperation['lastBerthingMetrics']): BerthingMetrics | undefined {
  if (
    !value
    || !finite(value.longitudinalErrorUnits)
    || !finite(value.lateralErrorUnits)
    || !finite(value.headingErrorDeg)
    || !finite(value.longitudinalSpeedMps)
    || !finite(value.lateralSpeedMps)
    || !finite(value.yawRateDegPerSec)
  ) return undefined
  return {
    longitudinalErrorUnits: Math.max(0, value.longitudinalErrorUnits),
    lateralErrorUnits: Math.max(0, value.lateralErrorUnits),
    headingErrorDeg: Math.max(0, value.headingErrorDeg),
    longitudinalSpeedMps: value.longitudinalSpeedMps,
    lateralSpeedMps: value.lateralSpeedMps,
    yawRateDegPerSec: Math.max(0, value.yawRateDegPerSec),
  }
}

function normalizeOperation(value: StoredAttempt['operation']): HarbourOperationState | null {
  if (!value) return null
  const baseline = initialHarbourOperationState()
  if (
    value.collisions !== undefined && !finite(value.collisions)
    || value.damage !== undefined && !finite(value.damage)
    || value.docked !== undefined && typeof value.docked !== 'boolean'
    || value.contactActive !== undefined && typeof value.contactActive !== 'boolean'
    || value.berthStableSeconds !== undefined && !finite(value.berthStableSeconds)
    || value.message !== undefined && typeof value.message !== 'string'
  ) return null
  return {
    ...baseline,
    collisions: finite(value.collisions) ? Math.max(0, Math.floor(value.collisions)) : baseline.collisions,
    damage: finite(value.damage) ? Math.max(0, value.damage) : baseline.damage,
    docked: typeof value.docked === 'boolean' ? value.docked : baseline.docked,
    contactActive: typeof value.contactActive === 'boolean' ? value.contactActive : baseline.contactActive,
    berthStableSeconds: finite(value.berthStableSeconds) ? Math.max(0, value.berthStableSeconds) : 0,
    message: typeof value.message === 'string' ? value.message : baseline.message,
    lastBerthingMetrics: normalizeMetrics(value.lastBerthingMetrics),
  }
}

export function loadHarbourAttempt(storage: Pick<Storage, 'getItem'>, vesselId: string): HarbourAttempt | null {
  const raw = storage.getItem(attemptKey(vesselId)) ?? storage.getItem(legacyAttemptKey(vesselId))
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as StoredAttempt
    if ((value.version !== 1 && value.version !== 2) || value.vesselId !== vesselId) return null
    const input = normalizeInput(value.input)
    if (!input) return null
    const state = normalizeState(value.state, input)
    if (!state) return null
    const operation = normalizeOperation(value.operation)
    if (!operation) return null
    return { version: 2, vesselId, state, operation, input }
  } catch { return null }
}

export function saveHarbourAttempt(storage: Pick<Storage, 'setItem'>, attempt: HarbourAttempt) {
  const safeAttempt: HarbourAttempt = {
    ...attempt,
    state: { ...attempt.state, bowThruster: 0 },
    input: { ...attempt.input, bowThruster: 0 },
  }
  storage.setItem(attemptKey(attempt.vesselId), JSON.stringify(safeAttempt))
}

export function clearHarbourAttempt(storage: Pick<Storage, 'removeItem'>, vesselId: string) {
  storage.removeItem(attemptKey(vesselId))
  storage.removeItem(legacyAttemptKey(vesselId))
}
