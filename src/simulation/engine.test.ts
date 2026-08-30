import { describe, expect, it } from 'vitest'
import { FIXED_DT, simulate, stepManoeuvre } from './engine'
import { calmEnvironment, initialManoeuvreState } from './state'
import { loadState, VESSEL_PARAMETERS } from './vessel-parameters'

const ahead = { throttle: 1, rudder: 0 }

describe('P4 deterministic ship dynamics', () => {
  it('replays identical inputs deterministically', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const load = loadState(vessel, .65)
    const a = simulate(initialManoeuvreState(), { throttle: .8, rudder: .35 }, vessel, load, calmEnvironment, 90)
    const b = simulate(initialManoeuvreState(), { throttle: .8, rudder: .35 }, vessel, load, calmEnvironment, 90)
    expect(a).toEqual(b)
  })

  it('keeps long runs finite', () => {
    const vessel = VESSEL_PARAMETERS.feeder
    const load = loadState(vessel, .8)
    const result = simulate(initialManoeuvreState(), { throttle: .7, rudder: -.45 }, vessel, load, { windX: 0, windY: .08, currentX: .03, currentY: -.02 }, 900)
    expect(Object.values(result).every(Number.isFinite)).toBe(true)
  })

  it('makes a laden vessel accelerate more slowly', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const empty = simulate(initialManoeuvreState(), ahead, vessel, loadState(vessel, 0), calmEnvironment, 20)
    const laden = simulate(initialManoeuvreState(), ahead, vessel, loadState(vessel, 1), calmEnvironment, 20)
    expect(laden.surge).toBeLessThan(empty.surge)
    expect(laden.x).toBeLessThan(empty.x)
  })

  it('makes Panamax respond more slowly than Coaster', () => {
    const coaster = VESSEL_PARAMETERS.coaster
    const panamax = VESSEL_PARAMETERS.panamax
    const c = simulate(initialManoeuvreState(), { throttle: .8, rudder: .7 }, coaster, loadState(coaster, .5), calmEnvironment, 35)
    const p = simulate(initialManoeuvreState(), { throttle: .8, rudder: .7 }, panamax, loadState(panamax, .5), calmEnvironment, 35)
    expect(Math.abs(p.heading)).toBeLessThan(Math.abs(c.heading))
    expect(p.surge).toBeLessThan(c.surge)
  })

  it('supports lateral drift independent of heading', () => {
    const vessel = VESSEL_PARAMETERS.feeder
    const result = simulate(initialManoeuvreState(), { throttle: 0, rudder: 0 }, vessel, loadState(vessel, .3), { ...calmEnvironment, windY: .12 }, 60)
    expect(Math.abs(result.y)).toBeGreaterThan(0)
    expect(result.heading).toBe(0)
  })

  it('models prop walk while reversing', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const result = simulate(initialManoeuvreState(), { throttle: -.8, rudder: 0 }, vessel, loadState(vessel, .4), calmEnvironment, 25)
    expect(Math.abs(result.yawRate)).toBeGreaterThan(0)
  })

  it('uses a fixed 30 Hz baseline step', () => {
    expect(FIXED_DT).toBeCloseTo(1 / 30)
    const vessel = VESSEL_PARAMETERS.coaster
    const next = stepManoeuvre(initialManoeuvreState(), ahead, vessel, loadState(vessel, .2), calmEnvironment)
    expect(next.elapsed).toBeCloseTo(1 / 30)
  })
})
