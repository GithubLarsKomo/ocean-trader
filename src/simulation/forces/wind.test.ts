import { describe, expect, it } from 'vitest'
import { initialManoeuvreState } from '../state'
import { VESSEL_PARAMETERS } from '../vessel-parameters'
import { windForces } from './wind'

describe('P5.3-E wind forces', () => {
  const vessel = VESSEL_PARAMETERS.handysize

  it('produces no aerodynamic load in still air on a stationary vessel', () => {
    const result = windForces(initialManoeuvreState(), { windSpeedMps: 0, windFromDeg: 0 }, vessel)
    expect(result.swayForce).toBeCloseTo(0)
    expect(result.yawMoment).toBeCloseTo(0)
  })

  it('produces starboard sway and opposing yaw from a port beam wind', () => {
    const result = windForces(initialManoeuvreState(), { windSpeedMps: 10, windFromDeg: 270 }, vessel)
    expect(result.apparentLateralMps).toBeLessThan(-9.9)
    expect(result.swayForce).toBeLessThan(0)
    expect(result.yawMoment).toBeGreaterThan(0)
  })

  it('uses relative rather than true wind while the vessel is moving into a headwind', () => {
    const stopped = windForces(initialManoeuvreState(), { windSpeedMps: 8, windFromDeg: 0 }, vessel)
    const moving = windForces({ ...initialManoeuvreState(), surge: 3 }, { windSpeedMps: 8, windFromDeg: 0 }, vessel)
    expect(moving.apparentSpeedMps).toBeGreaterThan(stopped.apparentSpeedMps)
  })
})
