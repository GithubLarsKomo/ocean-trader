import type { EngineOrder, ManoeuvreInput, ManoeuvreState } from '../state'
import type { VesselParameters } from '../vessel-parameters'

export const ENGINE_ORDER_TARGETS: Record<EngineOrder, number> = {
  FULL_ASTERN: -1,
  HALF_ASTERN: -.6,
  SLOW_ASTERN: -.35,
  DEAD_SLOW_ASTERN: -.18,
  STOP: 0,
  DEAD_SLOW_AHEAD: .15,
  SLOW_AHEAD: .3,
  HALF_AHEAD: .6,
  FULL_AHEAD: 1,
}

const ordered: EngineOrder[] = [
  'FULL_ASTERN',
  'HALF_ASTERN',
  'SLOW_ASTERN',
  'DEAD_SLOW_ASTERN',
  'STOP',
  'DEAD_SLOW_AHEAD',
  'SLOW_AHEAD',
  'HALF_AHEAD',
  'FULL_AHEAD',
]

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const sign = (value: number) => value > 1e-6 ? 1 : value < -1e-6 ? -1 : 0

export function engineOrderFromLegacyThrottle(throttle: number): EngineOrder {
  const value = clamp(throttle, -1, 1)
  return ordered.reduce((best, order) =>
    Math.abs(ENGINE_ORDER_TARGETS[order] - value) < Math.abs(ENGINE_ORDER_TARGETS[best] - value) ? order : best,
  'STOP' as EngineOrder)
}

export function commandFromInput(input: ManoeuvreInput) {
  if (input.engineOrder) return { engineOrder: input.engineOrder, shaftDemand: ENGINE_ORDER_TARGETS[input.engineOrder] }
  const throttle = clamp(input.throttle ?? 0, -1, 1)
  return { engineOrder: engineOrderFromLegacyThrottle(throttle), shaftDemand: throttle }
}

export type PropulsionStep = {
  engineOrder: EngineOrder
  shaftDemand: number
  shaftActual: number
  reversalDelayRemaining: number
  thrust: number
}

export function stepPropulsion(state: ManoeuvreState, input: ManoeuvreInput, vessel: VesselParameters, dt: number): PropulsionStep {
  const command = commandFromInput(input)
  const orderChanged = command.engineOrder !== state.engineOrder
  let reversalDelayRemaining = Math.max(0, state.reversalDelayRemaining - dt)

  if (
    orderChanged
    && sign(command.shaftDemand) !== 0
    && sign(state.shaftDemand) !== 0
    && sign(command.shaftDemand) !== sign(state.shaftDemand)
  ) {
    reversalDelayRemaining = vessel.engineReversalDelaySeconds
  }

  const effectiveTarget = reversalDelayRemaining > 0 ? 0 : command.shaftDemand
  const responseSeconds = effectiveTarget === 0
    ? vessel.engineResponseStopSeconds
    : effectiveTarget > 0
      ? vessel.engineResponseAheadSeconds
      : vessel.engineResponseAsternSeconds
  const alpha = 1 - Math.exp(-dt / Math.max(.05, responseSeconds))
  const shaftActual = state.shaftActual + (effectiveTarget - state.shaftActual) * alpha
  const shaftPower = shaftActual * Math.abs(shaftActual)
  const thrust = shaftPower >= 0
    ? vessel.aheadThrust * shaftPower
    : vessel.aheadThrust * vessel.reverseThrustFactor * shaftPower

  return {
    engineOrder: command.engineOrder,
    shaftDemand: command.shaftDemand,
    shaftActual,
    reversalDelayRemaining,
    thrust,
  }
}
