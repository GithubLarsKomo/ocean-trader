import { describe, expect, it } from 'vitest'
import { initialManoeuvreState } from '../state'
import { VESSEL_PARAMETERS } from '../vessel-parameters'
import { rudderForces } from './rudder'

describe('P5.3-B rudder forces', () => {
  const vessel = VESSEL_PARAMETERS.handysize

  it('produces no force without ship flow or propeller wash', () => {
    const result = rudderForces(initialManoeuvreState(), 1, 0, vessel)
    expect(result.effectiveFlow).toBe(0)
    expect(result.swayForce).toBe(0)
    expect(result.yawMoment).toBe(0)
  })

  it('uses ahead propeller wash and turns positive/STBD helm to starboard', () => {
    const result = rudderForces(initialManoeuvreState(), 1, .3, vessel)
    expect(result.effectiveFlow).toBeGreaterThan(0)
    // Internal +sway/+yaw is PORT, so STBD helm must create the opposite yaw.
    expect(result.swayForce).toBeGreaterThan(0)
    expect(result.yawMoment).toBeLessThan(0)
  })

  it('reverses rudder yaw sense with astern water flow', () => {
    const state = { ...initialManoeuvreState(), surge: -.5 }
    const result = rudderForces(state, 1, -.3, vessel)
    expect(result.yawMoment).toBeGreaterThan(0)
  })
})
