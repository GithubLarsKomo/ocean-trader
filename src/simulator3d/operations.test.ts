import { describe, expect, it } from 'vitest'
import { initialManoeuvreState } from '../simulation/state'
import { loadState, VESSEL_PARAMETERS } from '../simulation/vessel-parameters'
import { evaluateHarbourOperation, initialHarbourOperationState } from './operations'
import { ROTTERDAM_P5 } from './rotterdam'

const vessel = VESSEL_PARAMETERS.handysize
const load = loadState(vessel, .6)

describe('P5 harbour operations', () => {
  it('recognises a slow aligned berth entry', () => {
    const state = { ...initialManoeuvreState(), x: (ROTTERDAM_P5.berth.x - ROTTERDAM_P5.spawn.x) / ROTTERDAM_P5.renderScale, y: (ROTTERDAM_P5.berth.z - ROTTERDAM_P5.spawn.z) / ROTTERDAM_P5.renderScale, surge: .1 }
    const result = evaluateHarbourOperation(state, state, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    expect(result.operation.docked).toBe(true)
    expect(result.state.surge).toBe(0)
  })

  it('rejects a fast berth entry', () => {
    const state = { ...initialManoeuvreState(), x: (ROTTERDAM_P5.berth.x - ROTTERDAM_P5.spawn.x) / ROTTERDAM_P5.renderScale, y: (ROTTERDAM_P5.berth.z - ROTTERDAM_P5.spawn.z) / ROTTERDAM_P5.renderScale, surge: 1.2 }
    const result = evaluateHarbourOperation(state, state, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    expect(result.operation.docked).toBe(false)
  })

  it('turns quay contact into deterministic damage', () => {
    const quay = ROTTERDAM_P5.quays[0]
    const previous = initialManoeuvreState()
    const state = { ...previous, x: (quay.x - ROTTERDAM_P5.spawn.x) / ROTTERDAM_P5.renderScale, y: (quay.z - ROTTERDAM_P5.spawn.z) / ROTTERDAM_P5.renderScale, surge: 1 }
    const result = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    expect(result.operation.collisions).toBe(1)
    expect(result.operation.damage).toBeGreaterThan(0)
    expect(result.state.condition).toBeLessThan(100)
    expect(result.operation.message).toContain('Quay')
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
    const quay = ROTTERDAM_P5.quays[0]
    const previous = initialManoeuvreState()
    const state = { ...previous, x: (quay.x - ROTTERDAM_P5.spawn.x) / ROTTERDAM_P5.renderScale, y: (quay.z - ROTTERDAM_P5.spawn.z) / ROTTERDAM_P5.renderScale, surge: 1 }
    const first = evaluateHarbourOperation(state, previous, vessel, load, ROTTERDAM_P5, initialHarbourOperationState())
    const second = evaluateHarbourOperation(state, first.state, vessel, load, ROTTERDAM_P5, first.operation)
    expect(second.operation.collisions).toBe(1)
    expect(second.operation.damage).toBe(first.operation.damage)
    expect(second.state.condition).toBe(first.state.condition)
  })
})
