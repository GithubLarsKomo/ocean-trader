import { describe, expect, it } from 'vitest'
import { initialManoeuvreState } from '../simulation/state'
import { detectHarbourCollision, resolveHarbourCollision } from './collision'
import { ROTTERDAM_P5 } from './rotterdam'

function atWorld(x: number, z: number) {
  return {
    ...initialManoeuvreState(),
    x: (x - ROTTERDAM_P5.spawn.x) / ROTTERDAM_P5.renderScale,
    y: (z - ROTTERDAM_P5.spawn.z) / ROTTERDAM_P5.renderScale,
    surge: 1.4,
  }
}

describe('P5 harbour collisions', () => {
  it('treats navigation buoys as solid obstacles', () => {
    const state = atWorld(-12, -4.5)
    expect(detectHarbourCollision(state, ROTTERDAM_P5)?.kind).toBe('buoy')
  })

  it('detects quay contact', () => {
    const state = atWorld(25, -15)
    expect(detectHarbourCollision(state, ROTTERDAM_P5)?.kind).toBe('quay')
  })

  it('does not collide in the clear approach channel', () => {
    const state = atWorld(-25, 4)
    expect(detectHarbourCollision(state, ROTTERDAM_P5)).toBeNull()
  })

  it('damages and rebounds the vessel after contact', () => {
    const previous = atWorld(-13.3, -4.5)
    const attempted = atWorld(-12, -4.5)
    const collision = detectHarbourCollision(attempted, ROTTERDAM_P5)
    expect(collision).not.toBeNull()
    const resolved = resolveHarbourCollision(previous, attempted, collision!)
    expect(resolved.condition).toBeLessThan(previous.condition)
    expect(resolved.surge).toBeLessThanOrEqual(0)
    expect(resolved.x).toBe(previous.x)
  })
})
