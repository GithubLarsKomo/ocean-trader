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
  it('restores manoeuvre, controls and accumulated damage', () => {
    const storage = memoryStorage()
    const state = { ...initialManoeuvreState(87), x: 12, y: -4, surge: .3, heading: .4 }
    const operation = { ...initialHarbourOperationState(), collisions: 2, damage: 4.5, contactActive: true }
    saveHarbourAttempt(storage, { version: 1, vesselId: 'v-1', state, operation, input: { throttle: .12, rudder: -.4 } })
    expect(loadHarbourAttempt(storage, 'v-1')).toEqual({ version: 1, vesselId: 'v-1', state, operation, input: { throttle: .12, rudder: -.4 } })
  })

  it('clears only after explicit completion', () => {
    const storage = memoryStorage()
    saveHarbourAttempt(storage, { version: 1, vesselId: 'v-1', state: initialManoeuvreState(), operation: initialHarbourOperationState(), input: { throttle: 0, rudder: 0 } })
    expect(storage.getItem(attemptKey('v-1'))).not.toBeNull()
    clearHarbourAttempt(storage, 'v-1')
    expect(loadHarbourAttempt(storage, 'v-1')).toBeNull()
  })
})
