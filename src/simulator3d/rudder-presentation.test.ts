import { describe, expect, it } from 'vitest'
import { rudderPresentation } from './rudder-presentation'

describe('rudder presentation', () => {
  it('maps positive helm consistently to starboard in HUD, CSS and vessel coordinates', () => {
    const presentation = rudderPresentation(1)
    expect(presentation.side).toBe('STBD')
    expect(presentation.label).toBe('STBD 35°')
    expect(presentation.cssRotationDeg).toBe(-35)
    expect(presentation.meshRotationRad).toBeCloseTo(35 * Math.PI / 180)
  })

  it('maps negative helm consistently to port', () => {
    const presentation = rudderPresentation(-1)
    expect(presentation.side).toBe('PORT')
    expect(presentation.label).toBe('PORT 35°')
    expect(presentation.cssRotationDeg).toBe(35)
    expect(presentation.meshRotationRad).toBeCloseTo(-35 * Math.PI / 180)
  })

  it('treats centered helm as midships and clamps presentation input', () => {
    expect(rudderPresentation(0).label).toBe('MID')
    expect(rudderPresentation(2).normalized).toBe(1)
    expect(rudderPresentation(-2).normalized).toBe(-1)
  })
})
