import { FIXED_DT, stepManoeuvre } from './engine'
import { initialManoeuvreState, type ManoeuvreState } from './state'
import { loadState, VESSEL_PARAMETERS, type SimulationVesselClass } from './vessel-parameters'
import { navigationMetrics } from './units'

export function beamWindDriftBenchmark(vesselClass: SimulationVesselClass, loadRatio: number, seconds = 90) {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const load = loadState(vessel, loadRatio)
  const environment = { windSpeedMps: 10, windFromDeg: 270, currentSpeedMps: 0, currentToDeg: 0 }
  let state = initialManoeuvreState()
  const steps = Math.round(seconds / FIXED_DT)
  for (let i = 0; i < steps; i += 1) state = stepManoeuvre(state, { engineOrder: 'STOP', rudder: 0 }, vessel, load, environment)
  return {
    state,
    lateralOffsetMeters: Math.abs(state.y),
    headingChangeDeg: Math.abs(state.heading * 180 / Math.PI),
    finalSwayMps: Math.abs(state.sway),
  }
}

export function crossCurrentBenchmark(currentSpeedMps = .5) {
  const vessel = VESSEL_PARAMETERS.handysize
  const load = loadState(vessel, .5)
  const initial: ManoeuvreState = {
    ...initialManoeuvreState(),
    surge: 2,
    engineOrder: 'STOP',
    shaftDemand: 0,
    shaftActual: 0,
  }
  const calm = { windSpeedMps: 0, windFromDeg: 0, currentSpeedMps: 0, currentToDeg: 0 }
  const current = { ...calm, currentSpeedMps, currentToDeg: 90 }
  const calmNav = navigationMetrics(initial, calm)
  const currentNav = navigationMetrics(initial, current)
  const calmStep = stepManoeuvre(initial, { engineOrder: 'STOP', rudder: 0 }, vessel, load, calm)
  const currentStep = stepManoeuvre(initial, { engineOrder: 'STOP', rudder: 0 }, vessel, load, current)
  return {
    calmNav,
    currentNav,
    yawDelta: currentStep.yawRate - calmStep.yawRate,
    surgeDelta: currentStep.surge - calmStep.surge,
    swayDelta: currentStep.sway - calmStep.sway,
  }
}
