import { describe, expect, it } from 'vitest'
import { initialManoeuvreState, type ManoeuvreState } from '../simulation/state'
import { loadState, VESSEL_PARAMETERS } from '../simulation/vessel-parameters'
import { evaluateHarbourOperation, initialHarbourOperationState } from './operations'
import { ROTTERDAM_P5 } from './rotterdam'

const vessel = VESSEL_PARAMETERS.handysize
const load = loadState(vessel, .6)
const DT = 1 / 30

function atBerth(overrides: Partial<ManoeuvreState> = {}): ManoeuvreState {
  return {
    ...initialManoeuvreState(),
    x: (ROTTERDAM_P5.berth.x - ROTTERDAM_P5.spawn.x) / ROTTERDAM_P5.renderScale,
    y: (ROTTERDAM_P5.berth.z - ROTTERDAM_P5.spawn.z) / ROTTERDAM_P5.renderScale,
    ...overrides,
  }
}

function holdStable(seconds: number) {
  let previous = atBerth()
  let operation = initialHarbourOperationState()
  let state = previous
  const steps = Math.round(seconds / DT)
  for (let i = 0; i < steps; i += 1) {
    state = { ...state, elapsed: state.elapsed + DT }
    const result = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, operation)
    state = result.state
    operation = result.operation
    previous = state
  }
  return { state, operation }
}

function atQuay(normalSpeed: number, longitudinalSpeed = 0) {
  const quay = ROTTERDAM_P5.quays[0]
  return {
    ...initialManoeuvreState(),
    x: (quay.x - ROTTERDAM_P5.spawn.x) / ROTTERDAM_P5.renderScale,
    y: (quay.z + quay.width / 2 + 1.0 - ROTTERDAM_P5.spawn.z) / ROTTERDAM_P5.renderScale,
    surge: longitudinalSpeed,
    sway: -normalSpeed,
  }
}

describe('P5 harbour operations', () => {
  it('does not secure the berth in a single physics tick', () => {
    const previous = atBerth()
    const state = { ...previous, elapsed: DT }
    const result = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    expect(result.operation.docked).toBe(false)
    expect(result.operation.berthStableSeconds).toBeCloseTo(DT)
    expect(result.operation.message).toContain('Berth stable')
  })

  it('AT-10: secures only after three seconds of stable berth metrics', () => {
    const before = holdStable(2.9)
    expect(before.operation.docked).toBe(false)

    const accepted = holdStable(3.1)
    expect(accepted.operation.docked).toBe(true)
    expect(accepted.operation.berthStableSeconds).toBeGreaterThanOrEqual(3)
    expect(accepted.state.surge).toBe(0)
    expect(accepted.operation.lastBerthingMetrics?.headingErrorDeg).toBeLessThanOrEqual(3)
    expect(Math.abs(accepted.operation.lastBerthingMetrics?.lateralSpeedMps ?? 1)).toBeLessThanOrEqual(.10)
  })

  it('AT-10: rejects excessive lateral speed even when position and heading are correct', () => {
    const previous = atBerth({ sway: .18 })
    const state = { ...previous, elapsed: DT, y: previous.y + .18 * DT }
    const result = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    expect(result.operation.docked).toBe(false)
    expect(result.operation.berthStableSeconds).toBe(0)
    expect(result.operation.message).toContain('lateral speed')
  })

  it('AT-10: rejects heading and rotation outside the safe envelope', () => {
    const previous = atBerth({ heading: 5 * Math.PI / 180, yawRate: .01 })
    const state = { ...previous, elapsed: DT }
    const result = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    expect(result.operation.docked).toBe(false)
    expect(result.operation.berthStableSeconds).toBe(0)
    expect(result.operation.message).toContain('Parallelize')
  })

  it('allows controlled fender contact below 0.10 m/s without damage', () => {
    const previous = atQuay(.08, .8)
    const state = { ...previous, elapsed: DT }
    const result = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    expect(result.operation.collisions).toBe(0)
    expect(result.operation.damage).toBe(0)
    expect(result.state.condition).toBe(100)
    expect(result.operation.contactActive).toBe(true)
  })

  it('bases quay severity on normal speed rather than total longitudinal speed', () => {
    const previous = atQuay(.05, 1.4)
    const state = { ...previous, elapsed: DT }
    const result = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    expect(result.operation.collisions).toBe(0)
    expect(result.operation.damage).toBe(0)
  })

  it('turns hard lateral berth contact into deterministic damage and no settlement', () => {
    const previous = atQuay(.35)
    const state = { ...previous, elapsed: DT }
    const result = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    expect(result.operation.collisions).toBe(1)
    expect(result.operation.damage).toBeGreaterThan(0)
    expect(result.state.condition).toBeLessThan(100)
    expect(result.operation.docked).toBe(false)
    expect(result.operation.message).toContain('Quay collision')
  })

  it('makes navigation buoys solid and damaging', () => {
    const buoy = ROTTERDAM_P5.buoys[0]
    const previous = initialManoeuvreState()
    const state = { ...previous, x: (buoy.x - ROTTERDAM_P5.spawn.x) / ROTTERDAM_P5.renderScale, y: (buoy.z - ROTTERDAM_P5.spawn.z) / ROTTERDAM_P5.renderScale, surge: .8 }
    const result = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    expect(result.operation.collisions).toBe(1)
    expect(result.operation.damage).toBeGreaterThan(0)
    expect(result.operation.message).toContain('buoy')
    expect(result.state.condition).toBeLessThan(100)
  })

  it('does not stack damage every physics tick while still touching an obstacle', () => {
    const previous = atQuay(.5)
    const state = { ...previous, elapsed: DT }
    const first = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    const secondState = { ...first.state, elapsed: first.state.elapsed + DT }
    const second = evaluateHarbourOperation(secondState, first.state, vessel, load, ROTTERDAM_P5, first.operation)
    expect(second.operation.collisions).toBe(1)
    expect(second.operation.damage).toBe(first.operation.damage)
    expect(second.state.condition).toBe(first.state.condition)
  })
})
