import { describe, expect, it } from 'vitest'
import { initialManoeuvreState } from '../simulation/state'
import { attemptKey, clearHarbourAttempt, loadHarbourAttempt, saveHarbourAttempt } from './attempt'
import { initialHarbourOperationState } from './operations'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  }
}

describe('harbour attempt persistence', () => {
  it('restores manoeuvre, telegraph controls and accumulated damage', () => {
    const storage = memoryStorage()
    const state = { ...initialManoeuvreState(87), x: 12, y: -4, surge: .3, heading: .4, engineOrder: 'SLOW_AHEAD' as const, shaftDemand: .3, shaftActual: .21 }
    const operation = { ...initialHarbourOperationState(), collisions: 2, damage: 4.5, contactActive: true }
    const input = { engineOrder: 'SLOW_AHEAD' as const, rudder: -.4 }
    saveHarbourAttempt(storage, { version: 2, vesselId: 'v-1', state, operation, input })
    expect(loadHarbourAttempt(storage, 'v-1')).toEqual({ version: 2, vesselId: 'v-1', state, operation, input })
  })

  it('migrates a v1 throttle attempt without losing motion', () => {
    const storage = memoryStorage()
    storage.setItem('ocean-trader.harbour-attempt.v1:v-old', JSON.stringify({
      version: 1,
      vesselId: 'v-old',
      state: { x: 8, y: 3, heading: .2, surge: .4, sway: .02, yawRate: .01, throttle: .3, condition: 91, elapsed: 12 },
      operation: initialHarbourOperationState(),
      input: { throttle: .3, rudder: .2 },
    }))
    const restored = loadHarbourAttempt(storage, 'v-old')
    expect(restored?.version).toBe(2)
    expect(restored?.input).toEqual({ engineOrder: 'SLOW_AHEAD', rudder: .2 })
    expect(restored?.state.engineOrder).toBe('SLOW_AHEAD')
    expect(restored?.state.shaftActual).toBeCloseTo(.3)
    expect(restored?.state.surge).toBeCloseTo(.4)
  })

  it('clears both current and legacy attempts only after explicit completion', () => {
    const storage = memoryStorage()
    saveHarbourAttempt(storage, { version: 2, vesselId: 'v-1', state: initialManoeuvreState(), operation: initialHarbourOperationState(), input: { engineOrder: 'STOP', rudder: 0 } })
    storage.setItem('ocean-trader.harbour-attempt.v1:v-1', '{}')
    expect(storage.getItem(attemptKey('v-1'))).not.toBeNull()
    clearHarbourAttempt(storage, 'v-1')
    expect(loadHarbourAttempt(storage, 'v-1')).toBeNull()
    expect(storage.getItem('ocean-trader.harbour-attempt.v1:v-1')).toBeNull()
  })
})
