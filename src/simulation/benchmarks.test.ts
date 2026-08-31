import { describe, expect, it } from 'vitest'
import {
  accelerationBenchmark,
  crashStopBenchmark,
  hardTurnBenchmark,
  lowSpeedRudderBenchmark,
  residualYawBenchmark,
  reversePropWalkBenchmark,
  windDriftBenchmark,
} from './benchmarks'

describe('P4/P5.3 manoeuvre benchmarks', () => {
  it('keeps acceleration hierarchy plausible', () => {
    const coaster = accelerationBenchmark('coaster')
    const panamax = accelerationBenchmark('panamax')
    expect(coaster.metrics.finalSurge).toBeGreaterThan(panamax.metrics.finalSurge)
    expect(coaster.metrics.distance).toBeGreaterThan(panamax.metrics.distance)
  })

  it('makes Panamax slower to turn than Coaster', () => {
    const coaster = hardTurnBenchmark('coaster')
    const panamax = hardTurnBenchmark('panamax')
    expect(coaster.metrics.headingChange).toBeGreaterThan(panamax.metrics.headingChange)
    expect(coaster.metrics.maxYawRate).toBeGreaterThan(panamax.metrics.maxYawRate)
  })

  it('makes laden Panamax harder to stop than laden Coaster', () => {
    const coaster = crashStopBenchmark('coaster', 1)
    const panamax = crashStopBenchmark('panamax', 1)
    expect(panamax.metrics.stopTime).toBeGreaterThan(coaster.metrics.stopTime)
    expect(panamax.metrics.stopDistance).toBeGreaterThan(coaster.metrics.stopDistance)
  })

  it('produces reverse prop walk without rudder input', () => {
    const result = reversePropWalkBenchmark('handysize')
    expect(result.metrics.headingChange).toBeGreaterThan(.01)
    expect(result.metrics.lateralOffset).toBeGreaterThan(0)
  })

  it('makes high-windage feeder drift more than coaster', () => {
    const coaster = windDriftBenchmark('coaster', .5)
    const feeder = windDriftBenchmark('feeder', .5)
    expect(feeder.metrics.lateralOffset).toBeGreaterThan(coaster.metrics.lateralOffset)
  })

  it('shows measurable load effect in the same vessel class', () => {
    const empty = accelerationBenchmark('handysize', 0)
    const laden = accelerationBenchmark('handysize', 1)
    expect(empty.metrics.finalSurge).toBeGreaterThan(laden.metrics.finalSurge)
    expect(empty.metrics.distance).toBeGreaterThan(laden.metrics.distance)
  })

  it('captures rudder authority from propeller wash at low speed', () => {
    const result = lowSpeedRudderBenchmark('handysize')
    expect(result.metrics.noFlowHeadingChange).toBeLessThan(1e-10)
    expect(result.metrics.washHeadingChange).toBeGreaterThan(.01)
    expect(result.metrics.washSway).toBeGreaterThan(0)
  })

  it('captures residual yaw and faster damping with counter-rudder', () => {
    const result = residualYawBenchmark('handysize')
    expect(result.metrics.turnYawRate).toBeGreaterThan(1e-4)
    expect(result.metrics.coastYawRate).toBeLessThan(result.metrics.turnYawRate)
    expect(result.metrics.counterYawRate).toBeLessThan(result.metrics.coastYawRate)
  })
})
