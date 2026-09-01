import { describe, expect, it } from 'vitest'
import { simulate } from './engine'
import { calmEnvironment, initialManoeuvreState } from './state'
import { MPS_PER_KNOT } from './units'
import { loadState, VESSEL_PARAMETERS } from './vessel-parameters'

describe('P5.3-H5 human rudder acceptance', () => {
  const vessel = VESSEL_PARAMETERS.handysize
  const load = loadState(vessel, .8)

  it('does not turn at zero way even with helm hard over', () => {
    const stopped = simulate(
      initialManoeuvreState(),
      { engineOrder: 'STOP', rudder: 1 },
      vessel,
      load,
      calmEnvironment,
      15,
    )

    expect(Math.abs(stopped.heading)).toBeLessThan(1e-10)
    expect(Math.abs(stopped.yawRate)).toBeLessThan(1e-10)
  })

  it('produces a clearly measurable starboard turn from half-knot way with slow ahead', () => {
    const initial = {
      ...initialManoeuvreState(),
      surge: .5 * MPS_PER_KNOT,
      engineOrder: 'SLOW_AHEAD' as const,
      shaftDemand: .3,
      shaftActual: .3,
    }
    const straight = simulate(initial, { engineOrder: 'SLOW_AHEAD', rudder: 0 }, vessel, load, calmEnvironment, 10)
    const starboard = simulate(initial, { engineOrder: 'SLOW_AHEAD', rudder: 1 }, vessel, load, calmEnvironment, 10)

    expect(starboard.heading).toBeLessThan(straight.heading - .01)
    expect(starboard.yawRate).toBeLessThan(straight.yawRate)
  })
})
