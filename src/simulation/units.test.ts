import { describe, expect, it } from 'vitest'
import { calmEnvironment, initialManoeuvreState } from './state'
import { environmentVectors, maritimeBearingDeg, maritimeRotDegPerMin, navigationMetrics, vectorFromBearing } from './units'

describe('P5.3-E navigation units', () => {
  it('maps clockwise maritime bearings into simulator world vectors', () => {
    expect(vectorFromBearing(2, 0).x).toBeCloseTo(2)
    expect(vectorFromBearing(2, 0).y).toBeCloseTo(0)
    expect(vectorFromBearing(2, 90).x).toBeCloseTo(0, 12)
    expect(vectorFromBearing(2, 90).y).toBeCloseTo(-2)
  })

  it('converts simulator port-positive angles to clockwise HDG/ROT', () => {
    expect(maritimeBearingDeg(-Math.PI / 2)).toBeCloseTo(90)
    expect(maritimeBearingDeg(Math.PI / 2)).toBeCloseTo(270)
    expect(maritimeRotDegPerMin(-Math.PI / 180 / 60)).toBeCloseTo(1)
  })

  it('treats wind as FROM and current as TO', () => {
    const vectors = environmentVectors({ windSpeedMps: 10, windFromDeg: 270, currentSpeedMps: .5, currentToDeg: 90 })
    expect(vectors.windWorldX).toBeCloseTo(0, 12)
    expect(vectors.windWorldY).toBeCloseTo(-10)
    expect(vectors.currentWorldX).toBeCloseTo(0, 12)
    expect(vectors.currentWorldY).toBeCloseTo(-.5)
  })

  it('separates STW from SOG and COG under starboard cross-current', () => {
    const state = { ...initialManoeuvreState(), surge: 2 }
    const calm = navigationMetrics(state, calmEnvironment)
    const current = navigationMetrics(state, { currentSpeedMps: .5, currentToDeg: 90 })
    expect(calm.stwMps).toBeCloseTo(2)
    expect(current.stwMps).toBeCloseTo(2)
    expect(current.sogMps).toBeGreaterThan(current.stwMps)
    expect(current.cogDeg).toBeGreaterThan(0)
    expect(current.cogDeg).toBeLessThan(90)
  })

  it('keeps legacy vector fields available during migration', () => {
    const vectors = environmentVectors({ ...calmEnvironment, windY: .12, currentX: .03, currentY: -.02 })
    expect(vectors.windWorldY).toBeCloseTo(.12)
    expect(vectors.currentWorldX).toBeCloseTo(.03)
    expect(vectors.currentWorldY).toBeCloseTo(-.02)
  })
})
