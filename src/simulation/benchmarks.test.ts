import { describe, expect, it } from 'vitest'
import {
  accelerationBenchmark,
  bowThrusterBenchmark,
  crashStopBenchmark,
  harbourResponseBenchmark,
  hardTurnBenchmark,
  lowSpeedRudderBenchmark,
  lowSpeedTurnBenchmark,
  normalizedCrashStopBenchmark,
  residualYawBenchmark,
  reversePropWalkBenchmark,
  windDriftBenchmark,
} from './benchmarks'
import type { SimulationVesselClass } from './vessel-parameters'

const classes: SimulationVesselClass[] = ['coaster', 'handysize', 'feeder', 'panamax']

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

  it('produces correctly directed reverse prop walk without rudder input', () => {
    const result = reversePropWalkBenchmark('handysize')
    expect(result.metrics.headingChange).toBeGreaterThan(.01)
    expect(result.metrics.lateralOffset).toBeGreaterThan(0)
    // Right-handed screw astern: stern walks PORT (+internal sway), bow yaws STBD (-internal heading).
    expect(result.metrics.signedHeading).toBeLessThan(0)
    expect(result.metrics.signedSway).toBeGreaterThan(0)
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

  it('captures useful bow-thruster authority at harbour speed', () => {
    const result = bowThrusterBenchmark('handysize')
    expect(result.metrics.headingChange).toBeGreaterThan(.01)
    expect(result.metrics.lateralOffset).toBeGreaterThan(0)
    expect(result.metrics.maxYawRate).toBeGreaterThan(1e-4)
  })

  it('AT-07: class response, low-speed turn and normalized stopping form a stable hierarchy', () => {
    const response = classes.map(vesselClass => harbourResponseBenchmark(vesselClass, .5).metrics.distance)
    const turn = classes.map(vesselClass => lowSpeedTurnBenchmark(vesselClass, .5).metrics.headingChange)
    const stop = classes.map(vesselClass => normalizedCrashStopBenchmark(vesselClass, 1).metrics.stopDistance)

    for (let i = 0; i < classes.length - 1; i += 1) {
      expect(response[i]).toBeGreaterThan(response[i + 1])
      expect(turn[i]).toBeGreaterThan(turn[i + 1])
      expect(stop[i]).toBeLessThan(stop[i + 1])
    }

    expect(stop[3]).toBeGreaterThanOrEqual(stop[0] * 1.8)
  })

  it('AT-07: Handysize remains between Coaster and Feeder as the reference class', () => {
    const coaster = harbourResponseBenchmark('coaster', .5)
    const handysize = harbourResponseBenchmark('handysize', .5)
    const feeder = harbourResponseBenchmark('feeder', .5)
    const panamax = harbourResponseBenchmark('panamax', .5)

    expect(coaster.metrics.distance).toBeGreaterThan(handysize.metrics.distance)
    expect(handysize.metrics.distance).toBeGreaterThan(feeder.metrics.distance)
    expect(feeder.metrics.distance).toBeGreaterThan(panamax.metrics.distance)
  })

  it('AT-08: loading measurably changes response, stopping and turn behaviour for every class', () => {
    for (const vesselClass of classes) {
      const emptyResponse = harbourResponseBenchmark(vesselClass, 0)
      const ladenResponse = harbourResponseBenchmark(vesselClass, 1)
      const emptyStop = normalizedCrashStopBenchmark(vesselClass, 0)
      const ladenStop = normalizedCrashStopBenchmark(vesselClass, 1)
      const emptyTurn = lowSpeedTurnBenchmark(vesselClass, 0)
      const ladenTurn = lowSpeedTurnBenchmark(vesselClass, 1)

      expect(emptyResponse.metrics.distance).toBeGreaterThan(ladenResponse.metrics.distance * 1.3)
      expect(ladenStop.metrics.stopDistance).toBeGreaterThan(emptyStop.metrics.stopDistance * 1.2)
      expect(emptyTurn.metrics.headingChange).toBeGreaterThan(ladenTurn.metrics.headingChange * 1.15)
    }
  })

  it('AT-08: Handysize reference load effect has comfortable calibration margin', () => {
    const emptyResponse = harbourResponseBenchmark('handysize', 0)
    const ladenResponse = harbourResponseBenchmark('handysize', 1)
    const emptyStop = normalizedCrashStopBenchmark('handysize', 0)
    const ladenStop = normalizedCrashStopBenchmark('handysize', 1)
    const emptyTurn = lowSpeedTurnBenchmark('handysize', 0)
    const ladenTurn = lowSpeedTurnBenchmark('handysize', 1)

    expect(emptyResponse.metrics.distance).toBeGreaterThan(ladenResponse.metrics.distance * 1.5)
    expect(ladenStop.metrics.stopDistance).toBeGreaterThan(emptyStop.metrics.stopDistance * 1.3)
    expect(emptyTurn.metrics.headingChange).toBeGreaterThan(ladenTurn.metrics.headingChange * 1.4)
  })
})
