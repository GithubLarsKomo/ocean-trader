import { describe, expect, it } from 'vitest'
import { initialManoeuvreState } from '../state'
import { VESSEL_PARAMETERS } from '../vessel-parameters'
import { hullForces } from './hull'

describe('P5.3-B hull forces', () => {
  const vessel = VESSEL_PARAMETERS.handysize

  it('opposes forward surge with nonlinear resistance', () => {
    const slow = hullForces({ ...initialManoeuvreState(), surge: .5 }, vessel)
    const fast = hullForces({ ...initialManoeuvreState(), surge: 1.5 }, vessel)
    expect(slow.surgeForce).toBeLessThan(0)
    expect(fast.surgeForce).toBeLessThan(slow.surgeForce)
  })

  it('damps sway and yaw while coupling both degrees of freedom', () => {
    const result = hullForces({ ...initialManoeuvreState(), sway: .4, yawRate: .08 }, vessel)
    expect(result.swayForce).toBeLessThan(0)
    expect(result.yawMoment).toBeLessThan(0)
  })

  it('reverses resistance with reversed motion', () => {
    const result = hullForces({ ...initialManoeuvreState(), surge: -.8, sway: -.25, yawRate: -.05 }, vessel)
    expect(result.surgeForce).toBeGreaterThan(0)
    expect(result.swayForce).toBeGreaterThan(0)
    expect(result.yawMoment).toBeGreaterThan(0)
  })
})
