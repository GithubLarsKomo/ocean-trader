import { describe, expect, it } from 'vitest'
import { beamWindDriftBenchmark, crossCurrentBenchmark } from './environment-benchmarks'

describe('P5.3-E environment acceptance', () => {
  it('AT-09: an unloaded high-windage Feeder drifts materially more than the loaded reference', () => {
    const empty = beamWindDriftBenchmark('feeder', 0)
    const laden = beamWindDriftBenchmark('feeder', 1)
    expect(empty.lateralOffsetMeters).toBeGreaterThan(laden.lateralOffsetMeters * 1.25)
    expect(empty.finalSwayMps).toBeGreaterThan(laden.finalSwayMps * 1.25)
    expect(empty.headingChangeDeg).toBeGreaterThan(1)
    expect(laden.headingChangeDeg).toBeGreaterThan(1)
  })

  it('AT-09: Feeder remains more wind-sensitive than Handysize at equal loading', () => {
    const handysize = beamWindDriftBenchmark('handysize', .5)
    const feeder = beamWindDriftBenchmark('feeder', .5)
    expect(feeder.lateralOffsetMeters).toBeGreaterThan(handysize.lateralOffsetMeters)
  })

  it('AT-09: current changes SOG/COG without artificial hydrodynamic yaw or body acceleration', () => {
    const result = crossCurrentBenchmark(.5)
    expect(result.currentNav.stwMps).toBeCloseTo(result.calmNav.stwMps, 12)
    expect(result.currentNav.sogMps).toBeGreaterThan(result.calmNav.sogMps)
    expect(result.currentNav.cogDeg).toBeGreaterThan(result.calmNav.cogDeg)
    expect(result.yawDelta).toBeCloseTo(0, 12)
    expect(result.surgeDelta).toBeCloseTo(0, 12)
    expect(result.swayDelta).toBeCloseTo(0, 12)
  })
})
