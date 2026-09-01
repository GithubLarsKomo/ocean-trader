import { describe, expect, it } from 'vitest'
import { initialManoeuvreState, type ManoeuvreState } from '../simulation/state'
import { loadState, VESSEL_PARAMETERS } from '../simulation/vessel-parameters'
import { evaluateHarbourOperation, initialHarbourOperationState } from './operations'
import { ROTTERDAM_P5, ROTTERDAM_TRAINING_SCENARIOS, ROTTERDAM_TURNING_BASIN, ROTTERDAM_UNBERTHING, rotterdamScenario } from './rotterdam'

const vessel = VESSEL_PARAMETERS.handysize
const load = loadState(vessel, .6)
const DT = 1 / 30

function simulationPoint(scenario: typeof ROTTERDAM_P5, worldX: number, worldZ: number) {
  return { x: (worldX - scenario.spawn.x) / scenario.renderScale, y: (worldZ - scenario.spawn.z) / scenario.renderScale }
}

describe('P5.3-F harbour scenario pack', () => {
  it('exposes exactly the three required training manoeuvres and defaults safely to Alongside', () => {
    expect(ROTTERDAM_TRAINING_SCENARIOS.map(s => s.id)).toEqual(['alongside', 'unberthing', 'turning'])
    expect(rotterdamScenario('unberthing')).toBe(ROTTERDAM_UNBERTHING)
    expect(rotterdamScenario('turning')).toBe(ROTTERDAM_TURNING_BASIN)
    expect(rotterdamScenario('unknown')).toBe(ROTTERDAM_P5)
  })

  it('defines Unberthing from an alongside start toward a separate fairway exit zone', () => {
    expect(ROTTERDAM_UNBERTHING.goal.type).toBe('unberth')
    expect(ROTTERDAM_UNBERTHING.spawn.z).toBeLessThan(ROTTERDAM_UNBERTHING.berth.z)
    if (ROTTERDAM_UNBERTHING.goal.type !== 'unberth') throw new Error('wrong goal')
    expect(ROTTERDAM_UNBERTHING.goal.exitZone.x).toBeLessThan(ROTTERDAM_UNBERTHING.spawn.x)
  })

  it('completes Unberthing only after controlled outbound motion remains in the exit gate', () => {
    const scenario = ROTTERDAM_UNBERTHING
    if (scenario.goal.type !== 'unberth') throw new Error('wrong goal')
    const target = simulationPoint(scenario, scenario.goal.exitZone.x, scenario.goal.exitZone.z)
    let state: ManoeuvreState = {
      ...initialManoeuvreState(),
      ...target,
      heading: Math.PI,
      surge: .30,
    }
    let previous = { ...state, x: state.x + .30 * DT, elapsed: 0 }
    state = { ...state, elapsed: DT }
    let operation = initialHarbourOperationState()
    const steps = Math.ceil((scenario.goal.stableSeconds + .1) / DT)
    for (let i = 0; i < steps; i += 1) {
      const result = evaluateHarbourOperation(state, previous, vessel, load, scenario, operation)
      previous = result.state
      operation = result.operation
      state = { ...result.state, x: result.state.x - .30 * DT, elapsed: result.state.elapsed + DT }
    }
    expect(operation.docked).toBe(true)
    expect(operation.message).toContain('Unberthing complete')
  })

  it('does not complete Unberthing when the vessel reaches the exit zone on the wrong heading', () => {
    const scenario = ROTTERDAM_UNBERTHING
    if (scenario.goal.type !== 'unberth') throw new Error('wrong goal')
    const target = simulationPoint(scenario, scenario.goal.exitZone.x, scenario.goal.exitZone.z)
    const previous: ManoeuvreState = { ...initialManoeuvreState(), ...target, heading: 0, surge: .3 }
    const state = { ...previous, x: previous.x + .3 * DT, elapsed: DT }
    const result = evaluateHarbourOperation(state, previous, vessel, load, scenario, initialHarbourOperationState())
    expect(result.operation.docked).toBe(false)
    expect(result.operation.berthStableSeconds).toBe(0)
    expect(result.operation.message).toContain('Turn outbound')
  })

  it('completes Turning Basin only after the 180-degree heading and motion gates remain stable', () => {
    const scenario = ROTTERDAM_TURNING_BASIN
    if (scenario.goal.type !== 'turning') throw new Error('wrong goal')
    let state: ManoeuvreState = { ...initialManoeuvreState(), heading: Math.PI }
    let previous = state
    let operation = initialHarbourOperationState()
    const steps = Math.ceil((scenario.goal.stableSeconds + .1) / DT)
    for (let i = 0; i < steps; i += 1) {
      state = { ...state, elapsed: state.elapsed + DT }
      const result = evaluateHarbourOperation(state, previous, vessel, load, scenario, operation)
      state = result.state
      previous = state
      operation = result.operation
    }
    expect(operation.docked).toBe(true)
    expect(operation.message).toContain('Turning basin complete')
  })

  it('rejects a nominal 180-degree turn while rotation is still too fast', () => {
    const scenario = ROTTERDAM_TURNING_BASIN
    const previous: ManoeuvreState = { ...initialManoeuvreState(), heading: Math.PI, yawRate: 1 * Math.PI / 180 }
    const state = { ...previous, elapsed: DT }
    const result = evaluateHarbourOperation(state, previous, vessel, load, scenario, initialHarbourOperationState())
    expect(result.operation.docked).toBe(false)
    expect(result.operation.berthStableSeconds).toBe(0)
    expect(result.operation.message).toContain('Arrest rotation')
  })
})
