import { describe, expect, it } from 'vitest'
import { initialManoeuvreState } from '../state'
import { VESSEL_PARAMETERS } from '../vessel-parameters'
import { propWalkForces } from './prop-walk'

describe('P5.3-C prop walk', () => {
  it('walks a right-handed stern to port when running astern', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const force = propWalkForces(initialManoeuvreState(), -.8, vessel)
    expect(force.swayForce).toBeLessThan(0)
    expect(force.yawMoment).toBeGreaterThan(0)
  })

  it('keeps ahead transverse thrust much weaker and opposite', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const astern = propWalkForces(initialManoeuvreState(), -.8, vessel)
    const ahead = propWalkForces(initialManoeuvreState(), .8, vessel)
    expect(ahead.swayForce).toBeGreaterThan(0)
    expect(ahead.yawMoment).toBeLessThan(0)
    expect(Math.abs(ahead.yawMoment)).toBeLessThan(Math.abs(astern.yawMoment) * .2)
  })

  it('attenuates transverse thrust as longitudinal speed rises', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const stopped = propWalkForces(initialManoeuvreState(), -.8, vessel)
    const moving = propWalkForces({ ...initialManoeuvreState(), surge: 3 }, -.8, vessel)
    expect(Math.abs(moving.swayForce)).toBeLessThan(Math.abs(stopped.swayForce))
    expect(Math.abs(moving.yawMoment)).toBeLessThan(Math.abs(stopped.yawMoment))
  })
})
