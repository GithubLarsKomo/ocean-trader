import type { EnvironmentState, ManoeuvreInput, ManoeuvreState, VesselLoadState } from './state'
import type { VesselParameters } from './vessel-parameters'
import { stepPropulsion } from './forces/propulsion'

export const FIXED_DT = 1 / 30

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function stepManoeuvre(
  state: ManoeuvreState,
  input: ManoeuvreInput,
  vessel: VesselParameters,
  load: VesselLoadState,
  environment: EnvironmentState,
  dt = FIXED_DT,
): ManoeuvreState {
  const rudder = clamp(input.rudder, -1, 1)
  const propulsion = stepPropulsion(state, input, vessel, dt)
  const massFactor = load.displacementTonnes / vessel.lightshipTonnes
  const surgeAcceleration = propulsion.thrust / massFactor - vessel.surgeDrag * state.surge * Math.abs(state.surge)
  const rudderFlow = Math.min(1.5, Math.abs(state.surge))
  const yawMoment = rudder * vessel.rudderAuthority * rudderFlow * Math.sign(state.surge || 1)
  const propWalk = propulsion.shaftActual < 0 ? vessel.propWalk * -propulsion.shaftActual : 0
  const yawAcceleration = (yawMoment + propWalk - vessel.yawDrag * state.yawRate) / vessel.yawInertia
  const windSway = environment.windY * vessel.windage / massFactor
  const swayAcceleration = windSway - vessel.lateralDrag * state.sway + propWalk * .12
  const surge = state.surge + surgeAcceleration * dt
  const sway = state.sway + swayAcceleration * dt
  const yawRate = state.yawRate + yawAcceleration * dt
  const heading = state.heading + yawRate * dt
  const cos = Math.cos(heading)
  const sin = Math.sin(heading)
  const worldX = surge * cos - sway * sin + environment.currentX
  const worldY = surge * sin + sway * cos + environment.currentY

  const next: ManoeuvreState = {
    ...state,
    x: state.x + worldX * dt,
    y: state.y + worldY * dt,
    heading,
    surge,
    sway,
    yawRate,
    rudder,
    engineOrder: propulsion.engineOrder,
    shaftDemand: propulsion.shaftDemand,
    shaftActual: propulsion.shaftActual,
    reversalDelayRemaining: propulsion.reversalDelayRemaining,
    elapsed: state.elapsed + dt,
  }
  const numericState = [
    next.x, next.y, next.heading, next.surge, next.sway, next.yawRate, next.rudder,
    next.shaftDemand, next.shaftActual, next.reversalDelayRemaining, next.condition, next.elapsed,
  ]
  if (!numericState.every(Number.isFinite)) throw new Error('Non-finite manoeuvre state')
  return next
}

export function simulate(
  initial: ManoeuvreState,
  input: ManoeuvreInput,
  vessel: VesselParameters,
  load: VesselLoadState,
  environment: EnvironmentState,
  seconds: number,
) {
  let state = initial
  const steps = Math.round(seconds / FIXED_DT)
  for (let i = 0; i < steps; i += 1) state = stepManoeuvre(state, input, vessel, load, environment)
  return state
}
