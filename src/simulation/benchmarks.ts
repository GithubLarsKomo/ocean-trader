import { FIXED_DT, stepManoeuvre } from './engine'
import { calmEnvironment, initialManoeuvreState, type EnvironmentState, type ManoeuvreInput, type ManoeuvreState } from './state'
import { loadState, VESSEL_PARAMETERS, type SimulationVesselClass, type VesselParameters } from './vessel-parameters'

export type TrackPoint = Pick<ManoeuvreState, 'x' | 'y' | 'heading' | 'surge' | 'sway' | 'yawRate' | 'elapsed'>
export type BenchmarkResult = {
  id: string
  vesselClass: SimulationVesselClass
  loadRatio: number
  duration: number
  final: ManoeuvreState
  track: TrackPoint[]
  metrics: Record<string, number>
}

type Phase = { seconds: number; input: ManoeuvreInput; environment?: EnvironmentState }

const KNOTS_PER_MPS = 1.9438444924406

function runPhasesFrom(initial: ManoeuvreState, vessel: VesselParameters, loadRatio: number, phases: Phase[]): { final: ManoeuvreState; track: TrackPoint[] } {
  let state = initial
  const load = loadState(vessel, loadRatio)
  const track: TrackPoint[] = []
  let sampleClock = 0
  for (const phase of phases) {
    const steps = Math.round(phase.seconds / FIXED_DT)
    for (let i = 0; i < steps; i += 1) {
      state = stepManoeuvre(state, phase.input, vessel, load, phase.environment ?? calmEnvironment)
      sampleClock += FIXED_DT
      if (sampleClock >= .5 - 1e-9) {
        track.push({ x: state.x, y: state.y, heading: state.heading, surge: state.surge, sway: state.sway, yawRate: state.yawRate, elapsed: state.elapsed })
        sampleClock = 0
      }
    }
  }
  return { final: state, track }
}

function runPhases(vessel: VesselParameters, loadRatio: number, phases: Phase[]) {
  return runPhasesFrom(initialManoeuvreState(), vessel, loadRatio, phases)
}

const distance = (a: TrackPoint, b: TrackPoint) => Math.hypot(b.x - a.x, b.y - a.y)
const maxAbs = (track: TrackPoint[], key: 'sway' | 'yawRate') => Math.max(0, ...track.map(p => Math.abs(p[key])))

export function accelerationBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const run = runPhases(vessel, loadRatio, [{ seconds: 60, input: { throttle: 1, rudder: 0 } }])
  return { id: 'acceleration', vesselClass, loadRatio, duration: 60, ...run, metrics: { finalSurge: run.final.surge, distance: Math.hypot(run.final.x, run.final.y) } }
}

/** Harbour-relevant response benchmark: first 20 seconds from STOP to FULL AHEAD. */
export function harbourResponseBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const run = runPhases(vessel, loadRatio, [{ seconds: 20, input: { engineOrder: 'FULL_AHEAD', rudder: 0 } }])
  return {
    id: 'harbour-response', vesselClass, loadRatio, duration: 20, ...run,
    metrics: {
      finalSurge: run.final.surge,
      finalSpeedKnots: run.final.surge * KNOTS_PER_MPS,
      distance: Math.hypot(run.final.x, run.final.y),
    },
  }
}

export function hardTurnBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const run = runPhases(vessel, loadRatio, [
    { seconds: 30, input: { throttle: .8, rudder: 0 } },
    { seconds: 75, input: { throttle: .8, rudder: 1 } },
  ])
  const startTurn = run.track.find(p => p.elapsed >= 30) ?? run.track[0]
  const afterTurn = run.track.filter(p => p.elapsed >= 30)
  const radiusProxy = afterTurn.length ? Math.max(...afterTurn.map(p => distance(startTurn, p))) : 0
  return { id: 'hard-turn', vesselClass, loadRatio, duration: 105, ...run, metrics: { headingChange: Math.abs(run.final.heading), radiusProxy, maxYawRate: maxAbs(run.track, 'yawRate') } }
}

/** Identical 4 kn / HALF AHEAD entry state for class and load calibration. */
export function lowSpeedTurnBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const initial = {
    ...initialManoeuvreState(),
    surge: 4 / KNOTS_PER_MPS,
    engineOrder: 'HALF_AHEAD' as const,
    shaftDemand: .6,
    shaftActual: .6,
  }
  const run = runPhasesFrom(initial, vessel, loadRatio, [{ seconds: 20, input: { engineOrder: 'HALF_AHEAD', rudder: 1 } }])
  return {
    id: 'low-speed-turn', vesselClass, loadRatio, duration: 20, ...run,
    metrics: {
      headingChange: Math.abs(run.final.heading),
      finalYawRate: Math.abs(run.final.yawRate),
      displacement: Math.hypot(run.final.x, run.final.y),
    },
  }
}

export function crashStopBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const load = loadState(vessel, loadRatio)
  let state = initialManoeuvreState()
  const track: TrackPoint[] = []
  for (let i = 0; i < Math.round(45 / FIXED_DT); i += 1) state = stepManoeuvre(state, { throttle: 1, rudder: 0 }, vessel, load, calmEnvironment)
  const stopStart = { ...state }
  let stopTime = 0
  let stopDistance = 0
  let prev = { ...state }
  const maxSteps = Math.round(180 / FIXED_DT)
  for (let i = 0; i < maxSteps; i += 1) {
    state = stepManoeuvre(state, { throttle: -1, rudder: 0 }, vessel, load, calmEnvironment)
    stopTime += FIXED_DT
    stopDistance += Math.hypot(state.x - prev.x, state.y - prev.y)
    prev = { ...state }
    if (i % 15 === 0) track.push({ x: state.x, y: state.y, heading: state.heading, surge: state.surge, sway: state.sway, yawRate: state.yawRate, elapsed: stopTime })
    if (state.surge <= .05) break
  }
  return { id: 'crash-stop', vesselClass, loadRatio, duration: stopTime, final: state, track, metrics: { approachSurge: stopStart.surge, stopTime, stopDistance } }
}

/**
 * Class-comparison crash stop from the same 6 kn FULL AHEAD state.
 * This removes different approach speeds from the class comparison while still
 * preserving each vessel's reversal delay, engine response, mass and drag.
 */
export function normalizedCrashStopBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const load = loadState(vessel, loadRatio)
  let state: ManoeuvreState = {
    ...initialManoeuvreState(),
    surge: 6 / KNOTS_PER_MPS,
    engineOrder: 'FULL_AHEAD',
    shaftDemand: 1,
    shaftActual: 1,
  }
  const track: TrackPoint[] = []
  let stopTime = 0
  let stopDistance = 0
  let prev = { ...state }
  const maxSteps = Math.round(240 / FIXED_DT)
  for (let i = 0; i < maxSteps; i += 1) {
    state = stepManoeuvre(state, { engineOrder: 'FULL_ASTERN', rudder: 0 }, vessel, load, calmEnvironment)
    stopTime += FIXED_DT
    stopDistance += Math.hypot(state.x - prev.x, state.y - prev.y)
    prev = { ...state }
    if (i % 15 === 0) track.push({ x: state.x, y: state.y, heading: state.heading, surge: state.surge, sway: state.sway, yawRate: state.yawRate, elapsed: stopTime })
    if (state.surge <= .05) break
  }
  return {
    id: 'normalized-crash-stop', vesselClass, loadRatio, duration: stopTime, final: state, track,
    metrics: { approachSpeedKnots: 6, stopTime, stopDistance },
  }
}

export function reversePropWalkBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const run = runPhases(vessel, loadRatio, [{ seconds: 45, input: { throttle: -.85, rudder: 0 } }])
  return {
    id: 'reverse-prop-walk', vesselClass, loadRatio, duration: 45, ...run,
    metrics: {
      headingChange: Math.abs(run.final.heading),
      lateralOffset: Math.abs(run.final.y),
      maxYawRate: maxAbs(run.track, 'yawRate'),
      signedHeading: run.final.heading,
      signedSway: run.final.sway,
    },
  }
}

export function windDriftBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const environment = { ...calmEnvironment, windY: .12 }
  const run = runPhases(vessel, loadRatio, [{ seconds: 90, input: { throttle: 0, rudder: 0 }, environment }])
  return { id: 'wind-drift', vesselClass, loadRatio, duration: 90, ...run, metrics: { lateralOffset: Math.abs(run.final.y), maxSway: maxAbs(run.track, 'sway') } }
}

export function lowSpeedRudderBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const noFlow = runPhases(vessel, loadRatio, [{ seconds: 30, input: { engineOrder: 'STOP', rudder: 1 } }])
  const withWash = runPhases(vessel, loadRatio, [{ seconds: 30, input: { engineOrder: 'DEAD_SLOW_AHEAD', rudder: 1 } }])
  return {
    id: 'low-speed-rudder', vesselClass, loadRatio, duration: 30, ...withWash,
    metrics: {
      noFlowHeadingChange: Math.abs(noFlow.final.heading),
      washHeadingChange: Math.abs(withWash.final.heading),
      washSway: Math.abs(withWash.final.sway),
    },
  }
}

export function residualYawBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const turn = runPhases(vessel, loadRatio, [{ seconds: 25, input: { engineOrder: 'HALF_AHEAD', rudder: .8 } }])
  const coast = runPhasesFrom(turn.final, vessel, loadRatio, [{ seconds: .5, input: { engineOrder: 'STOP', rudder: 0 } }])
  const counter = runPhasesFrom(turn.final, vessel, loadRatio, [{ seconds: .5, input: { engineOrder: 'STOP', rudder: -.8 } }])
  return {
    id: 'residual-yaw', vesselClass, loadRatio, duration: 25.5, final: coast.final, track: [...turn.track, ...coast.track],
    metrics: {
      turnYawRate: Math.abs(turn.final.yawRate),
      coastYawRate: Math.abs(coast.final.yawRate),
      counterYawRate: Math.abs(counter.final.yawRate),
    },
  }
}

export function bowThrusterBenchmark(vesselClass: SimulationVesselClass, loadRatio = .5): BenchmarkResult {
  const vessel = VESSEL_PARAMETERS[vesselClass]
  const run = runPhases(vessel, loadRatio, [{ seconds: 12, input: { engineOrder: 'STOP', rudder: 0, bowThruster: 1 } }])
  return {
    id: 'bow-thruster', vesselClass, loadRatio, duration: 12, ...run,
    metrics: {
      headingChange: Math.abs(run.final.heading),
      lateralOffset: Math.abs(run.final.y),
      maxSway: maxAbs(run.track, 'sway'),
      maxYawRate: maxAbs(run.track, 'yawRate'),
    },
  }
}

export function benchmarkSuite(vesselClass: SimulationVesselClass, loadRatio = .5) {
  return [
    accelerationBenchmark(vesselClass, loadRatio),
    harbourResponseBenchmark(vesselClass, loadRatio),
    hardTurnBenchmark(vesselClass, loadRatio),
    lowSpeedTurnBenchmark(vesselClass, loadRatio),
    crashStopBenchmark(vesselClass, loadRatio),
    normalizedCrashStopBenchmark(vesselClass, loadRatio),
    reversePropWalkBenchmark(vesselClass, loadRatio),
    windDriftBenchmark(vesselClass, loadRatio),
    lowSpeedRudderBenchmark(vesselClass, loadRatio),
    residualYawBenchmark(vesselClass, loadRatio),
    bowThrusterBenchmark(vesselClass, loadRatio),
  ]
}

export function compareClasses(loadRatio = .5) {
  return (Object.keys(VESSEL_PARAMETERS) as SimulationVesselClass[]).flatMap(vesselClass => benchmarkSuite(vesselClass, loadRatio))
}
