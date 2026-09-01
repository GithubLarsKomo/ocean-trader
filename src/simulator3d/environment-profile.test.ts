import { describe, expect, it } from 'vitest'
import { environmentVectors } from '../simulation/units'
import { BASELINE_HARBOUR_ENVIRONMENT, CROSS_HARBOUR_ENVIRONMENT, selectHarbourEnvironment } from './environment-profile'

describe('P5.3 human-test environment profiles', () => {
  it('keeps the default and campaign baseline free of cross-track drift', () => {
    expect(selectHarbourEnvironment(null, false).mode).toBe('baseline')
    expect(selectHarbourEnvironment('cross', true).mode).toBe('baseline')
    const vectors = environmentVectors(BASELINE_HARBOUR_ENVIRONMENT)
    expect(vectors.currentWorldX).toBeCloseTo(0)
    expect(vectors.currentWorldY).toBeCloseTo(0)
    expect(vectors.windWorldX).toBeCloseTo(0)
    expect(vectors.windWorldY).toBeCloseTo(0)
  })

  it('keeps the original cross forcing available only as explicit standalone stress test', () => {
    const selected = selectHarbourEnvironment('cross', false)
    expect(selected.mode).toBe('cross')
    expect(selected.environment).toEqual(CROSS_HARBOUR_ENVIRONMENT)
    const vectors = environmentVectors(selected.environment)
    expect(Math.abs(vectors.currentWorldY)).toBeGreaterThan(Math.abs(vectors.currentWorldX) * 3)
  })
})
