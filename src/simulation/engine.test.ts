import { describe, expect, it } from 'vitest'
import { FIXED_DT, simulate, stepManoeuvre } from './engine'
import { calmEnvironment, initialManoeuvreState } from './state'
import { maritimeBearingDeg } from './units'
import { loadState, VESSEL_PARAMETERS } from './vessel-parameters'

const ahead = { throttle: 1, rudder: 0 }
const fullAhead = { engineOrder: 'FULL_AHEAD' as const, rudder: 0 }
const fullAstern = { engineOrder: 'FULL_ASTERN' as const, rudder: 0 }
const MPS_PER_KNOT = 1 / 1.9438444924406

describe('P4/P5.3 deterministic ship dynamics', () => {
  it('replays identical telegraph inputs deterministically', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const load = loadState(vessel, .65)
    const a = simulate(initialManoeuvreState(), { engineOrder: 'HALF_AHEAD', rudder: .35 }, vessel, load, calmEnvironment, 90)
    const b = simulate(initialManoeuvreState(), { engineOrder: 'HALF_AHEAD', rudder: .35 }, vessel, load, calmEnvironment, 90)
    expect(a).toEqual(b)
  })

  it('keeps long runs finite', () => {
    const vessel = VESSEL_PARAMETERS.feeder
    const load = loadState(vessel, .8)
    const result = simulate(initialManoeuvreState(), { throttle: .7, rudder: -.45, bowThruster: .4 }, vessel, load, { windX: 0, windY: .08, currentX: .03, currentY: -.02 }, 900)
    const numbers = [result.x, result.y, result.heading, result.surge, result.sway, result.yawRate, result.rudder, result.bowThruster, result.shaftDemand, result.shaftActual, result.reversalDelayRemaining, result.condition, result.elapsed]
    expect(numbers.every(Number.isFinite)).toBe(true)
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

  it('supports lateral drift as an independent degree of freedom', () => {
    const vessel = VESSEL_PARAMETERS.feeder
    const result = simulate(initialManoeuvreState(), { throttle: 0, rudder: 0 }, vessel, loadState(vessel, .3), { ...calmEnvironment, windY: .12 }, 60)
    expect(Math.abs(result.y)).toBeGreaterThan(0)
    expect(Math.abs(result.sway)).toBeGreaterThan(0)
  })

  it('models prop walk while reversing', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const result = simulate(initialManoeuvreState(), { throttle: -.8, rudder: 0 }, vessel, loadState(vessel, .4), calmEnvironment, 25)
    expect(Math.abs(result.yawRate)).toBeGreaterThan(0)
  })

  it('ramps shaft output instead of applying full engine order in one tick', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const next = stepManoeuvre(initialManoeuvreState(), fullAhead, vessel, loadState(vessel, .5), calmEnvironment)
    expect(next.engineOrder).toBe('FULL_AHEAD')
    expect(next.shaftDemand).toBe(1)
    expect(next.shaftActual).toBeGreaterThan(0)
    expect(next.shaftActual).toBeLessThan(.05)
    expect(next.surge).toBeGreaterThan(0)
  })

  it('forces an ahead-to-astern reversal through a neutral response phase', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const load = loadState(vessel, .5)
    const runningAhead = simulate(initialManoeuvreState(), fullAhead, vessel, load, calmEnvironment, 8)
    expect(runningAhead.shaftActual).toBeGreaterThan(.5)

    const reversalStart = stepManoeuvre(runningAhead, fullAstern, vessel, load, calmEnvironment)
    expect(reversalStart.engineOrder).toBe('FULL_ASTERN')
    expect(reversalStart.shaftDemand).toBe(-1)
    expect(reversalStart.shaftActual).toBeGreaterThan(0)
    expect(reversalStart.reversalDelayRemaining).toBeGreaterThan(2)

    const reversing = simulate(reversalStart, fullAstern, vessel, load, calmEnvironment, 10)
    expect(reversing.reversalDelayRemaining).toBe(0)
    expect(reversing.shaftActual).toBeLessThan(0)
  })

  it('AT-03: rudder is ineffective without flow but works with ahead propeller wash', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const load = loadState(vessel, .5)
    const noFlow = simulate(initialManoeuvreState(), { engineOrder: 'STOP', rudder: 1 }, vessel, load, calmEnvironment, 30)
    expect(Math.abs(noFlow.heading)).toBeLessThan(1e-10)
    expect(Math.abs(noFlow.yawRate)).toBeLessThan(1e-10)

    const withWash = simulate(initialManoeuvreState(), { engineOrder: 'DEAD_SLOW_AHEAD', rudder: 1 }, vessel, load, calmEnvironment, 30)
    expect(withWash.shaftActual).toBeGreaterThan(.1)
    expect(Math.abs(withWash.heading)).toBeGreaterThan(.01)
    expect(Math.abs(withWash.sway)).toBeGreaterThan(0)
  })

  it('H3: positive/STBD helm produces a starboard turn and clockwise displayed heading', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const load = loadState(vessel, .5)
    const starboard = simulate(initialManoeuvreState(), { engineOrder: 'SLOW_AHEAD', rudder: 1 }, vessel, load, calmEnvironment, 20)
    const port = simulate(initialManoeuvreState(), { engineOrder: 'SLOW_AHEAD', rudder: -1 }, vessel, load, calmEnvironment, 20)

    expect(starboard.heading).toBeLessThan(0)
    expect(starboard.yawRate).toBeLessThan(0)
    expect(maritimeBearingDeg(starboard.heading)).toBeGreaterThan(0)
    expect(maritimeBearingDeg(starboard.heading)).toBeLessThan(180)
    expect(port.heading).toBeGreaterThan(0)
    expect(port.yawRate).toBeGreaterThan(0)
    expect(Math.abs(port.heading)).toBeCloseTo(Math.abs(starboard.heading), 4)
  })

  it('AT-04: residual yaw decays gradually and counter-rudder damps it faster', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const load = loadState(vessel, .5)
    const turning = simulate(initialManoeuvreState(), { engineOrder: 'HALF_AHEAD', rudder: .8 }, vessel, load, calmEnvironment, 25)
    expect(Math.abs(turning.yawRate)).toBeGreaterThan(1e-4)

    const coasting = simulate(turning, { engineOrder: 'STOP', rudder: 0 }, vessel, load, calmEnvironment, .5)
    const countered = simulate(turning, { engineOrder: 'STOP', rudder: -.8 }, vessel, load, calmEnvironment, .5)

    expect(Math.abs(coasting.yawRate)).toBeGreaterThan(1e-4)
    expect(Math.abs(coasting.yawRate)).toBeLessThan(Math.abs(turning.yawRate))
    expect(Math.abs(countered.yawRate)).toBeLessThan(Math.abs(coasting.yawRate))
  })

  it('AT-05: right-handed prop walk is visible astern without rudder and much weaker ahead', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const load = loadState(vessel, .4)
    const astern = simulate(initialManoeuvreState(), { engineOrder: 'HALF_ASTERN', rudder: 0 }, vessel, load, calmEnvironment, 30)
    const aheadRun = simulate(initialManoeuvreState(), { engineOrder: 'HALF_AHEAD', rudder: 0 }, vessel, load, calmEnvironment, 30)

    expect(astern.sway).toBeGreaterThan(0)
    expect(astern.heading).toBeLessThan(0)
    expect(aheadRun.heading).toBeGreaterThan(0)
    expect(Math.abs(aheadRun.heading)).toBeLessThan(Math.abs(astern.heading) * .35)
  })

  it('AT-06: bow thruster turns the bow to commanded STBD at rest, fades by four knots and is ineffective at five', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const load = loadState(vessel, .5)
    const stopped = initialManoeuvreState()
    const atRest = stepManoeuvre(stopped, { engineOrder: 'STOP', rudder: 0, bowThruster: 1 }, vessel, load, calmEnvironment)
    expect(atRest.sway).toBeLessThan(0)
    expect(atRest.yawRate).toBeLessThan(0)
    expect(atRest.bowThruster).toBe(1)

    const four = { ...initialManoeuvreState(), surge: 4 * MPS_PER_KNOT }
    const fourBase = stepManoeuvre(four, { engineOrder: 'STOP', rudder: 0, bowThruster: 0 }, vessel, load, calmEnvironment)
    const fourThruster = stepManoeuvre(four, { engineOrder: 'STOP', rudder: 0, bowThruster: 1 }, vessel, load, calmEnvironment)
    const fourSwayDelta = fourThruster.sway - fourBase.sway
    expect(fourSwayDelta / atRest.sway).toBeLessThan(.2)
    expect(fourSwayDelta / atRest.sway).toBeGreaterThan(.1)

    const five = { ...initialManoeuvreState(), surge: 5 * MPS_PER_KNOT }
    const fiveBase = stepManoeuvre(five, { engineOrder: 'STOP', rudder: 0, bowThruster: 0 }, vessel, load, calmEnvironment)
    const fiveThruster = stepManoeuvre(five, { engineOrder: 'STOP', rudder: 0, bowThruster: 1 }, vessel, load, calmEnvironment)
    expect(fiveThruster.sway - fiveBase.sway).toBeCloseTo(0, 12)
    expect(fiveThruster.yawRate - fiveBase.yawRate).toBeCloseTo(0, 12)
  })

  it('uses a fixed 30 Hz baseline step', () => {
    expect(FIXED_DT).toBeCloseTo(1 / 30)
    const vessel = VESSEL_PARAMETERS.coaster
    const next = stepManoeuvre(initialManoeuvreState(), ahead, vessel, loadState(vessel, .2), calmEnvironment)
    expect(next.elapsed).toBeCloseTo(1 / 30)
  })
})
