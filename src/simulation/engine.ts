import type { EnvironmentState, ManoeuvreInput, ManoeuvreState, VesselLoadState } from './state'
import type { VesselParameters } from './vessel-parameters'
import { hullForces } from './forces/hull'
import { stepPropulsion } from './forces/propulsion'
import { propWalkForces } from './forces/prop-walk'
import { rudderForces } from './forces/rudder'
import { bowThrusterForces } from './forces/thruster'
import { windForces } from './forces/wind'
import { environmentVectors } from './units'

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
  const bowThruster = clamp(input.bowThruster ?? 0, -1, 1)
  const propulsion = stepPropulsion(state, input, vessel, dt)
  const hull = hullForces(state, vessel)
  const rudderLoad = rudderForces(state, rudder, propulsion.shaftActual, vessel)
  const propWalk = propWalkForces(state, propulsion.shaftActual, vessel)
  const thruster = bowThrusterForces(state, bowThruster, vessel)
  const wind = windForces(state, environment, vessel)
  const massFactor = load.displacementTonnes / vessel.lightshipTonnes

  // Hydrodynamic forces act on water-relative surge/sway only. Current is added
  // later when propagating ground position and never appears in hull/rudder forces.
  const surgeAcceleration = (propulsion.thrust + hull.surgeForce) / massFactor
  const swayAcceleration = (hull.swayForce + rudderLoad.swayForce + propWalk.swayForce + thruster.swayForce + wind.swayForce) / massFactor
  const yawAcceleration = (hull.yawMoment + rudderLoad.yawMoment + propWalk.yawMoment + thruster.yawMoment + wind.yawMoment) / (vessel.yawInertia * massFactor)

  const surge = state.surge + surgeAcceleration * dt
  const sway = state.sway + swayAcceleration * dt
  const yawRate = state.yawRate + yawAcceleration * dt
  const heading = state.heading + yawRate * dt
  const cos = Math.cos(heading)
  const sin = Math.sin(heading)
  const { currentWorldX, currentWorldY } = environmentVectors(environment)
  const waterWorldX = surge * cos - sway * sin
  const waterWorldY = surge * sin + sway * cos
  const groundWorldX = waterWorldX + currentWorldX
  const groundWorldY = waterWorldY + currentWorldY

  const next: ManoeuvreState = {
    ...state,
    x: state.x + groundWorldX * dt,
    y: state.y + groundWorldY * dt,
    heading,
    surge,
    sway,
    yawRate,
    rudder,
    bowThruster,
    engineOrder: propulsion.engineOrder,
    shaftDemand: propulsion.shaftDemand,
    shaftActual: propulsion.shaftActual,
    reversalDelayRemaining: propulsion.reversalDelayRemaining,
    elapsed: state.elapsed + dt,
  }
  const numericState = [
    next.x, next.y, next.heading, next.surge, next.sway, next.yawRate, next.rudder, next.bowThruster,
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
