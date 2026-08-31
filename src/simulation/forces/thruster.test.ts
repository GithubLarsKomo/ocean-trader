import { describe, expect, it } from 'vitest'
import { initialManoeuvreState } from '../state'
import { VESSEL_PARAMETERS } from '../vessel-parameters'
import { bowThrusterEffectiveness, bowThrusterForces } from './thruster'

const MPS_PER_KNOT = 1 / 1.9438444924406

describe('P5.3-C bow thruster', () => {
  it('matches the low-speed effectiveness curve', () => {
    expect(bowThrusterEffectiveness(0, 5)).toBeCloseTo(1)
    expect(bowThrusterEffectiveness(2, 5)).toBeCloseTo(.6)
    expect(bowThrusterEffectiveness(4, 5)).toBeCloseTo(.15)
    expect(bowThrusterEffectiveness(5, 5)).toBe(0)
    expect(bowThrusterEffectiveness(7, 5)).toBe(0)
  })

  it('pushes the bow and creates yaw in the commanded direction', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const force = bowThrusterForces(initialManoeuvreState(), 1, vessel)
    expect(force.swayForce).toBeGreaterThan(0)
    expect(force.yawMoment).toBeGreaterThan(0)
    expect(force.effectiveness).toBe(1)
  })

  it('has only about fifteen percent authority at four knots and none at five', () => {
    const vessel = VESSEL_PARAMETERS.handysize
    const stopped = bowThrusterForces(initialManoeuvreState(), 1, vessel)
    const fourKnots = bowThrusterForces({ ...initialManoeuvreState(), surge: 4 * MPS_PER_KNOT }, 1, vessel)
    const fiveKnots = bowThrusterForces({ ...initialManoeuvreState(), surge: 5 * MPS_PER_KNOT }, 1, vessel)
    expect(fourKnots.swayForce / stopped.swayForce).toBeCloseTo(.15, 5)
    expect(fiveKnots.swayForce).toBe(0)
    expect(fiveKnots.yawMoment).toBe(0)
  })
})
