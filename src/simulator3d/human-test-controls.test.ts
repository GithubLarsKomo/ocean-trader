import { describe, expect, it } from 'vitest'
import { neutralBridgeInput, rudderPresentation, startGateMessage } from './human-test-controls'

describe('P5.3-H1 human-test controls', () => {
  it('uses one positive-STBD convention for HUD, gauge and renderer adapter', () => {
    const stbd = rudderPresentation(1)
    expect(stbd.side).toBe('STBD')
    expect(stbd.label).toBe('STBD 35°')
    expect(stbd.cssRotationDeg).toBe(35)
    expect(stbd.rendererRudderInput).toBe(-1)

    const port = rudderPresentation(-1)
    expect(port.side).toBe('PORT')
    expect(port.label).toBe('PORT 35°')
    expect(port.cssRotationDeg).toBe(-35)
    expect(port.rendererRudderInput).toBe(1)
  })

  it('normalizes MIDSHIPS and clamps invalid/out-of-range commands', () => {
    expect(rudderPresentation(0).label).toBe('MID')
    expect(rudderPresentation(.01).label).toBe('MID')
    expect(rudderPresentation(5).normalized).toBe(1)
    expect(rudderPresentation(-5).normalized).toBe(-1)
    expect(rudderPresentation(Number.NaN).normalized).toBe(0)
  })

  it('restores a page with neutral bridge commands', () => {
    expect(neutralBridgeInput()).toEqual({ engineOrder: 'STOP', rudder: 0, bowThruster: 0 })
  })

  it('makes the page-load pause explicit for fresh and restored manoeuvres', () => {
    expect(startGateMessage(false)).toContain('BRIDGE READY')
    expect(startGateMessage(true)).toContain('PAUSED')
    expect(startGateMessage(true)).toContain('restored')
  })
})
