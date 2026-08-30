import { describe, expect, it } from 'vitest'
import { acceptContract, advanceVoyageDay, createInitialState } from '../domain'
import { saveState } from '../storage'
import { loadCampaignArrival, settleCampaignArrival, simulationLoadForArrival } from './campaign'

class MemoryStorage {
  private data = new Map<string, string>()
  getItem(key: string) { return this.data.get(key) ?? null }
  setItem(key: string, value: string) { this.data.set(key, value) }
}

function arrivalState() {
  let state = createInitialState()
  state = acceptContract(state, 'ot-vessel-001', 'C-HAM-RTM-001')
  state = advanceVoyageDay(state, 'ot-vessel-001')
  state = advanceVoyageDay(state, 'ot-vessel-001')
  return state
}

describe('P6 campaign arrival adapter', () => {
  it('loads an arrival pending vessel from the campaign save', () => {
    const storage = new MemoryStorage()
    saveState(storage, arrivalState())
    const arrival = loadCampaignArrival(storage, 'ot-vessel-001')
    expect(arrival?.vesselName).toBe('MS Pioneer')
    expect(arrival?.destination).toBe('RTM')
    expect(arrival?.loadRatio).toBeCloseTo(5500 / 18000)
    expect(simulationLoadForArrival(arrival!).draftMeters).toBeGreaterThan(0)
  })

  it('rejects a vessel without a pending harbour arrival', () => {
    const storage = new MemoryStorage()
    saveState(storage, createInitialState())
    expect(loadCampaignArrival(storage, 'ot-vessel-001')).toBeNull()
  })

  it('settles the existing campaign voyage exactly through the domain function', () => {
    const storage = new MemoryStorage()
    const before = arrivalState()
    saveState(storage, before)
    const cashBefore = before.cash
    const settled = settleCampaignArrival(storage, 'ot-vessel-001', 79)
    const vessel = settled.vessels.find(v => v.id === 'ot-vessel-001')!
    expect(settled.voyages.some(v => v.vesselId === vessel.id)).toBe(false)
    expect(vessel.currentPort).toBe('RTM')
    expect(vessel.condition).toBeLessThanOrEqual(79)
    expect(settled.completedContracts).toContain('C-HAM-RTM-001')
    expect(settled.cash).not.toBe(cashBefore)
  })
})
